// import { useState, useEffect } from 'react';
// import axiosClient from '../utils/axiosclient';

// const SubmissionHistory = ({ problemId }) => {
//   const [submissions, setSubmissions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedSubmission, setSelectedSubmission] = useState(null);

//   useEffect(() => {
//     const fetchSubmissions = async () => {
//       try {
//         setLoading(true);
//         const response = await axiosClient.get(`/problem/submitted-problem/${problemId}`);
//         setSubmissions(response.data);
//         setError(null);
//       } catch (err) {
//         setError('Failed to fetch submission history');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSubmissions();
//   }, [problemId]);

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'accepted': return 'badge-success';
//       case 'wrong': return 'badge-error';
//       case 'error': return 'badge-warning';
//       case 'pending': return 'badge-info';
//       default: return 'badge-neutral';
//     }
//   };

//   const formatMemory = (memory) => {
//     if (memory < 1024) return `${memory} kB`;
//     return `${(memory / 1024).toFixed(2)} MB`;
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleString();
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <span className="loading loading-spinner loading-lg"></span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="alert alert-error shadow-lg my-4">
//         <div>
//           <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//           <span>{error}</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <h2 className="text-2xl font-bold mb-6 text-center">Submission History</h2>
      
//       {submissions.length === 0 ? (
//         <div className="alert alert-info shadow-lg">
//           <div>
//             <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//             </svg>
//             <span>No submissions found for this problem</span>
//           </div>
//         </div>
//       ) : (
//         <>
//           <div className="overflow-x-auto">
//             <table className="table table-zebra w-full">
//               <thead>
//                 <tr>
//                   <th>#</th>
//                   <th>Language</th>
//                   <th>Status</th>
//                   <th>Runtime</th>
//                   <th>Memory</th>
//                   <th>Test Cases</th>
//                   <th>Submitted</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {submissions.map((sub, index) => (
//                   <tr key={sub._id}>
//                     <td>{index + 1}</td>
//                     <td className="font-mono">{sub.language}</td>
//                     <td>
//                       <span className={`badge ${getStatusColor(sub.status)}`}>
//                         {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
//                       </span>
//                     </td>
                    
//                     <td className="font-mono">{sub.runtime}sec</td>
//                     <td className="font-mono">{formatMemory(sub.memory)}</td>
//                     <td className="font-mono">{sub.testCasesPassed}/{sub.testCasesTotal}</td>
//                     <td>{formatDate(sub.createdAt)}</td>
//                     <td>
//                       <button 
//                         className="btn btn-s btn-outline"
//                         onClick={() => setSelectedSubmission(sub)}
//                       >
//                         Code
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <p className="mt-4 text-sm text-gray-500">
//             Showing {submissions.length} submissions
//           </p>
//         </>
//       )}

//       {/* Code View Modal */}
//       {selectedSubmission && (
//         <div className="modal modal-open">
//           <div className="modal-box w-11/12 max-w-5xl">
//             <h3 className="font-bold text-lg mb-4">
//               Submission Details: {selectedSubmission.language}
//             </h3>
            
//             <div className="mb-4">
//               <div className="flex flex-wrap gap-2 mb-2">
//                 <span className={`badge ${getStatusColor(selectedSubmission.status)}`}>
//                   {selectedSubmission.status}
//                 </span>
//                 <span className="badge badge-outline">
//                   Runtime: {selectedSubmission.runtime}s
//                 </span>
//                 <span className="badge badge-outline">
//                   Memory: {formatMemory(selectedSubmission.memory)}
//                 </span>
//                 <span className="badge badge-outline">
//                   Passed: {selectedSubmission.testCasesPassed}/{selectedSubmission.testCasesTotal}
//                 </span>
//               </div>
              
//               {selectedSubmission.errorMessage && (
//                 <div className="alert alert-error mt-2">
//                   <div>
//                     <span>{selectedSubmission.errorMessage}</span>
//                   </div>
//                 </div>
//               )}
//             </div>
            
//             <pre className="p-4 bg-gray-900 text-gray-100 rounded overflow-x-auto">
//               <code>{selectedSubmission.code}</code>
//             </pre>
            
//             <div className="modal-action">
//               <button 
//                 className="btn"
//                 onClick={() => setSelectedSubmission(null)}
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SubmissionHistory;



import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosclient';
import {
  ChevronDown, Code2, CheckCircle, XCircle, AlertCircle, Clock, Zap,
  Copy, X, Loader2, Filter, TrendingUp
} from 'lucide-react';

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [filterStatus, setFilterStatus] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/problem/submitted-problem/${problemId}`);
        const data = response?.data?.data || response?.data || [];
        setSubmissions(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError('Failed to fetch submission history');
        console.error(err);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    if (problemId) fetchSubmissions();
  }, [problemId]);

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: CheckCircle };
      case 'wrong':
        return { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', icon: XCircle };
      case 'error':
        return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: AlertCircle };
      case 'pending':
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: Loader2 };
      default:
        return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', icon: AlertCircle };
    }
  };

  const getLanguageColor = (lang) => {
    const langLower = lang.toLowerCase();
    switch (langLower) {
      case 'c++':
      case 'cpp':
        return { bg: 'bg-blue-100', text: 'text-blue-800' };
      case 'c':
        return { bg: 'bg-indigo-100', text: 'text-indigo-800' };
      case 'java':
        return { bg: 'bg-orange-100', text: 'text-orange-800' };
      case 'python':
        return { bg: 'bg-green-100', text: 'text-green-800' };
      default:
        return { bg: 'bg-slate-100', text: 'text-slate-800' };
    }
  };

  const formatMemory = (memory) => {
    if (!memory) return '0 KB';
    if (memory < 1024) return `${memory.toFixed(2)} KB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  const formatRuntime = (runtime) => {
    if (!runtime) return '0 ms';
    if (runtime < 1000) return `${runtime.toFixed(0)} ms`;
    return `${(runtime / 1000).toFixed(2)} s`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSubmissions = filterStatus === 'all'
    ? submissions
    : submissions.filter(sub => sub.status === filterStatus);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-slate-600 font-medium">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border-2 border-rose-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-rose-600" />
          <div>
            <h3 className="font-semibold text-rose-900">Error</h3>
            <p className="text-rose-700 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.length === 0 ? (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-8 text-center">
          <Code2 className="w-12 h-12 text-blue-500 mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-semibold text-blue-900 mb-1">No submissions yet</h3>
          <p className="text-blue-700">Write and submit your code to see your submission history here</p>
        </div>
      ) : (
        <>
          {/* Filter Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-600" />
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterStatus === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              All ({submissions.length})
            </button>
            <button
              onClick={() => setFilterStatus('accepted')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                filterStatus === 'accepted'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <CheckCircle className="w-3 h-3" />
              Accepted ({submissions.filter(s => s.status === 'accepted').length})
            </button>
            <button
              onClick={() => setFilterStatus('wrong')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                filterStatus === 'wrong'
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <XCircle className="w-3 h-3" />
              Wrong ({submissions.filter(s => s.status === 'wrong').length})
            </button>
            <button
              onClick={() => setFilterStatus('error')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                filterStatus === 'error'
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              Error ({submissions.filter(s => s.status === 'error').length})
            </button>
          </div>

          {/* Submissions List */}
          <div className="space-y-2">
            {filteredSubmissions.length === 0 ? (
              <div className="bg-slate-50 rounded-lg p-6 text-center text-slate-600">
                <p>No submissions with this status</p>
              </div>
            ) : (
              filteredSubmissions.map((submission, index) => {
                const statusInfo = getStatusColor(submission.status);
                const langInfo = getLanguageColor(submission.language);
                const StatusIcon = statusInfo.icon;
                const isExpanded = expandedRows.has(submission._id);
                const passRate = submission.testCasesTotal > 0
                  ? Math.round((submission.testCasesPassed / submission.testCasesTotal) * 100)
                  : 0;

                return (
                  <div
                    key={submission._id}
                    className={`border-2 rounded-lg overflow-hidden transition-all duration-200 ${statusInfo.border} ${statusInfo.bg}`}
                  >
                    {/* Header */}
                    <button
                      onClick={() => toggleRow(submission._id)}
                      className="w-full p-4 hover:opacity-75 transition-opacity text-left"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <ChevronDown
                            className={`w-5 h-5 text-slate-600 flex-shrink-0 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-5 h-5 flex-shrink-0 ${statusInfo.text}`} />
                            <span className="text-sm font-mono text-slate-600">#{index + 1}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap justify-end">
                          {/* Language Badge */}
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${langInfo.bg} ${langInfo.text}`}>
                            {submission.language.toUpperCase()}
                          </span>

                          {/* Status Badge */}
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusInfo.text}`}>
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </span>

                          {/* Stats */}
                          <div className="hidden sm:flex items-center gap-2 text-xs">
                            <div className="flex items-center gap-1 text-slate-600">
                              <Clock className="w-3 h-3" />
                              <span className="font-mono">{formatRuntime(submission.runtime)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-600">
                              <Zap className="w-3 h-3" />
                              <span className="font-mono">{formatMemory(submission.memory)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-600">
                              <TrendingUp className="w-3 h-3" />
                              <span className="font-mono">{submission.testCasesPassed}/{submission.testCasesTotal}</span>
                            </div>
                          </div>

                          {/* Time */}
                          <span className="text-xs text-slate-600 whitespace-nowrap">
                            {formatDate(submission.createdAt)}
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t-2 border-current px-4 py-4 space-y-4 bg-white bg-opacity-40">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Runtime</p>
                            <p className="text-lg font-bold text-slate-900 font-mono mt-1">
                              {formatRuntime(submission.runtime)}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Memory</p>
                            <p className="text-lg font-bold text-slate-900 font-mono mt-1">
                              {formatMemory(submission.memory)}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Test Cases</p>
                            <p className="text-lg font-bold text-slate-900 font-mono mt-1">
                              {submission.testCasesPassed}/{submission.testCasesTotal}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Pass Rate</p>
                            <p className={`text-lg font-bold font-mono mt-1 ${
                              passRate === 100 ? 'text-emerald-600' : passRate >= 50 ? 'text-amber-600' : 'text-rose-600'
                            }`}>
                              {passRate}%
                            </p>
                          </div>
                        </div>

                        {/* Error Message */}
                        {submission.errorMessage && (
                          <div className="bg-rose-100 border border-rose-300 rounded-lg p-3">
                            <p className="text-xs font-semibold text-rose-900 uppercase tracking-wide mb-1">Error</p>
                            <p className="text-sm text-rose-800 font-mono break-all">{submission.errorMessage}</p>
                          </div>
                        )}

                        {/* Code Section */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                              <Code2 className="w-4 h-4" />
                              Source Code
                            </p>
                            <button
                              onClick={() => copyToClipboard(submission.code, submission._id)}
                              className={`px-2 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${
                                copiedId === submission._id
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
                              }`}
                            >
                              <Copy className="w-3 h-3" />
                              {copiedId === submission._id ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                          <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto text-xs leading-relaxed max-h-64 overflow-y-auto font-mono">
                            <code>{submission.code}</code>
                          </pre>
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                        >
                          <Code2 className="w-4 h-4" />
                          View Full Details
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t-2 border-slate-200">
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-3 text-center">
              <p className="text-xs text-emerald-700 font-semibold uppercase">Accepted</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {submissions.filter(s => s.status === 'accepted').length}
              </p>
            </div>
            <div className="bg-rose-50 border-2 border-rose-200 rounded-lg p-3 text-center">
              <p className="text-xs text-rose-700 font-semibold uppercase">Wrong Answer</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">
                {submissions.filter(s => s.status === 'wrong').length}
              </p>
            </div>
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-3 text-center">
              <p className="text-xs text-amber-700 font-semibold uppercase">Error</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {submissions.filter(s => s.status === 'error').length}
              </p>
            </div>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 text-center">
              <p className="text-xs text-blue-700 font-semibold uppercase">Total</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{submissions.length}</p>
            </div>
          </div>
        </>
      )}

      {/* Full Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 flex items-center justify-between border-b-2 border-slate-700">
              <div className="flex items-center gap-3">
                <Code2 className="w-6 h-6 text-blue-400" />
                <div>
                  <h3 className="font-bold text-white text-lg">Submission Details</h3>
                  <p className="text-sm text-slate-400">{selectedSubmission.language.toUpperCase()}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-300" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status and Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border-2 border-slate-200">
                  <p className="text-xs text-slate-600 font-bold uppercase tracking-wide">Status</p>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusColor(selectedSubmission.status).icon === CheckCircle && (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    )}
                    {getStatusColor(selectedSubmission.status).icon === XCircle && (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                    {getStatusColor(selectedSubmission.status).icon === AlertCircle && (
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    )}
                    {getStatusColor(selectedSubmission.status).icon === Loader2 && (
                      <Loader2 className="w-5 h-5 text-blue-600" />
                    )}
                    <span className="text-sm font-bold text-slate-900">
                      {selectedSubmission.status.charAt(0).toUpperCase() + selectedSubmission.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border-2 border-slate-200">
                  <p className="text-xs text-slate-600 font-bold uppercase tracking-wide">Runtime</p>
                  <p className="text-2xl font-bold text-slate-900 font-mono mt-2">
                    {formatRuntime(selectedSubmission.runtime)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border-2 border-slate-200">
                  <p className="text-xs text-slate-600 font-bold uppercase tracking-wide">Memory</p>
                  <p className="text-2xl font-bold text-slate-900 font-mono mt-2">
                    {formatMemory(selectedSubmission.memory)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border-2 border-slate-200">
                  <p className="text-xs text-slate-600 font-bold uppercase tracking-wide">Passed</p>
                  <p className="text-2xl font-bold text-slate-900 font-mono mt-2">
                    {selectedSubmission.testCasesPassed}/{selectedSubmission.testCasesTotal}
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {selectedSubmission.errorMessage && (
                <div className="bg-rose-50 border-2 border-rose-200 rounded-lg p-4">
                  <p className="text-sm font-bold text-rose-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Error Message
                  </p>
                  <p className="text-sm text-rose-800 font-mono break-all">{selectedSubmission.errorMessage}</p>
                </div>
              )}

              {/* Code */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Code2 className="w-5 h-5" />
                    Source Code
                  </p>
                  <button
                    onClick={() => copyToClipboard(selectedSubmission.code, 'modal')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-2 ${
                      copiedId === 'modal'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    <Copy className="w-4 h-4" />
                    {copiedId === 'modal' ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto font-mono text-sm leading-relaxed max-h-96 overflow-y-auto">
                  <code>{selectedSubmission.code}</code>
                </pre>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div>
                  <p className="text-xs text-slate-600 font-semibold uppercase">Language</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{selectedSubmission.language.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-semibold uppercase">Submitted</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">
                    {new Date(selectedSubmission.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedSubmission(null)}
                className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;
