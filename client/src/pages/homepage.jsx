import  { useEffect, useState, useMemo } from 'react';
import { NavLink } from 'react-router';
import { Search, CheckCircle2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosclient';
import { logoutUser } from '../authslice';

// Homepage - Dark themed, paginated, search, solved filter, attractive UI
export default function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});

  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ difficulty: 'all', tag: 'all', status: 'all' });

  const PROBLEMS_PER_PAGE = 10;

  useEffect(() => {
    // keep backend logic same: two calls made in same effect
    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      try {
        // call both endpoints (parallel requests)
        const problemsReq = axiosClient.get('/problem/get-all-problem');
        const solvedReq = user ? axiosClient.get('/problem/problems-solved-by-user') : Promise.resolve({ data: { data: [] } });

        const [problemsRes, solvedRes] = await Promise.all([problemsReq, solvedReq]);

        setProblems(Array.isArray(problemsRes?.data?.data) ? problemsRes.data.data : []);
        setSolvedProblems(Array.isArray(solvedRes?.data?.data) ? solvedRes.data.data : []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load problems.');
        setProblems([]);
        setSolvedProblems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);

  };

  // search + filters + solved status
  const filteredProblems = useMemo(() => {
    if (!Array.isArray(problems)) return [];

    return problems.filter((problem) => {
      const title = String(problem?.title || '').toLowerCase();
      const searchMatch = title.includes(searchQuery.trim().toLowerCase());

      const difficultyMatch =
        filters.difficulty === 'all' || String(problem?.difficulty || '').toLowerCase() === filters.difficulty.toLowerCase();

      const tagMatch =
        filters.tag === 'all' ||
        (Array.isArray(problem?.tags)
          ? problem.tags.some((t) => String(t).toLowerCase().includes(filters.tag.toLowerCase()))
          : String(problem?.tags || '').toLowerCase().includes(filters.tag.toLowerCase()));

      const statusMatch =
        filters.status === 'all' ||
        (filters.status === 'solved' && solvedProblems.some((sp) => sp?._id === problem?._id));

      return searchMatch && difficultyMatch && tagMatch && statusMatch;
    });
  }, [problems, searchQuery, filters, solvedProblems]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / PROBLEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * PROBLEMS_PER_PAGE;
  const paginatedProblems = filteredProblems.slice(startIndex, startIndex + PROBLEMS_PER_PAGE);

  useEffect(() => {
    // reset page when filters or search changes
    setCurrentPage(1);
  }, [searchQuery, filters]);

  const isProblemSolved = (problemId) => Array.isArray(solvedProblems) && solvedProblems.some((sp) => sp?._id === problemId);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="animate-pulse space-y-3 text-center">
          <div className="w-64 h-6 bg-slate-800 rounded mx-auto" />
          <div className="w-96 h-40 bg-slate-800 rounded mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#060712] via-[#071023] to-[#05060a] text-slate-100">
      {/* Top Nav */}
      <nav className="bg-slate-900/40 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <NavLink to="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400">Rapid-Code</NavLink>

          <div className="flex items-center gap-4">
            <NavLink to="/profile" className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition cursor-pointer">Profile</NavLink>
            {user ? (
              <div className="dropdown dropdown-end">
                <button tabIndex={0} className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition cursor-pointer">{user?.FirstName || 'Account'}</button>
                <ul tabIndex={0} className="mt-2 p-2 shadow menu menu-sm dropdown-content bg-slate-900 rounded-box w-44 border border-slate-800">
                  <li><button onClick={handleLogout} className="w-full text-left">Logout</button></li>
                  {user?.role === 'admin' && <li><NavLink to="/admin">Admin</NavLink></li>}
                </ul>
              </div>
            ) : (
              <NavLink to="/login" className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-medium transition cursor-pointer">Sign in</NavLink>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-1">Problems</h1>
          <p className="text-sm text-slate-400">Search, filter and solve curated problems. Showing {filteredProblems.length} results.</p>
        </div>

        {/* Controls */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems by title..."
              className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition cursor-text"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={filters.status}
              onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
              className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer"
            >
              <option value="all">All Problems</option>
              <option value="solved">Solved Problems</option>
            </select>

            <select
              value={filters.difficulty}
              onChange={(e) => setFilters((p) => ({ ...p, difficulty: e.target.value }))}
              className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
              value={filters.tag}
              onChange={(e) => setFilters((p) => ({ ...p, tag: e.target.value }))}
              className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer"
            >
              <option value="all">All Tags</option>
              <option value="array">Array</option>
              <option value="linkedlist">Linked List</option>
              <option value="graph">Graph</option>
              <option value="dp">DP</option>
              <option value="tree">Tree</option>
              <option value="string">String</option>
              <option value="heap">Heap</option>
              <option value="hashmap">HashMap</option>
              <option value="Two Pointers">Two Pointers</option>
              <option value="Math">Math</option>
              <option value="Binary Search">Binary Search</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="grid gap-4">
          {paginatedProblems.map((problem) => (
            <div key={problem._id} className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 hover:bg-slate-900 hover:border-slate-700 transition cursor-pointer group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <NavLink to={`/problem/${problem._id}`} className="text-xl font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors">
                      {problem.title}
                    </NavLink>

                    {isProblemSolved(problem._id) && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-300 rounded-full border border-emerald-500/40">
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span className="text-sm font-medium">Solved</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>

                    {Array.isArray(problem.tags)
                      ? problem.tags.slice(0, 6).map((tag, i) => (
                          <span key={i} className="px-3 py-1 bg-slate-800/40 text-slate-300 rounded-lg text-sm border border-slate-700">
                            {tag}
                          </span>
                        ))
                      : problem.tags && (
                          <span className="px-3 py-1 bg-slate-800/40 text-slate-300 rounded-lg text-sm border border-slate-700">{String(problem.tags)}</span>
                        )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <NavLink to={`/problem/${problem._id}`} className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition cursor-pointer border border-cyan-500/30 hover:border-cyan-500/50 font-medium">Solve</NavLink>
                  <div className="text-xs text-slate-400">{problem.attempts ? `${problem.attempts} attempts` : ''}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-3">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>

            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-10 h-10 rounded-lg cursor-pointer transition ${currentPage === idx + 1 ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black' : 'bg-slate-900 border border-slate-800 hover:bg-slate-800'}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        )}

        {/* Empty state */}
        {filteredProblems.length === 0 && (
          <div className="mt-12 text-center text-slate-400">No problems found. Try adjusting filters or search.</div>
        )}
      </main>

      {/* Footer - industry-ready responsive */}
      <footer className="bg-slate-900/80 backdrop-blur-md border-t border-slate-800 mt-16">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400 mb-4">Rapid-Code</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Master coding interviews with curated problems and a clean, fast platform. Built for speed and clarity.</p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><NavLink to="/problems" className="text-slate-400 hover:text-cyan-400 transition cursor-pointer">Problems</NavLink></li>
                <li><NavLink to="/contests" className="text-slate-400 hover:text-cyan-400 transition cursor-pointer">Contests</NavLink></li>
                <li><NavLink to="/discuss" className="text-slate-400 hover:text-cyan-400 transition cursor-pointer">Discuss</NavLink></li>
                <li><NavLink to="/interview" className="text-slate-400 hover:text-cyan-400 transition cursor-pointer">Interview</NavLink></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition cursor-pointer">About</a></li>
                <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition cursor-pointer">Careers</a></li>
                <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition cursor-pointer">Press</a></li>
                <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition cursor-pointer">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition cursor-pointer">Documentation</a></li>
                <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition cursor-pointer">API</a></li>
                <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition cursor-pointer">Support</a></li>
                <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition cursor-pointer">Community</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-400 text-sm">© {new Date().getFullYear()} Rapid-Code. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="text-slate-400 hover:text-cyan-400 transition cursor-pointer text-sm">Privacy Policy</a>
                <a href="#" className="text-slate-400 hover:text-cyan-400 transition cursor-pointer text-sm">Terms</a>
                <a href="#" className="text-slate-400 hover:text-cyan-400 transition cursor-pointer text-sm">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function getDifficultyColor(difficulty) {
  switch ((String(difficulty || '')).toLowerCase()) {
    case 'easy': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
    case 'medium': return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
    case 'hard': return 'bg-rose-500/20 text-rose-300 border-rose-500/50';
    default: return 'bg-slate-600/20 text-slate-400 border-slate-600/50';
  }
}



