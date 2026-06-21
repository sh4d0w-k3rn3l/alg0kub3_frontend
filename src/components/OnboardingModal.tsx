'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, BookOpen, Brain, Code, Database, Globe, Cpu, Rocket, Check } from 'lucide-react';
import { api } from '@/lib/api';

interface InterestOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  color: string;
}

const INTEREST_OPTIONS: InterestOption[] = [
  { id: 'python', label: 'Python', icon: Code, color: '#3572A5' },
  { id: 'ai-ml', label: 'AI & Machine Learning', icon: Brain, color: '#f59e0b' },
  { id: 'web-dev', label: 'Web Development', icon: Globe, color: '#3b82f6' },
  { id: 'dsa', label: 'Data Structures & Algorithms', icon: Database, color: '#22c55e' },
  { id: 'system-design', label: 'System Design', icon: Cpu, color: '#8b5cf6' },
  { id: 'devops', label: 'DevOps & Cloud', icon: Rocket, color: '#ef4444' },
];

const INTEREST_TO_COURSES: Record<string, string[]> = {
  'python': ['python', 'introduction-to-pandas-for-data-analysis'],
  'ai-ml': ['ai-engineering', 'neural-networks-from-scratch', 'fine-tuning-llms', 'prompt-engineering'],
  'web-dev': ['javascript', 'typescript'],
  'dsa': ['python', 'java', 'go'],
  'system-design': ['python', 'java'],
  'devops': ['devops', 'go'],
};

interface Course {
  id: number;
  slug: string;
  title: string;
  lesson_count: number;
  section_count: number;
}

const OnboardingModal = () => {
  const { colors: t, isDark } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [recommended, setRecommended] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (!user) return;
    const token = null;
    if (!token) return;

    const ac = new AbortController();

    api.get<{ completed: boolean }>('/user/onboarding', { headers: { Authorization: `Bearer ${token}` }, signal: ac.signal })
      .then(r => {
        if (ac.signal.aborted) return;
        if (!r.data.completed) setShow(true);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
      });

    api.get<{ courses: Course[] } | Course[]>('/courses?limit=100', { signal: ac.signal, cache: 'no-store' }).then(r => {
      if (ac.signal.aborted) return;
      setAllCourses('courses' in r.data ? r.data.courses : (r.data as Course[]) || []);
    }).catch((err: unknown) => {
      if (err instanceof DOMException && err.name === 'AbortError') return;
    });

    return () => ac.abort();
  }, [user]);

  const toggleInterest = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleNext = () => {
    if (step === 0 && selected.length > 0) {
      const slugs = new Set<string>();
      selected.forEach(interest => {
        (INTEREST_TO_COURSES[interest] || []).forEach(s => slugs.add(s));
      });
      const recs = allCourses
        .filter(c => slugs.has(c.slug) && c.lesson_count > 0)
        .slice(0, 4);
      setRecommended(recs.length > 0 ? recs : allCourses.filter(c => c.lesson_count > 0).slice(0, 4));
      setStep(1);
    }
  };

  const handleComplete = async (courseSlug: string | null) => {
    const token = null;
    try {
      await api.post('/user/onboarding', { interests: selected }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
    setShow(false);
    if (courseSlug) {
      router.push(`/course/${courseSlug}`);
    }
  };

  const handleSkip = async () => {
    const token = null;
    try {
      await api.post('/user/onboarding', { interests: [] }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          data-testid="onboarding-modal"
          className="w-full max-w-lg rounded-2xl overflow-hidden border"
          style={{ backgroundColor: isDark ? '#0d1117' : '#ffffff', borderColor: t.borderSubtle }}
        >
          <div className="px-8 pt-8 pb-4 text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${t.primary}15` }}>
              <Sparkles size={24} style={{ color: t.primary }} />
            </div>
            <h2 data-testid="onboarding-title" className="text-xl font-bold mb-1" style={{ color: t.text }}>
              {step === 0 ? 'What do you want to learn?' : 'Recommended for you'}
            </h2>
            <p className="text-sm" style={{ color: t.textSec }}>
              {step === 0 ? 'Pick your interests so we can personalize your experience.' : 'Based on your interests, start with one of these:'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 pb-4">
            {[0, 1].map(s => (
              <div key={s} className="h-1 rounded-full transition-all" style={{
                width: step === s ? 24 : 8,
                backgroundColor: step >= s ? t.primary : t.borderSubtle,
              }} />
            ))}
          </div>

          <div className="px-8 pb-6">
            {step === 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {INTEREST_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = selected.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      data-testid={`interest-${opt.id}`}
                      onClick={() => toggleInterest(opt.id)}
                      className="flex items-center gap-3 p-3.5 rounded-xl text-left transition-all border"
                      style={{
                        borderColor: isSelected ? opt.color : t.borderSubtle,
                        backgroundColor: isSelected ? `${opt.color}10` : 'transparent',
                      }}
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${opt.color}18` }}>
                        <Icon size={16} style={{ color: opt.color }} />
                      </div>
                      <span className="text-sm font-medium flex-1" style={{ color: t.text }}>{opt.label}</span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: opt.color }}>
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {recommended.map(course => (
                  <button
                    key={course.id}
                    data-testid={`rec-course-${course.slug}`}
                    onClick={() => handleComplete(course.slug)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all border group"
                    style={{ borderColor: t.borderSubtle }}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = t.primary; e.currentTarget.style.backgroundColor = `${t.primary}08`; }}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = t.borderSubtle; e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${t.primary}15` }}>
                      <BookOpen size={18} style={{ color: t.primary }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: t.text }}>{course.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: t.textMut }}>
                        {course.section_count} sections &middot; {course.lesson_count} lessons
                      </p>
                    </div>
                    <ChevronRight size={16} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: t.primary }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="px-8 pb-8 flex items-center justify-between">
            <button
              data-testid="onboarding-skip"
              onClick={handleSkip}
              className="text-xs transition-colors"
              style={{ color: t.textMut }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = t.text; }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = t.textMut; }}
            >
              Skip for now
            </button>
            {step === 0 ? (
              <button
                data-testid="onboarding-next"
                onClick={handleNext}
                disabled={selected.length === 0}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold transition-all disabled:opacity-30"
                style={{ backgroundColor: t.primary, color: '#052e16' }}
              >
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button
                data-testid="onboarding-browse"
                onClick={() => handleComplete(null)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold transition-all"
                style={{ backgroundColor: t.primary, color: '#052e16' }}
              >
                Browse All Courses <ChevronRight size={14} />
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingModal;
