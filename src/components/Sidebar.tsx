'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronUp, ChevronDown, Search, SlidersHorizontal, FileText, Code, Type, GitBranch, List, Braces, BookOpen, CircleDot, ChevronLeft, Package, File, AlertTriangle, Box, Layers, Repeat, AtSign, Brackets, Zap, Calendar, Calculator, HardDrive, Database, Globe, CheckSquare, Archive, Tag, Activity, Network, TrendingUp, Layout, Star, Wifi, Cpu, Folder, Lock, Brain, BarChart3, Rocket, Link as LinkIcon, Wrench, Users, Monitor, Terminal, Shield, MessageCircle, Clock, Settings, Map } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

interface Lesson {
  id?: number;
  slug: string;
  title: string;
  access_type?: string;
  completed?: boolean;
}

interface Section {
  id: number;
  title: string;
  icon?: string;
  total?: number;
  completed?: number;
  lessons?: Lesson[];
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sections?: Section[];
  activeSlug?: string;
  onLessonClick: (slug: string) => void;
  totalLessons?: number;
  isMobile?: boolean;
  courseSlug?: string;
  courseTitle?: string;
}

const iconMap: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  'file-text': FileText, 'code': Code, 'type': Type, 'git-branch': GitBranch,
  'list': List, 'parentheses': Braces, 'book-open': BookOpen, 'circle-dot': CircleDot,
  'function-square': Code, 'package': Package, 'file': File, 'alert-triangle': AlertTriangle,
  'box': Box, 'layers': Layers, 'repeat': Repeat, 'at-sign': AtSign,
  'search': Search, 'brackets': Brackets, 'braces': Braces, 'zap': Zap,
  'calendar': Calendar, 'calculator': Calculator, 'hard-drive': HardDrive,
  'database': Database, 'globe': Globe, 'check-square': CheckSquare, 'archive': Archive,
  'tag': Tag, 'activity': Activity, 'network': Network, 'trending-up': TrendingUp,
  'layout': Layout, 'star': Star, 'wifi': Wifi, 'cpu': Cpu, 'folder': Folder,
  'brain': Brain, 'target': CircleDot, 'grid': Layout, 'bar-chart': BarChart3,
  'rocket': Rocket, 'link': LinkIcon, 'wrench': Wrench, 'users': Users, 'monitor': Monitor,
  'terminal': Terminal, 'shield': Shield, 'message-circle': MessageCircle, 'clock': Clock,
  'lock': Lock,
  'settings': Settings,
};

const Sidebar = ({ isOpen, onToggle, sections = [], activeSlug, onLessonClick, totalLessons, isMobile, courseSlug, courseTitle }: SidebarProps) => {
  const { colors } = useTheme();
  const { isSubscribed } = useAuth();
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>(() => {
    const activeSection = sections.find(s => s.lessons?.some(l => l.slug === activeSlug));
    const initial: Record<number, boolean> = {};
    if (activeSection) initial[activeSection.id] = true;
    else if (sections.length > 0) initial[sections[0]?.id] = true;
    return initial;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const activeSectionId = sections.find(s => s.lessons?.some(l => l.slug === activeSlug))?.id;

  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const filteredSections = sections.map(section => ({
    ...section,
    lessons: (section.lessons || []).filter(lesson =>
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(section =>
    searchQuery === '' || section.lessons.length > 0 || section.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedTotal = sections.reduce((sum, s) => sum + (s.completed || 0), 0);

  if (!isOpen) return null;

  return (
    <aside className={`fixed left-0 top-[52px] bottom-[48px] w-[280px] border-r flex flex-col ${isMobile ? 'z-40' : 'z-30'}`} style={{ backgroundColor: colors.sidebarBg, borderColor: colors.borderLight }}>
      <div className="p-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: colors.bgCard }}>
            <Code size={14} style={{ color: colors.text }} />
          </div>
          <h2 className="text-sm font-semibold leading-tight" style={{ color: colors.text }}>{courseTitle || (courseSlug ? courseSlug.charAt(0).toUpperCase() + courseSlug.slice(1) + ' Course' : 'Python Course')}</h2>
        </div>
        <button onClick={onToggle} className="w-6 h-6 rounded flex items-center justify-center transition-colors" style={{ backgroundColor: colors.bgCard, color: colors.textSecondary }}>
          <ChevronLeft size={14} />
        </button>
      </div>

      <div className="px-4 pb-3 flex items-center justify-between">
        <span className="text-xs" style={{ color: colors.textSecondary }}>Progress</span>
        <span className="text-xs" style={{ color: colors.textSecondary }}>{completedTotal}/{totalLessons || 0} chapters</span>
      </div>

      <div className="px-4 pb-3 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 border rounded-md px-3 py-1.5" style={{ backgroundColor: colors.bgTertiary, borderColor: colors.border }}>
          <Search size={14} style={{ color: colors.textMuted }} />
          <input type="text" placeholder="Search topics..." value={searchQuery} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm outline-none w-full" style={{ color: colors.text }} />
        </div>
        <button className="w-8 h-8 flex items-center justify-center rounded-md border transition-colors" style={{ borderColor: colors.border, backgroundColor: colors.bgTertiary, color: colors.textSecondary }}>
          <SlidersHorizontal size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredSections.map((section) => {
          const IconComp = iconMap[section.icon || ''] || FileText;
          const isExpanded = expandedSections[section.id] || section.id === activeSectionId;
          return (
            <div key={section.id}>
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-4 py-2.5 transition-colors group text-left"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="flex-shrink-0"><IconComp size={15} style={{ color: colors.textSecondary }} /></span>
                  <span className="text-[13px] font-medium truncate" style={{ color: colors.text }} title={section.title}>{section.title}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="text-xs" style={{ color: colors.textMuted }}>{section.completed || 0}/{section.total || 0}</span>
                  {isExpanded ? <ChevronUp size={14} style={{ color: colors.textMuted }} /> : <ChevronDown size={14} style={{ color: colors.textMuted }} />}
                </div>
              </button>

              {isExpanded && (
                <div className="pb-1">
                  {(section.lessons || []).map((lesson) => {
                    const isLocked = !isSubscribed && lesson.access_type !== 'free';
                    return (
                      <button
                        key={lesson.id || lesson.slug}
                        data-testid={`sidebar-lesson-${lesson.slug}`}
                        onClick={() => onLessonClick(lesson.slug)}
                        className="w-full text-left pl-10 pr-4 py-2 text-[13px] transition-all duration-150 border-l-2 min-w-0"
                        style={{
                          color: lesson.slug === activeSlug ? colors.green : isLocked ? colors.textMuted : colors.textSecondary,
                          backgroundColor: lesson.slug === activeSlug ? colors.activeBg : 'transparent',
                          borderColor: lesson.slug === activeSlug ? colors.green : 'transparent',
                          opacity: isLocked ? 0.7 : 1,
                        }}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          {lesson.completed && (
                            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: colors.green }} />
                          )}
                          <span className="flex-1 truncate min-w-0" title={lesson.title}>{lesson.title}</span>
                          {isLocked && (
                            <Lock size={11} className="flex-shrink-0" style={{ color: colors.textMuted }} />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {courseSlug && (
        <div className="px-4 py-3 border-t" style={{ borderColor: colors.borderLight }}>
          <Link
            href={`/learn/${courseSlug}/course-roadmap`}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ color: colors.green, backgroundColor: `${colors.green}10` }}
          >
            <Map size={14} />
            <span>Course Roadmap</span>
          </Link>
        </div>
      )}

      <div className="h-2" />
    </aside>
  );
};

export default Sidebar;
