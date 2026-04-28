import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from "../utils/axiosclient"
import SubmissionHistory from "../components/submission_History.jsx";
import {
  Play, Send, Code2, BookOpen, Lightbulb, CheckCircle, XCircle,
  Clock, Zap, BookMarked, FileText, Loader2, ChevronRight, AlertCircle, Bot
} from 'lucide-react';
import ChatAi from '../components/chatai.jsx';
import Editorial from '../components/editorial.jsx';

const langMap = {
  cpp: 'C++',
  c: 'C',
  java: 'Java',
  python: 'Python'
};

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('c');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const editorRef = useRef(null);
  let { problemId } = useParams();

  const { handleSubmit } = useForm();

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problem-by-id/${problemId}`);
        const payload = response?.data?.data ?? response?.data ?? null;

        if (!payload) {
          console.error('Fetch succeeded but payload is empty', response);
          setProblem(null);
          setCode('');
          return;
        }

        const startCodeArr = Array.isArray(payload.startCode) ? payload.startCode : [];
        const targetLang = (langMap?.[selectedLanguage] ?? selectedLanguage)?.toString();

        const entry = startCodeArr.find(sc =>
          String(sc.language || '').toLowerCase() === targetLang.toLowerCase()
        );

        const initialCode = entry?.InitialCode ?? entry?.initialCode ?? '';

        setProblem(payload);
        setCode(initialCode);
      } catch (error) {
        console.error('Error fetching problem:', error);
        setProblem(null);
        setCode('');
      } finally {
        setLoading(false);
      }
    };

    if (problemId) fetchProblem();
  }, [problemId, selectedLanguage]);

  const handleEditorChange = (value) => {
    setCode(value ?? '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);

    try {
      if (!problemId) throw new Error('Missing problemId');

      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });

      const result = response?.data ?? { success: false, error: 'No response' };
      setRunResult(result);
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({
        success: false,
        error: error?.response?.data?.message || error?.message || 'Internal server error'
      });
    } finally {
      setLoading(false);
      setActiveRightTab('testcase');
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);

    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code: code,
        language: selectedLanguage
      });

      setSubmitResult(response.data);
      setLoading(false);
      setActiveRightTab('result');

    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult({
        success: false,
        error: error?.response?.data?.message || 'Submission failed'
      });
      setLoading(false);
      setActiveRightTab('result');
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'cpp': return 'cpp';
      case 'c': return 'c';
      case 'java': return 'java';
      case 'python': return 'python';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
      case 'medium': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
      case 'hard': return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-slate-600 font-medium">Loading problem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-slate-50">
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col border-r border-slate-200 bg-white">
        {/* Left Tabs */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4">
          <div className="flex gap-1">
            {[
              { id: 'description', label: 'Description', icon: FileText },
              { id: 'editorial', label: 'Editorial', icon: BookOpen },
              { id: 'solutions', label: 'Solutions', icon: Lightbulb },
              { id: 'submissions', label: 'Submissions', icon: BookMarked },
              {id :'ChatAI', label:'ChatAI', icon: Bot}
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`px-4 py-3 flex items-center gap-2 font-medium text-sm border-b-2 transition-all duration-200 ${
                  activeLeftTab === id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                onClick={() => setActiveLeftTab(id)}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {problem && (
            <>
              {activeLeftTab === 'description' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <h1 className="text-3xl font-bold text-slate-900">{problem.title}</h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {(() => {
                        const colors = getDifficultyColor(problem.difficulty);
                        return (
                          <div className={`px-3 py-1.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border} font-semibold text-sm flex items-center gap-2`}>
                            <Zap className="w-4 h-4" />
                            {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                          </div>
                        );
                      })()}
                      {Array.isArray(problem.tags) && problem.tags.map((tag, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="prose prose-sm max-w-none">
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 font-medium">
                        {problem.description}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-500" />
                      Examples
                    </h3>
                    <div className="space-y-3">
                      {problem.visibleTestCase && problem.visibleTestCase.map((example, index) => (
                        <div key={index} className="border border-slate-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors">
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 border-b border-slate-200">
                            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                              <ChevronRight className="w-4 h-4 text-blue-500" />
                              Example {index + 1}
                            </h4>
                          </div>
                          <div className="bg-slate-50 p-4 space-y-2">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Input</label>
                              <div className="bg-white p-2 rounded border border-slate-200 text-sm font-mono text-slate-700">{example.input}</div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Output</label>
                              <div className="bg-white p-2 rounded border border-slate-200 text-sm font-mono text-slate-700">{example.output}</div>
                            </div>
                            {example.explanation && (
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Explanation</label>
                                <div className="bg-white p-2 rounded border border-slate-200 text-sm text-slate-700">{example.explanation}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeLeftTab === 'editorial' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Lightbulb className="w-6 h-6 text-amber-500" />
                    Editorial
                  </h2>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                     <Editorial secureUrl = {problem.secureUrl} thumbnailUrl = {problem.thumbnailUrl} duration = {problem.duration}></Editorial>
                    </div>
                  </div>
                </div>
              )}

              {activeLeftTab === 'solutions' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Code2 className="w-6 h-6 text-green-500" />
                    Reference Solutions
                  </h2>
                  <div className="space-y-4">
                    {problem.referenceSolution && problem.referenceSolution.length > 0 ? (
                      problem.referenceSolution.map((solution, index) => (
                        <div key={index} className="border border-slate-200 rounded-lg overflow-hidden hover:border-green-300 transition-colors">
                          <div className="bg-gradient-to-r from-green-50 to-green-100 px-4 py-3 border-b border-slate-200">
                            <h3 className="font-semibold text-slate-900">{problem?.title} - {solution?.language}</h3>
                          </div>
                          <div className="bg-slate-900 p-4">
                            <pre className="text-xs overflow-x-auto text-slate-100 font-mono leading-relaxed">
                              <code>{solution?.CompleteCode}</code>
                            </pre>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-700 font-medium flex items-center gap-2">
                          <AlertCircle className="w-5 h-5" />
                          Solutions will be available after you solve the problem.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeLeftTab === 'submissions' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <BookMarked className="w-6 h-6 text-purple-500" />
                    My Submissions
                  </h2>
                  <SubmissionHistory problemId={problemId} />
                </div>
              )}



              {/* ChatAI */}

              {activeLeftTab === 'ChatAI' &&(
                   <>
                     <ChatAi problem={problem}/>
                   </>
              )}



            </>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 flex flex-col bg-gradient-to-br from-slate-900 to-slate-800">
        {/* Right Tabs */}
        <div className="border-b border-slate-700 bg-slate-900 px-4">
          <div className="flex gap-1">
            {[
              { id: 'code', label: 'Code', icon: Code2 },
              { id: 'testcase', label: 'Test Results', icon: CheckCircle },
              { id: 'result', label: 'Submission', icon: Send }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`px-4 py-3 flex items-center gap-2 font-medium text-sm border-b-2 transition-all duration-200 ${
                  activeRightTab === id
                    ? 'border-blue-400 text-blue-400 bg-slate-800'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
                onClick={() => setActiveRightTab(id)}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col">
          {activeRightTab === 'code' && (
            <div className="flex-1 flex flex-col">
              {/* Language Selector */}
              <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800">
                <div className="flex gap-2">
                  {['c', 'java', 'cpp', 'python'].map((lang) => (
                    <button
                      key={lang}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                        selectedLanguage === lang
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      <Code2 className="w-4 h-4" />
                      {lang === 'cpp' ? 'C++' : lang === 'c' ? 'C' : lang === 'java' ? 'Java' : 'Python'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="flex-1">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    mouseWheelZoom: true,
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-slate-700 flex justify-between bg-slate-800">
                <div></div>
                <div className="flex gap-3">
                  <button
                    className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
                      loading
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-700 text-slate-200 hover:bg-slate-600 hover:shadow-lg'
                    }`}
                    onClick={handleRun}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Run
                      </>
                    )}
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
                      loading
                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/50'
                    }`}
                    onClick={handleSubmitCode}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeRightTab === 'testcase' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4 text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Test Results
              </h3>
              {runResult ? (
                <div className={`rounded-lg border-2 p-4 ${
                  runResult.success
                    ? 'border-emerald-500 bg-emerald-50 bg-opacity-10'
                    : 'border-rose-500 bg-rose-50 bg-opacity-10'
                }`}>
                  <div>
                    {runResult.success ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-6 h-6 text-emerald-500" />
                          <h4 className="font-bold text-emerald-200 text-lg">All Test Cases Passed!</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-slate-800 p-3 rounded flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <div>
                              <p className="text-slate-400 text-xs">Runtime</p>
                              <p className="text-slate-100 font-mono">{runResult.runtime || '0'} sec</p>
                            </div>
                          </div>
                          <div className="bg-slate-800 p-3 rounded flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <div>
                              <p className="text-slate-400 text-xs">Memory</p>
                              <p className="text-slate-100 font-mono">{runResult.memory || '0'} KB</p>
                            </div>
                          </div>
                        </div>

                        {runResult.testCases && (
                          <div className="space-y-2 mt-4">
                            <p className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Test Cases</p>
                            {runResult.testCases.map((tc, i) => (
                              <div key={i} className="bg-slate-800 border border-slate-700 p-3 rounded text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-400">Test {i + 1}</span>
                                  <span className="text-emerald-400 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Passed
                                  </span>
                                </div>
                                <div className="font-mono text-slate-300 space-y-1 text-xs">
                                  <div><span className="text-slate-500">Input:</span> {tc.stdin || tc.input}</div>
                                  <div><span className="text-slate-500">Output:</span> {tc.stdout || tc.output}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-6 h-6 text-rose-500" />
                          <h4 className="font-bold text-rose-200 text-lg">Test Failed</h4>
                        </div>
                        <div className="bg-slate-800 p-3 rounded text-sm text-rose-200">
                          {runResult.error || 'Code execution failed'}
                        </div>
                        {runResult.testCases && (
                          <div className="space-y-2 mt-4">
                            <p className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Test Cases</p>
                            {runResult.testCases.map((tc, i) => (
                              <div key={i} className={`border p-3 rounded text-xs space-y-1 ${
                                tc.status_id === 3
                                  ? 'bg-slate-800 border-emerald-700'
                                  : 'bg-rose-950 border-rose-700'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-400">Test {i + 1}</span>
                                  <span className={`flex items-center gap-1 ${tc.status_id === 3 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {tc.status_id === 3 ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                    {tc.status_id === 3 ? 'Passed' : 'Failed'}
                                  </span>
                                </div>
                                <div className="font-mono text-slate-300 space-y-1 text-xs">
                                  <div><span className="text-slate-500">Input:</span> {tc.stdin || tc.input}</div>
                                  <div><span className="text-slate-500">Expected:</span> {tc.expected_output || tc.output}</div>
                                  <div><span className="text-slate-500">Got:</span> {tc.stdout}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Play className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
                  <p className="text-slate-400">Click "Run" to test your code</p>
                </div>
              )}
            </div>
          )}

          {activeRightTab === 'result' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4 text-white flex items-center gap-2">
                <Send className="w-5 h-5" />
                Submission Result
              </h3>
              {submitResult ? (
                <div className={`rounded-lg border-2 p-4 ${
                  submitResult.success
                    ? 'border-emerald-500 bg-emerald-50 bg-opacity-10'
                    : 'border-rose-500 bg-rose-50 bg-opacity-10'
                }`}>
                  <div>
                    {submitResult.success ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-8 h-8 text-emerald-500" />
                          <h4 className="font-bold text-emerald-200 text-xl">Accepted!</h4>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div className="bg-slate-800 p-3 rounded text-center">
                            <p className="text-slate-400 text-xs">Passed</p>
                            <p className="text-emerald-400 font-bold text-lg">{submitResult.data.testCasesPassed}/{submitResult.data.testCasesTotal}</p>
                          </div>
                          <div className="bg-slate-800 p-3 rounded text-center">
                            <p className="text-slate-400 text-xs">Runtime</p>
                            <p className="text-blue-400 font-mono">{submitResult.data.runtime} sec</p>
                          </div>
                          <div className="bg-slate-800 p-3 rounded text-center">
                            <p className="text-slate-400 text-xs">Memory</p>
                            <p className="text-yellow-400 font-mono">{submitResult.data.memory} KB</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-8 h-8 text-rose-500" />
                          <h4 className="font-bold text-rose-200 text-xl">{submitResult.error || 'Submission Failed'}</h4>
                        </div>
                        {submitResult.data && (
                          <div className="bg-slate-800 p-3 rounded">
                            <p className="text-slate-400 text-xs">Test Cases Passed</p>
                            <p className="text-slate-100 font-bold text-lg">{submitResult.data.testCasesPassed}/{submitResult.data.testCasesTotal}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Send className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
                  <p className="text-slate-400">Click "Submit" to submit your solution</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;



