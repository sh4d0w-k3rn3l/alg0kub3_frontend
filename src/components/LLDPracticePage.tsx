'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronDown, Lock, Play, Code, ChevronRight, ArrowUp,
  Gamepad2, Grid2X2, Bot, FolderOpen, Users, MessageCircle,
  DollarSign, ShoppingBag, Braces, Layers, BookOpen, Eye,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'gamepad-2': Gamepad2, 'grid-2x2': Grid2X2, 'bot': Bot,
  'folder-open': FolderOpen, 'users': Users, 'message-circle': MessageCircle,
  'dollar-sign': DollarSign, 'shopping-bag': ShoppingBag, 'braces': Braces,
};

const DIFFICULTY_COLORS: Record<string, { text: string; bg: string }> = {
  'Easy': { text: '#4ade80', bg: 'rgba(74,222,128,0.08)' },
  'Medium': { text: '#fbbf24', bg: 'rgba(251,191,36,0.08)' },
  'Hard': { text: '#f87171', bg: 'rgba(248,113,113,0.08)' },
};

const SectionHeader = ({ section, isOpen, onToggle }: { section: any; isOpen: boolean; onToggle: () => void }) => {
  const Icon = ICON_MAP[section.icon] || Layers;
  return (
    <tr data-testid={`lld-section-${section.id}`}
      className="cursor-pointer select-none group"
      onClick={onToggle}
      style={{ backgroundColor: '#161b22' }}>
      <td className="px-4 py-3 text-center">
        <span className="text-sm font-bold text-[#22c55e]">{section.id}</span>
      </td>
      <td className="px-4 py-3" colSpan={5}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#8b949e] group-hover:text-white transition-colors">
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          <Icon size={16} className="text-[#8b949e]" />
          <span className="text-sm font-bold text-[#e6edf3]">{section.title}</span>
          <span className="text-xs text-[#484f58]">({section.problem_count} problems)</span>
        </div>
      </td>
    </tr>
  );
};

const ProblemRow = ({ problem, isPro, onStart, activeSession }: { problem: any; isPro: boolean; onStart: (slug: string) => void; activeSession: any }) => {
  const diff = DIFFICULTY_COLORS[problem.difficulty] || DIFFICULTY_COLORS.Medium;
  const canAccess = problem.free || isPro;
  const inProgress = !!activeSession;

  return (
    <tr data-testid={`lld-problem-${problem.slug}`} className="border-b border-[#161b22] hover:bg-[#161b22]/60 transition-colors">
      <td className="px-4 py-3" />
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 pl-8">
          <Code size={13} className="text-[#484f58] shrink-0" />
          <span className="text-sm text-[#c9d1d9]">{problem.title}</span>
          {inProgress && (
            <span data-testid={`lld-in-progress-${problem.slug}`}
              className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#1f6feb]/15 text-[#58a6ff] border border-[#1f6feb]/30">
              In Progress
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="text-xs font-medium" style={{ color: diff.text }}>{problem.difficulty}</span>
      </td>
      <td className="px-4 py-3 text-center">
        {problem.has_learn ? (
          <BookOpen size={15} className="inline-block text-[#8b949e] hover:text-[#58a6ff] cursor-pointer transition-colors" />
        ) : (
          <span className="text-[#2d333b]">-</span>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        {problem.has_simulation ? (
          <Eye size={15} className="inline-block text-[#8b949e] hover:text-[#58a6ff] cursor-pointer transition-colors" />
        ) : (
          <span className="text-[#2d333b]">-</span>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        {canAccess ? (
          inProgress ? (
            <button data-testid={`lld-resume-${problem.slug}`} onClick={() => onStart(problem.slug)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold bg-[#22c55e] hover:bg-[#16a34a] text-white transition-colors">
              <Play size={10} /> Resume
            </button>
          ) : (
            <button data-testid={`lld-start-${problem.slug}`} onClick={() => onStart(problem.slug)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold bg-[#22c55e] hover:bg-[#16a34a] text-white transition-colors">
              <Play size={10} /> Start
            </button>
          )
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium text-[#8b949e] border border-[#2d333b]">
            <Lock size={10} /> Premium
          </span>
        )}
      </td>
    </tr>
  );
};

const LLDPracticePage = () => {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState('All');
  const [accessFilter, setAccessFilter] = useState('All');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [totalProblems, setTotalProblems] = useState(0);
  const [totalSections, setTotalSections] = useState(0);
  const [userSessions, setUserSessions] = useState<Record<string, any>>({});
  const { user } = useAuth();
  const router = useRouter();
  const isPro = user?.subscription_status === 'pro';

  useEffect(() => {
    api.get<{ sections: any[]; total_problems: number; total_sections: number }>(`/lld/sections`)
      .then(res => {
        setSections(res.data.sections);
        setTotalProblems(res.data.total_problems);
        setTotalSections(res.data.total_sections);
        const open: Record<string, boolean> = {};
        res.data.sections.forEach((s: any) => { open[s.id] = true; });
        setOpenSections(open);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    if (user) {
      api.get<{ sessions: Record<string, any> }>(`/lld/user-sessions`)
        .then(res => setUserSessions(res.data.sessions || {}))
        .catch(() => {});
    }

    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [user]);

  const toggleSection = (id: string) => setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  const collapseAll = () => { const o: Record<string, boolean> = {}; sections.forEach(s => { o[s.id] = false; }); setOpenSections(o); };
  const expandAll = () => { const o: Record<string, boolean> = {}; sections.forEach(s => { o[s.id] = true; }); setOpenSections(o); };
  const allCollapsed = sections.length > 0 && sections.every(s => !openSections[s.id]);
  const handleStart = (slug: string) => router.push(`/practice/lld/${slug}`);

  const filtered = useMemo(() => {
    return sections.map(s => {
      const probs = s.problems.filter((p: any) => {
        if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (diffFilter !== 'All' && p.difficulty !== diffFilter) return false;
        if (accessFilter === 'Free' && !p.free) return false;
        if (accessFilter === 'Premium' && p.free) return false;
        return true;
      });
      return { ...s, problems: probs, problem_count: probs.length };
    }).filter(s => s.problems.length > 0);
  }, [sections, search, diffFilter, accessFilter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d1117' }}>
        <div className="w-6 h-6 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <PageHeader />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 data-testid="lld-page-title" className="text-3xl font-extrabold text-white tracking-tight">
            Low Level Design Practice
          </h1>
          <p className="text-sm text-[#8b949e] mt-1">
            Practice for Low Level Design Interviews step-by-step with AI powered evaluation and feedback
          </p>
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-xs text-[#8b949e]">
              <Layers size={12} /> {totalSections} sections
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[#8b949e]">
              <Code size={12} /> {totalProblems} problems
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex-1 min-w-[220px] relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484f58]" />
            <input data-testid="lld-search" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search problems..."
              className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg pl-9 pr-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e] placeholder-[#484f58]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8b949e]">Access:</span>
            <select data-testid="lld-access-filter" value={accessFilter} onChange={e => setAccessFilter(e.target.value)}
              className="bg-[#161b22] border border-[#2d333b] rounded-lg px-3 py-2 text-xs text-[#c9d1d9] outline-none cursor-pointer">
              <option value="All">All Problems</option>
              <option value="Free">Free</option>
              <option value="Premium">Premium</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8b949e]">Difficulty:</span>
            <select data-testid="lld-difficulty-filter" value={diffFilter} onChange={e => setDiffFilter(e.target.value)}
              className="bg-[#161b22] border border-[#2d333b] rounded-lg px-3 py-2 text-xs text-[#c9d1d9] outline-none cursor-pointer">
              <option value="All">All</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <button data-testid="lld-collapse-toggle" onClick={allCollapsed ? expandAll : collapseAll}
            className="text-xs text-[#8b949e] hover:text-white transition-colors px-2 py-2">
            {allCollapsed ? 'Expand All' : 'Collapse All'}
          </button>
        </div>

        <div className="rounded-xl border border-[#2d333b] overflow-hidden" style={{ backgroundColor: '#0d1117' }}>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#22c55e' }}>
                <th className="px-4 py-2.5 text-left text-xs font-bold text-[#0d1117] w-16">#</th>
                <th className="px-4 py-2.5 text-left text-xs font-bold text-[#0d1117]">Section / Problem</th>
                <th className="px-4 py-2.5 text-center text-xs font-bold text-[#0d1117] w-24">Difficulty</th>
                <th className="px-4 py-2.5 text-center text-xs font-bold text-[#0d1117] w-16">Learn</th>
                <th className="px-4 py-2.5 text-center text-xs font-bold text-[#0d1117] w-24">Simulation</th>
                <th className="px-4 py-2.5 text-center text-xs font-bold text-[#0d1117] w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(section => (
                <React.Fragment key={section.id}>
                  <SectionHeader section={section} isOpen={openSections[section.id]} onToggle={() => toggleSection(section.id)} />
                  {openSections[section.id] && section.problems.map((p: any) => (
                    <ProblemRow key={p.slug} problem={p} isPro={isPro} onStart={handleStart} activeSession={userSessions[p.slug]} />
                  ))}
                </React.Fragment>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-[#484f58] text-sm">No problems match your filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 w-10 h-10 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-white flex items-center justify-center shadow-lg transition-colors z-40">
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LLDPracticePage;
