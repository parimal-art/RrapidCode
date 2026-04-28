const Problem = require("../models/problem.js");
const Submission = require("../models/submission.js");
const User = require("../models/user.js");
const { submitBatch, submitToken } = require("../utils/batchsubmission.js");
const getLanguageById = require("../utils/problem_lanuageID.js");

const SubmitCode = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized. User not found on request.' });
    }

    const userId = req.user._id;
    const problemId = String(req.params.id || '').trim();
    let { code, language } = req.body || {};

    // ── FIX 2a: Validate that code is not empty/whitespace ────────────────────
    // Previously, empty code went through Judge0 and (if invisibleTestCase was
    // also empty) was instantly marked "accepted". Now we reject blank submissions.
    if (!userId || !problemId || !language) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, problemId, code, or language'
      });
    }

    if (!code || String(code).trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Code cannot be empty. Please write your solution before submitting.'
      });
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Normalize language alias before validation
    if (typeof language === 'string') {
      language = language.toLowerCase();
      if (language === 'cpp') language = 'c++';
      if (language === 'py') language = 'python';
    }

    // Validate language
    const validLanguages = ['c++', 'c', 'java', 'python'];
    if (!validLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid language. Supported languages: c++, c, java, python'
      });
    }

    // Fetch problem from database
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    // Ensure invisibleTestCase is an array
    const invisibleTests = Array.isArray(problem.invisibleTestCase) ? problem.invisibleTestCase : [];

    // ── FIX 2b: Remove the false-accept shortcut for empty invisibleTestCase ──
    // The old code immediately returned "accepted" when there were no hidden
    // test cases — even for completely empty/wrong submissions. Now we always
    // run at least the visible test cases so the result is meaningful.
    if (invisibleTests.length === 0) {
      // Fall back to visible test cases so we have something real to judge
      const visibleTests = Array.isArray(problem.visibleTestCase) ? problem.visibleTestCase : [];

      if (visibleTests.length === 0) {
        // Truly no test cases at all — create a pending submission and tell the admin
        const submission = await Submission.create({
          userId, problemId, code, language,
          status: 'pending',
          testCasesTotal: 0,
          errorMessage: 'No test cases configured for this problem.'
        });
        return res.status(200).json({
          success: false,
          message: 'No test cases configured for this problem. Please contact admin.',
          data: { submissionId: submission._id, status: 'pending', testCasesPassed: 0, testCasesTotal: 0 }
        });
      }

      // Run against visible test cases as a proxy
      const languageId = getLanguageById(language);
      const judgeSubmissions = visibleTests.map((test) => ({
        source_code: code,
        language_id: languageId,
        stdin: test.input || '',
        expected_output: typeof test.output !== 'undefined' ? String(test.output) : ''
      }));

      const submission = await Submission.create({
        userId, problemId, code, language,
        status: 'pending',
        testCasesTotal: visibleTests.length
      });

      let testResults = [];
      try {
        const submitResult = await submitBatch(judgeSubmissions);
        const resultTokens = (Array.isArray(submitResult) ? submitResult : [])
          .map((v) => v.token).filter(Boolean);
        if (resultTokens.length === 0) throw new Error('Judge0 batch submission returned no tokens');
        testResults = await submitToken(resultTokens);
      } catch (judgeErr) {
        submission.status = 'error';
        submission.errorMessage = judgeErr.message || 'Judge0 submission failed';
        await submission.save();
        return res.status(500).json({
          success: false,
          message: 'Judge0 submission failed',
          error: submission.errorMessage,
          data: { submissionId: submission._id }
        });
      }

      let passedCount = 0, totalRuntime = 0, maxMemory = 0;
      let finalStatus = 'accepted', errorMessage = '';
      for (const test of testResults) {
        const statusId = test?.status?.id || test?.status_id || null;
        if (statusId === 3) {
          passedCount++;
          totalRuntime += parseFloat(test.time) || 0;
          maxMemory = Math.max(maxMemory, Number(test.memory) || 0);
        } else {
          finalStatus = statusId === 4 ? 'error' : 'wrong';
          errorMessage = test.stderr || test.compile_output || (test?.status?.description || 'Execution failed');
          totalRuntime += parseFloat(test.time) || 0;
          maxMemory = Math.max(maxMemory, Number(test.memory) || 0);
          break;
        }
      }

      submission.status = finalStatus;
      submission.runtime = totalRuntime;
      submission.memory = maxMemory;
      submission.testCasesPassed = passedCount;
      submission.errorMessage = String(errorMessage || '');
      await submission.save();

      if (submission.status === 'accepted') {
        await addProblemToUserSolved(req.user, problemId);
      }

      return res.status(200).json({
        success: finalStatus === 'accepted',
        message: finalStatus === 'accepted' ? 'Code submitted successfully' : 'Some test cases failed',
        data: {
          submissionId: submission._id,
          status: finalStatus,
          testCasesPassed: passedCount,
          testCasesTotal: visibleTests.length,
          runtime: totalRuntime,
          memory: maxMemory
        }
      });
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Create initial submission record
    const submission = await Submission.create({
      userId, problemId, code, language,
      status: 'pending',
      testCasesTotal: invisibleTests.length
    });

    // Prepare submissions for Judge0
    const languageId = getLanguageById(language);
    const judgeSubmissions = invisibleTests.map((test) => ({
      source_code: code,
      language_id: languageId,
      stdin: test.input || '',
      expected_output: (typeof test.output !== 'undefined') ? String(test.output) : ''
    }));

    // Submit to Judge0
    let testResults = [];
    try {
      const submitResult = await submitBatch(judgeSubmissions);
      const resultTokens = (Array.isArray(submitResult) ? submitResult : [])
        .map((v) => v.token).filter(Boolean);
      if (resultTokens.length === 0) throw new Error('Judge0 batch submission returned no tokens');
      testResults = await submitToken(resultTokens);
    } catch (judgeErr) {
      submission.status = 'error';
      submission.errorMessage = judgeErr.message || 'Judge0 submission failed';
      await submission.save();
      return res.status(500).json({
        success: false,
        message: 'Judge0 submission failed',
        error: submission.errorMessage,
        data: { submissionId: submission._id }
      });
    }

    // Process test results
    let passedCount = 0, totalRuntime = 0, maxMemory = 0;
    let finalStatus = 'accepted', errorMessage = '';

    for (const test of testResults) {
      const statusId = test?.status?.id || test?.status_id || null;
      if (statusId === 3) {
        passedCount++;
        totalRuntime += parseFloat(test.time) || 0;
        maxMemory = Math.max(maxMemory, Number(test.memory) || 0);
      } else {
        if (statusId === 4) finalStatus = 'error';
        else finalStatus = 'wrong';
        errorMessage = test.stderr || test.compile_output || (test?.status?.description || 'Execution failed');
        totalRuntime += parseFloat(test.time) || 0;
        maxMemory = Math.max(maxMemory, Number(test.memory) || 0);
        break;
      }
    }

    submission.status = finalStatus;
    submission.runtime = totalRuntime;
    submission.memory = maxMemory;
    submission.testCasesPassed = passedCount;
    submission.errorMessage = String(errorMessage || '');
    await submission.save();

    if (submission.status === 'accepted') {
      await addProblemToUserSolved(req.user, problemId);
    }

    return res.status(200).json({
      success: true,
      message: 'Code submitted successfully',
      data: {
        submissionId: submission._id,
        status: finalStatus,
        testCasesPassed: passedCount,
        testCasesTotal: invisibleTests.length,
        runtime: totalRuntime,
        memory: maxMemory
      }
    });

  } catch (error) {
    console.error('SubmitCode Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Helper to add problemId to user's solved array
async function addProblemToUserSolved(userDoc, problemId) {
  try {
    const preferredFields = ['problemSolved', 'problemSolvedd'];
    let field = preferredFields.find((f) => Array.isArray(userDoc[f]));
    if (!field) {
      field = 'problemSolved';
      userDoc[field] = userDoc[field] || [];
    }
    const arr = userDoc[field] = userDoc[field] || [];
    const already = arr.some((id) => String(id) === String(problemId));
    if (!already) {
      arr.push(problemId);
      if (typeof userDoc.save === 'function') {
        await userDoc.save();
      } else {
        await User.findByIdAndUpdate(userDoc._id, { $addToSet: { [field]: problemId } });
      }
    }
  } catch (err) {
    console.error('Failed to add problem to user solved list', err);
  }
}


const RunCode = async (req, res) => {
  try {
    const userId = req.user._id;
    const problemId = req.params.id?.trim();
    const { code, language } = req.body;

    // Input validation
    if (!userId || !problemId || !language) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, problemId, code, or language'
      });
    }

    // ── FIX 2c: Reject empty code on Run too ─────────────────────────────────
    if (!code || String(code).trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Code cannot be empty. Please write something before running.'
      });
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Validate language
    const validLanguages = ['c++', 'c', 'java', 'python'];
    if (!validLanguages.includes(language.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid language. Supported languages: c++, c, java, python'
      });
    }

    // Fetch problem from database
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    // Prepare submissions for Judge0 using visible test cases
    const languageId = getLanguageById(language);

    // ── FIX 2d: Use problem instance, not Problem model ───────────────────────
    // Old code: Problem.visibleTestCase  (undefined — this is the Mongoose Model)
    // Fixed:    problem.visibleTestCase  (the actual document fetched above)
    const visibleTests = Array.isArray(problem.visibleTestCase) ? problem.visibleTestCase : [];

    const judgeSubmissions = visibleTests.map((test) => ({
      source_code: code,
      language_id: languageId,
      stdin: test.input || '',
      expected_output: typeof test.output !== 'undefined' ? String(test.output) : ''
    }));
    // ─────────────────────────────────────────────────────────────────────────

    // Submit to Judge0
    const submitResult = await submitBatch(judgeSubmissions);
    const resultTokens = submitResult.map((value) => value.token);
    const testResults = await submitToken(resultTokens);

    // ── FIX 2e: Compute runtime/memory from the actual results array ──────────
    // Old code: testResults.totalRuntime / testResults.maxMemory
    //           (testResults is an array — those props were always undefined)
    let totalRuntime = 0;
    let maxMemory = 0;
    let allPassed = true;
    let errorMessage = '';

    const processedCases = testResults.map((test, i) => {
      const statusId = test?.status?.id || test?.status_id || null;
      const passed = statusId === 3;
      if (passed) {
        totalRuntime += parseFloat(test.time) || 0;
        maxMemory = Math.max(maxMemory, Number(test.memory) || 0);
      } else {
        allPassed = false;
        if (!errorMessage) {
          errorMessage = test.stderr || test.compile_output || (test?.status?.description || 'Execution failed');
        }
      }
      return {
        stdin: visibleTests[i]?.input,
        stdout: test.stdout,
        expected_output: visibleTests[i]?.output,
        status_id: statusId,
        time: test.time,
        memory: test.memory
      };
    });
    // ─────────────────────────────────────────────────────────────────────────

    return res.status(200).json({
      success: allPassed,
      message: allPassed ? 'All visible test cases passed' : 'Some test cases failed',
      runtime: totalRuntime,
      memory: maxMemory,
      error: allPassed ? undefined : errorMessage,
      testCases: processedCases
    });

  } catch (error) {
    console.error('Error in RunCode:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


module.exports = { SubmitCode, RunCode };