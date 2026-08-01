'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronDown, Lock, Play,
  Code, MessageSquare, Users, PlayCircle, MapPin, ShoppingCart,
  CreditCard, Server, BarChart2, Clock, Cpu, Layers,
  ChevronRight, ArrowUp,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'code': Code, 'message-square': MessageSquare, 'users': Users,
  'play-circle': PlayCircle, 'map-pin': MapPin, 'search': Search,
  'shopping-cart': ShoppingCart, 'credit-card': CreditCard,
  'server': Server, 'bar-chart-2': BarChart2, 'clock': Clock, 'cpu': Cpu,
};

const DIFFICULTY_COLORS: Record<string, { text: string; bg: string }> = {
  'Easy': { text: '#4ade80', bg: 'rgba(74,222,128,0.08)' },
  'Medium': { text: '#fbbf24', bg: 'rgba(251,191,36,0.08)' },
  'Hard': { text: '#f87171', bg: 'rgba(248,113,113,0.08)' },
};

interface SDProblem {
  slug: string;
  title: string;
  difficulty: string;
  free: boolean;
}

interface SDSection {
  id: string;
  title: string;
  icon: string;
  problem_count: number;
  problems: SDProblem[];
}

const SectionHeader = ({ section, isOpen, onToggle }: { section: SDSection; isOpen: boolean; onToggle: () => void }) => {
  const Icon = ICON_MAP[section.icon] || Layers;
  return (
    <tr data-testid={`section-${section.id}`}
      className="cursor-pointer select-none group"
      onClick={onToggle}
      style={{ backgroundColor: '#161b22' }}>
      <td className="px-4 py-3 text-center">
        <span className="text-sm font-bold text-[#22c55e]">{section.id}</span>
      </td>
      <td className="px-4 py-3" colSpan={3}>
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

const ProblemRow = ({ problem, isPro, onStart, activeSession }: { problem: SDProblem; isPro: boolean; onStart: (slug: string) => void; activeSession: unknown }) => {
  const diff = DIFFICULTY_COLORS[problem.difficulty] || DIFFICULTY_COLORS.Medium;
  const canAccess = problem.free || isPro;
  const inProgress = !!activeSession;

  return (
    <tr data-testid={`problem-${problem.slug}`} className="border-b border-[#161b22] hover:bg-[#161b22]/60 transition-colors">
      <td className="px-4 py-3" />
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 pl-8">
          <Code size={13} className="text-[#484f58] shrink-0" />
          <span className="text-sm text-[#c9d1d9]">{problem.title}</span>
          {inProgress && (
            <span data-testid={`in-progress-${problem.slug}`}
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
        {canAccess ? (
          inProgress ? (
            <button data-testid={`resume-${problem.slug}`} onClick={() => onStart(problem.slug)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold bg-[#22c55e] hover:bg-[#16a34a] text-white transition-colors">
              <Play size={10} /> Resume
            </button>
          ) : (
            <button data-testid={`start-${problem.slug}`} onClick={() => onStart(problem.slug)}
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

const SystemDesignPage = () => {
  const [sections, setSections] = useState<SDSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState('All');
  const [accessFilter, setAccessFilter] = useState('All');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [totalProblems, setTotalProblems] = useState(0);
  const [totalSections, setTotalSections] = useState(0);
  const [userSessions, setUserSessions] = useState<Record<string, unknown>>({});
  const { user } = useAuth();
  const router = useRouter();
  const isPro = user?.subscription_status === 'pro';

  useEffect(() => {
    const ac = new AbortController();
    api.get<{ sections: SDSection[]; total_problems: number; total_sections: number }>(`/system-design/sections`, { signal: ac.signal })
      .then(res => {
        if (ac.signal.aborted) return;
        setSections(res.data.sections);
        setTotalProblems(res.data.total_problems);
        setTotalSections(res.data.total_sections);
        const open: Record<string, boolean> = {};
        res.data.sections.forEach((s) => { open[s.id] = true; });
        setOpenSections(open);
      })
      .catch(() => {})
      .finally(() => { if (!ac.signal.aborted) setLoading(false); });
    return () => ac.abort();
  }, []);

  useEffect(() => {
    if (!user) return;
    const ac = new AbortController();
    api.get<{ sessions: Record<string, unknown> }>(`/system-design/user-sessions`, { signal: ac.signal })
      .then(res => {
        if (ac.signal.aborted) return;
        setUserSessions(res.data.sessions || {});
      })
      .catch(() => {});
    return () => ac.abort();
  }, [user]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const collapseAll = () => {
    const open: Record<string, boolean> = {};
    sections.forEach(s => { open[s.id] = false; });
    setOpenSections(open);
  };

  const expandAll = () => {
    const open: Record<string, boolean> = {};
    sections.forEach(s => { open[s.id] = true; });
    setOpenSections(open);
  };

  const allCollapsed = sections.length > 0 && sections.every(s => !openSections[s.id]);

  const handleStart = (slug: string) => {
    router.push(`/system-design/${slug}`);
  };

  const filtered = useMemo(() => {
    return sections.map(s => {
      const probs = s.problems.filter((p) => {
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
          <h1 data-testid="sd-page-title" className="text-3xl font-extrabold text-white tracking-tight">
            System Design Interview Practice
          </h1>
          <p className="text-sm text-[#8b949e] mt-1">
            Practice for System Design Interviews step-by-step with AI powered evaluation and feedback
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
            <input data-testid="sd-search" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search problems..."
              className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg pl-9 pr-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e] placeholder-[#484f58]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8b949e]">Access:</span>
            <select data-testid="sd-access-filter" value={accessFilter} onChange={e => setAccessFilter(e.target.value)}
              className="bg-[#161b22] border border-[#2d333b] rounded-lg px-3 py-2 text-xs text-[#c9d1d9] outline-none cursor-pointer">
              <option value="All">All Problems</option>
              <option value="Free">Free</option>
              <option value="Premium">Premium</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8b949e]">Difficulty:</span>
            <select data-testid="sd-difficulty-filter" value={diffFilter} onChange={e => setDiffFilter(e.target.value)}
              className="bg-[#161b22] border border-[#2d333b] rounded-lg px-3 py-2 text-xs text-[#c9d1d9] outline-none cursor-pointer">
              <option value="All">All</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <button data-testid="sd-collapse-toggle" onClick={allCollapsed ? expandAll : collapseAll}
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
                <th className="px-4 py-2.5 text-center text-xs font-bold text-[#0d1117] w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(section => (
                <React.Fragment key={section.id}>
                  <SectionHeader section={section} isOpen={openSections[section.id]} onToggle={() => toggleSection(section.id)} />
                  {openSections[section.id] && section.problems.map((p) => (
                    <ProblemRow key={p.slug} problem={p} isPro={isPro} onStart={handleStart} activeSession={userSessions[p.slug]} />
                  ))}
                </React.Fragment>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="text-center py-12 text-[#484f58] text-sm">No problems match your filters</td></tr>
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

export default SystemDesignPage;
