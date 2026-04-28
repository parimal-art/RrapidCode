import React, { useEffect, useState, useMemo } from 'react';
import axiosClient from '../utils/axiosclient';

// AdminDelete.jsx - Dark theme UI

export default function AdminDelete() {   
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [query, setQuery] = useState('');
  const [selectedToDelete, setSelectedToDelete] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [lastErrorMsg, setLastErrorMsg] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/get-all-problem');
      setProblems(Array.isArray(data.data) ? data.data : []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch problems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fuzzyMatch = (title = '', pattern = '') => {
    const s = String(title).toLowerCase();
    const p = String(pattern).toLowerCase();
    if (!p) return true;
    let i = 0;
    for (let ch of s) {
      if (ch === p[i]) i++;
      if (i === p.length) return true;
    }
    return false;
  };

  const filteredProblems = useMemo(() => {
    return problems.filter((prob) => fuzzyMatch(prob.title || '', query));
  }, [problems, query]);

  const openConfirm = (problem) => {
    setSelectedToDelete(problem);
    setShowConfirm(true);
  };
  const closeConfirm = () => {
    setSelectedToDelete(null);
    setShowConfirm(false);
  };

  const handleDelete = async () => {
    if (!selectedToDelete) return;
    setDeleting(true);
    try {
      await axiosClient.delete(`/problem/delete/${selectedToDelete._id}`);
      setProblems((prev) => prev.filter((p) => p._id !== selectedToDelete._id));
      closeConfirm();
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || err?.message || 'Unknown error while deleting';
      setLastErrorMsg(message);
      setShowErrorModal(true);
    } finally {
      setDeleting(false);
    }
  };

  const handleRetryDelete = async () => {
    setShowErrorModal(false);
    setShowConfirm(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-slate-900">
        <div className="animate-pulse space-y-2">
          <div className="w-96 h-6 bg-slate-700 rounded" />
          <div className="w-72 h-40 bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">Manage Problems</h1>
            <p className="text-sm text-slate-400">Search, preview and delete problems safely.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-96">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by problem title (type to filter)"
                className="w-full pr-10 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <svg className="w-5 h-5 absolute right-3 top-3 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </div>

            <button onClick={fetchProblems} className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700">Refresh</button>
          </div>
        </div>

        <div className="bg-slate-850 rounded-2xl shadow-lg overflow-hidden border border-slate-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y table-auto">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">#</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Difficulty</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Tags</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {filteredProblems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No problems match your search.</td>
                  </tr>
                )}

                {filteredProblems.map((problem, idx) => (
                  <tr key={problem._id} className="hover:bg-slate-800/40">
                    <td className="px-6 py-4 text-sm text-slate-300">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-100">{problem.title}</div>
                      <div className="text-xs text-slate-400 mt-1">{problem.description ? String(problem.description).slice(0, 120) + (problem.description.length > 120 ? '...' : '') : ''}</div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        problem.difficulty === 'Easy' ? 'bg-emerald-900 text-emerald-300' : problem.difficulty === 'Medium' ? 'bg-amber-900 text-amber-300' : 'bg-rose-900 text-rose-300'
                      }`}>{problem.difficulty || 'N/A'}</span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {Array.isArray(problem.tags) ? (
                          problem.tags.slice(0, 5).map((t, i) => (
                            <span key={i} className="text-xs font-medium px-2 py-1 rounded-lg bg-gradient-to-r from-slate-800 to-slate-850 border border-slate-700">
                              {t}
                            </span>
                          ))
                        ) : problem.tags ? (
                          <span className="text-xs font-medium px-2 py-1 rounded-lg bg-gradient-to-r from-slate-800 to-slate-850 border border-slate-700">{String(problem.tags)}</span>
                        ) : (
                          <span className="text-xs text-slate-500">No tags</span>
                        )}

                        {Array.isArray(problem.tags) && problem.tags.length > 5 && (
                          <span className="text-xs text-slate-400">+{problem.tags.length - 5} more</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openConfirm(problem)}
                          className="px-3 py-1 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-sm"
                          title="Delete problem"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        </div>

        {showConfirm && selectedToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={closeConfirm} />
            <div className="relative bg-slate-900 max-w-lg w-[90%] rounded-2xl shadow-2xl p-6 border border-slate-800">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-rose-900 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-100">Confirm delete</h3>
                  <p className="text-sm text-slate-400 mt-1">You are about to permanently delete the problem <span className="font-medium text-slate-100">{selectedToDelete.title}</span>. This action cannot be undone.</p>

                  <div className="mt-4 flex items-center gap-3 justify-end">
                    <button onClick={closeConfirm} className="px-4 py-2 rounded-md bg-slate-800 border border-slate-700 text-slate-200">Cancel</button>
                    <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-500 text-white">
                      {deleting ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showErrorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowErrorModal(false)} />
            <div className="relative bg-slate-900 max-w-lg w-[90%] rounded-2xl shadow-2xl p-6 border border-slate-800">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-amber-900 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-100">Delete failed</h3>
                  <p className="text-sm text-slate-400 mt-1">Reason: <span className="font-medium text-slate-100">{lastErrorMsg}</span></p>

                  <div className="mt-4 flex items-center gap-3 justify-end">
                    <button onClick={() => setShowErrorModal(false)} className="px-4 py-2 rounded-md bg-slate-800 border border-slate-700 text-slate-200">Close</button>
                    <button onClick={handleRetryDelete} className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-500 text-white">Retry</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-md bg-rose-900/10 border border-rose-800 p-3 text-rose-200">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}




// 1. "enable solved peoblem section filter".
// 2. "Add a search field where we can search the question by its name (title of the problem)".
// 3. "Those Problem already solved by user that add solved marks of that question".
// 4. "Also give a proper footer section of that code with industry-ready and attractive responsive footer".
// 5. "When fetch the problem fetch only 10 problem in a page and give user friendly style of that page and 10 problem are show attrcatively inside that page".






