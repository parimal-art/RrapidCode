import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router';
import axiosClient from '../utils/axiosclient';
import {
  CheckCircle2, Code2, Zap, TrendingUp, Target,
  Award, ArrowLeft, BarChart2, Tag, Star, Clock
} from 'lucide-react';

// ─── tiny donut chart (pure SVG, no lib needed) ───────────────────────────────
function DonutChart({ value, max, color, size = 120, stroke = 12 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? value / max : 0;
  const dash = pct * circ;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="#1e293b" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease' }} />
    </svg>
  );
}

// ─── horizontal bar ────────────────────────────────────────────────────────────
function Bar({ label, count, total, color, textColor }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className={`font-medium ${textColor}`}>{label}</span>
        <span className="text-slate-400">{count} / {total}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-1000`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-100">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth || {});
  const navigate = useNavigate();

  const [allProblems, setAllProblems]     = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [allRes, solvedRes] = await Promise.all([
          axiosClient.get('/problem/get-all-problem'),
          axiosClient.get('/problem/problems-solved-by-user'),
        ]);
        setAllProblems(Array.isArray(allRes?.data?.data) ? allRes.data.data : []);
        // API returns { data: { problemsSolved: [...] } }
        const raw = solvedRes?.data?.data;
        const solved = raw?.problemsSolved ?? (Array.isArray(raw) ? raw : []);
        setSolvedProblems(solved);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── derived stats ────────────────────────────────────────────────────────────
  const totalAll    = allProblems.length;
  const totalSolved = solvedProblems.length;

  const byDiff = (diff) => allProblems.filter(p =>
    String(p.difficulty || '').toLowerCase() === diff
  );
  const solvedByDiff = (diff) => solvedProblems.filter(p =>
    String(p.difficulty || '').toLowerCase() === diff
  );

  const easyAll    = byDiff('easy').length;
  const mediumAll  = byDiff('medium').length;
  const hardAll    = byDiff('hard').length;
  const easySolved = solvedByDiff('easy').length;
  const medSolved  = solvedByDiff('medium').length;
  const hardSolved = solvedByDiff('hard').length;

  // tag frequency among solved problems
  const tagMap = {};
  solvedProblems.forEach(p => {
    (Array.isArray(p.tags) ? p.tags : []).forEach(t => {
      tagMap[t] = (tagMap[t] || 0) + 1;
    });
  });
  const topTags = Object.entries(tagMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const pctSolved = totalAll > 0 ? Math.round((totalSolved / totalAll) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#060712] via-[#071023] to-[#05060a] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-cyan-400"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#060712] via-[#071023] to-[#05060a] text-slate-100">

      {/* ── nav ─────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400">
          Rapid-Code
        </span>
        <div className="w-16" />
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

        {/* ── hero card ───────────────────────────────────────────────────── */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
            {user?.FirstName?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-slate-100">{user?.FirstName ?? 'User'}</h1>
            <p className="text-slate-400 text-sm mt-1">{user?.emailId}</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium">
                {user?.role === 'admin' ? '👑 Admin' : '👤 User'}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                ✅ {totalSolved} Solved
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-medium">
                🎯 {pctSolved}% Completion
              </span>
            </div>
          </div>

          {/* big donut */}
          <div className="relative flex-shrink-0">
            <DonutChart value={totalSolved} max={totalAll} color="#22d3ee" size={130} stroke={13} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-cyan-300">{totalSolved}</span>
              <span className="text-xs text-slate-500">/ {totalAll}</span>
            </div>
          </div>
        </div>

        {/* ── stat cards row ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={Target}     label="Total Solved"   value={totalSolved}
            accent="bg-cyan-500/10 text-cyan-400" />
          <StatCard icon={CheckCircle2} label="Easy Solved"  value={easySolved}
            sub={`of ${easyAll}`}   accent="bg-emerald-500/10 text-emerald-400" />
          <StatCard icon={Zap}        label="Medium Solved"  value={medSolved}
            sub={`of ${mediumAll}`} accent="bg-amber-500/10 text-amber-400" />
          <StatCard icon={Star}       label="Hard Solved"    value={hardSolved}
            sub={`of ${hardAll}`}   accent="bg-rose-500/10 text-rose-400" />
        </div>

        {/* ── difficulty breakdown + tag chart ────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* difficulty bars */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-cyan-400" /> Difficulty Breakdown
            </h2>

            {/* three donuts */}
            <div className="flex justify-around py-2">
              {[
                { label: 'Easy',   solved: easySolved, total: easyAll,   color: '#34d399', textColor: 'text-emerald-400' },
                { label: 'Medium', solved: medSolved,  total: mediumAll,  color: '#fbbf24', textColor: 'text-amber-400' },
                { label: 'Hard',   solved: hardSolved, total: hardAll,    color: '#f87171', textColor: 'text-rose-400' },
              ].map(({ label, solved, total, color, textColor }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <div className="relative">
                    <DonutChart value={solved} max={total} color={color} size={80} stroke={9} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-base font-bold ${textColor}`}>{solved}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-medium ${textColor}`}>{label}</span>
                  <span className="text-xs text-slate-500">{total} total</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-2">
              <Bar label="Easy"   count={easySolved} total={easyAll}
                color="bg-emerald-500" textColor="text-emerald-400" />
              <Bar label="Medium" count={medSolved}  total={mediumAll}
                color="bg-amber-500"   textColor="text-amber-400" />
              <Bar label="Hard"   count={hardSolved} total={hardAll}
                color="bg-rose-500"    textColor="text-rose-400" />
            </div>
          </div>

          {/* tag heatmap */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-cyan-400" /> Top Topics You Solved
            </h2>
            {topTags.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-sm">
                <Code2 className="w-8 h-8 mb-2 opacity-30" />
                Solve problems to see your topic strengths
              </div>
            ) : (
              <div className="space-y-3">
                {topTags.map(([tag, count], i) => {
                  const maxCount = topTags[0][1];
                  const pct = (count / maxCount) * 100;
                  const colors = [
                    'bg-cyan-500', 'bg-blue-500', 'bg-violet-500',
                    'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
                    'bg-pink-500', 'bg-indigo-500'
                  ];
                  return (
                    <div key={tag} className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-24 truncate">{tag}</span>
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colors[i % colors.length]} transition-all duration-1000`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 w-4 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── overall progress ─────────────────────────────────────────────── */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-cyan-400" /> Overall Progress
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">Problems Solved</span>
                <span className="text-cyan-400 font-bold">{pctSolved}%</span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000"
                  style={{ width: `${pctSolved}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>0</span>
                <span>{totalSolved} solved</span>
                <span>{totalAll} total</span>
              </div>
            </div>
          </div>

          {/* milestone badges */}
          <div className="flex flex-wrap gap-3 mt-6">
            {[
              { threshold: 1,   label: '🌱 First Solve',    color: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' },
              { threshold: 10,  label: '🔥 10 Solves',      color: 'border-amber-500/40   text-amber-300   bg-amber-500/10'   },
              { threshold: 25,  label: '⚡ 25 Solves',      color: 'border-cyan-500/40    text-cyan-300    bg-cyan-500/10'    },
              { threshold: 50,  label: '💎 50 Solves',      color: 'border-blue-500/40    text-blue-300    bg-blue-500/10'    },
              { threshold: 100, label: '🏆 100 Solves',     color: 'border-violet-500/40  text-violet-300  bg-violet-500/10'  },
            ].map(({ threshold, label, color }) => (
              <div
                key={threshold}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  totalSolved >= threshold
                    ? color
                    : 'border-slate-700 text-slate-600 bg-slate-800/40 opacity-40'
                }`}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* ── recently solved problems list ────────────────────────────────── */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-cyan-400" /> Solved Problems
          </h2>
          {solvedProblems.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              <Code2 className="w-10 h-10 mx-auto mb-2 opacity-20" />
              No problems solved yet. Go solve some!
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {solvedProblems.map((p) => {
                const diff = String(p.difficulty || '').toLowerCase();
                const diffStyle = {
                  easy:   'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
                  medium: 'bg-amber-500/10   text-amber-300   border-amber-500/30',
                  hard:   'bg-rose-500/10    text-rose-300    border-rose-500/30',
                }[diff] ?? 'bg-slate-700/30 text-slate-400 border-slate-600';

                return (
                  <div key={p._id}
                    className="flex items-center justify-between py-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <NavLink
                        to={`/problem/${p._id}`}
                        className="text-sm font-medium text-slate-200 group-hover:text-cyan-400 transition truncate"
                      >
                        {p.title}
                      </NavLink>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <span className={`px-2.5 py-0.5 rounded-full border text-xs font-medium ${diffStyle}`}>
                        {p.difficulty ?? 'N/A'}
                      </span>
                      {Array.isArray(p.tags) && p.tags.slice(0, 2).map((t, i) => (
                        <span key={i} className="hidden sm:inline px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-xs border border-slate-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}