const Problem = require("../models/problem.js");
const Submission = require("../models/submission.js");
const User = require("../models/user.js");
const { submitBatch, submitToken } = require("../utils/batchsubmission.js");
const getLanguageById = require("../utils/problem_lanuageID.js");

// const SubmitCode = async (req, res) => {
//     try {
//         const userId = req.user._id;
//         const problemId = req.params.id?.trim();
//         let { code, language } = req.body;

//         // Input validation
//         if (!userId || !problemId || !code || !language) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Missing required fields: userId, problemId, code, or language'
//             });
//         }
//          // Normalize language alias before validation
// if (typeof language === 'string') {
// language = language.toLowerCase();
// if (language === 'cpp') language = 'c++';
// if (language === 'py') language = 'python';
// }


// // Validate language
// const validLanguages = ['c++', 'c', 'java', 'python'];
// if (!validLanguages.includes(language)) {
// return res.status(400).json({
// success: false,
// message: 'Invalid language. Supported languages: c++, c, java, python'
// });
// }
           
                
//         // Fetch problem from database
//         const problem = await Problem.findById(problemId);
//         if (!problem) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Problem not found'
//             });
//         } 
//         // Create initial submission record
//         const submission = await Submission.create({
//             userId,
//             problemId,
//             code,
//             language,
//             status: 'pending',
//             testCasesTotal: problem.invisibleTestCase.length
//         });

//         // Prepare submissions for Judge0
//         const languageId = getLanguageById(language);
//         const judgeSubmissions = problem.invisibleTestCase.map((test) => ({
//             source_code: code,
//             language_id: languageId,
//             stdin: test.input,
//             expected_output: test.output
//         }));

//         // Submit to Judge0
//         const submitResult = await submitBatch(judgeSubmissions);
//         const resultTokens = submitResult.map((value) => value.token);
//         const testResults = await submitToken(resultTokens);

//         // Process test results
//         let passedCount = 0;
//         let totalRuntime = 0;
//         let maxMemory = 0;
//         let finalStatus = 'accepted';
//         let errorMessage = '';

//         for (const test of testResults) {
//             if (test.status_id === 3) { // Accepted
//                 passedCount++;
//                 totalRuntime += parseFloat(test.time) || 0;
//                 maxMemory = Math.max(maxMemory, test.memory || 0);
//             } else {
//                 if (test.status_id === 4) { // Runtime Error
//                     finalStatus = 'error';
//                 } else { // Wrong Answer or other issues
//                     finalStatus = 'wrong';
//                 }
//                 errorMessage = test.stderr || test.compile_output || 'Execution failed';
//                 break; // Stop on first failure
//             }
//         }

//         // Update submission with results
//         submission.status = finalStatus;
//         submission.runtime = totalRuntime;
//         submission.memory = maxMemory;
//         submission.testCasesPassed = passedCount;
//         submission.errorMessage = errorMessage;
//         await submission.save();

//         //checks the problem id is already is in the user (problemsolve) section or not

//          //insert the problem id into the user(problemsolved) section if it is not present there

//          //req.user -> its comes from usermiddleware 

//         if(!req.user.problemSolved.includes(problemId) && (submission.status=='accepted')){
//             req.user.problemSolved.push(problemId);
//             await req.user.save();
//         }

//         // Send response
//         res.status(200).json({
//             success: true,
//             message: 'Code submitted successfully',
//             data: {
//                 submissionId: submission._id,
//                 status: finalStatus,
//                 testCasesPassed: passedCount,
//                 testCasesTotal: problem.invisibleTestCase.length,
//                 runtime: totalRuntime,
//                 memory: maxMemory
//             }
//         });

//     } catch (error) {
//         console.error('SubmitCode Error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Internal server error',
//             error: error.message
//         });
//     }
// };


const SubmitCode = async (req, res) => {
  try {
    // ensure user middleware populated req.user
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized. User not found on request.' });
    }

    const userId = req.user._id;
    const problemId = String(req.params.id || '').trim();
    let { code, language } = req.body || {};

    // Input validation
    if (!userId || !problemId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, problemId, code, or language'
      });
    }

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

    // Create initial submission record (persist early so we have an id to return)
    const submission = await Submission.create({
      userId,
      problemId,
      code,
      language,
      status: 'pending',
      testCasesTotal: invisibleTests.length
    });

    // If there are no invisible testcases, mark accepted immediately
    if (invisibleTests.length === 0) {
      submission.status = 'accepted';
      submission.testCasesPassed = 0;
      await submission.save();

      // add to user's solved list if not present
      await addProblemToUserSolved(req.user, problemId);

      return res.status(200).json({
        success: true,
        message: 'Code submitted successfully (no invisible tests).',
        data: {
          submissionId: submission._id,
          status: submission.status,
          testCasesPassed: submission.testCasesPassed,
          testCasesTotal: submission.testCasesTotal,
          runtime: submission.runtime,
          memory: submission.memory
        }
      });
    }

    // Prepare submissions for Judge0
    const languageId = getLanguageById(language); // keep your existing helper
    const judgeSubmissions = invisibleTests.map((test) => ({
      source_code: code,
      language_id: languageId,
      stdin: test.input || '',
      expected_output: (typeof test.output !== 'undefined') ? String(test.output) : ''
    }));

    // Submit to Judge0 in try/catch so we can update submission on failure
    let testResults = [];
    try {
      const submitResult = await submitBatch(judgeSubmissions);
      const resultTokens = (Array.isArray(submitResult) ? submitResult : []).map((v) => v.token).filter(Boolean);
      if (resultTokens.length === 0) {
        throw new Error('Judge0 batch submission returned no tokens');
      }
      testResults = await submitToken(resultTokens);
    } catch (judgeErr) {
      // update submission with error state and return
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
    let passedCount = 0;
    let totalRuntime = 0;
    let maxMemory = 0;
    let finalStatus = 'accepted';
    let errorMessage = '';

    for (const test of testResults) {
      // Judge0 may return status as { id: number, description: '' } or status_id directly.
      const statusId = test?.status?.id || test?.status_id || null;

      if (statusId === 3) { // Accepted
        passedCount++;
        totalRuntime += parseFloat(test.time) || 0;
        maxMemory = Math.max(maxMemory, Number(test.memory) || 0);
      } else {
        // Map non-accepted statuses
        if (statusId === 4) finalStatus = 'error'; // Runtime Error
        else finalStatus = 'wrong';

        // Prefer stderr, then compile_output, then status description
        errorMessage = test.stderr || test.compile_output || (test?.status?.description || 'Execution failed');
        // continue loop to record resource metrics if available, but do not count as passed
        totalRuntime += parseFloat(test.time) || 0;
        maxMemory = Math.max(maxMemory, Number(test.memory) || 0);
        // stop on first failing test if desired. You may remove the break to collect all results.
        break;
      }
    }

    // Update submission with results
    submission.status = finalStatus;
    submission.runtime = totalRuntime;
    submission.memory = maxMemory;
    submission.testCasesPassed = passedCount;
    submission.errorMessage = String(errorMessage || '');
    await submission.save();

    // Update user's solved list if accepted
    if (submission.status === 'accepted') {
      await addProblemToUserSolved(req.user, problemId);
    }

    // Send response
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

// Helper to add problemId to user's solved array in a defensive way
async function addProblemToUserSolved(userDoc, problemId) {
  try {
    // Determine field name: support both 'problemSolved' and 'problemSolvedd'
    const preferredFields = ['problemSolved', 'problemSolvedd', 'problemSolvedd'];
    let field = preferredFields.find((f) => Array.isArray(userDoc[f]));

    // If none exists, create 'problemSolved' on the user document
    if (!field) {
      field = 'problemSolved';
      // If userDoc is a mongoose doc we can set the path
      userDoc[field] = userDoc[field] || [];
    }

    const arr = userDoc[field] = userDoc[field] || [];
    const already = arr.some((id) => String(id) === String(problemId));
    if (!already) {
      arr.push(problemId);
      // If req.user is a mongoose document it should have save. Otherwise update via User model.
      if (typeof userDoc.save === 'function') {
        await userDoc.save();
      } else {
        await User.findByIdAndUpdate(userDoc._id, { $addToSet: { [field]: problemId } });
      }
    }
  } catch (err) {
    // Do not throw. This helper should not break submission flow.
    console.error('Failed to add problem to user solved list', err);
  }
}




const RunCode = async (req, res) => {
    try {
        const userId = req.user._id;
        const problemId = req.params.id?.trim();
        const { code, language } = req.body;

        // Input validation
        if (!userId || !problemId || !code || !language) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: userId, problemId, code, or language'
            });
        }

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
            return res.status(404).json({
                success: false,
                message: 'Problem not found'
            });
        }

        // Prepare submissions for Judge0
        const languageId = getLanguageById(language);
        const judgeSubmissions = problem.visibleTestCase.map((test) => ({
            source_code: code,
            language_id: languageId,
            stdin: test.input,
            expected_output: test.output
        }));

        // Submit to Judge0
        const submitResult = await submitBatch(judgeSubmissions);
        const resultTokens = submitResult.map((value) => value.token);
        const testResults = await submitToken(resultTokens);

        // Send success response
        return res.status(200).json({
            success: true,
            message: 'Code executed successfully',
            runtime:testResults.totalRuntime,
            memory:testResults.maxMemory,
            testCases: Problem.visibleTestCase
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



   
    


module.exports = {SubmitCode, RunCode};




//user_id => user._id 


// this is information about every test cases

//     language_id: 54,
//     stdin: '3\n3 2 4\n6',
//     expected_output: '1 2',
//     stdout: '1 2',
//     status_id: 3,
//     created_at: '2025-10-20T12:06:01.819Z',
//     finished_at: '2025-10-20T12:06:02.601Z',
//     time: '0.003',
//     memory: 904,
//     stderr: null, (its represent the error message)