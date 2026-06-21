'use client';
import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Code, Crosshair, Check, RotateCcw,
  Rocket, TrendingUp, Trophy, Server, Layers, Brain, Database,
  BookOpen, Briefcase, Target, FileText,
} from 'lucide-react';
import { COURSE_ICONS, COURSE_COLORS } from '@/config/courseConfig';

const QUIZ_STEPS = [
  {
    id: 'level',
    label: 'Step 1 of 3',
    question: "What's your experience level?",
    subtitle: 'This helps us calibrate the right starting point for you.',
    options: [
      { value: 'beginner', label: 'Beginner', desc: 'New to programming or switching careers', icon: Rocket, color: '#22c55e' },
      { value: 'intermediate', label: 'Intermediate', desc: '1-3 years of experience, solid fundamentals', icon: TrendingUp, color: '#3b82f6' },
      { value: 'advanced', label: 'Advanced', desc: '3+ years, looking to master new domains', icon: Trophy, color: '#a855f7' },
    ],
  },
  {
    id: 'interest',
    label: 'Step 2 of 3',
    question: 'What interests you most?',
    subtitle: 'Pick the area you want to focus on.',
    options: [
      { value: 'backend', label: 'Backend Development', desc: 'APIs, servers, databases, system design', icon: Server, color: '#22c55e' },
      { value: 'fullstack', label: 'Full-Stack Development', desc: 'Frontend + backend, end-to-end apps', icon: Layers, color: '#3b82f6' },
      { value: 'ai', label: 'AI & Machine Learning', desc: 'Math foundations, RAG, LLMs, data science', icon: Brain, color: '#a855f7' },
      { value: 'data', label: 'Data & Databases', desc: 'SQL mastery, data pipelines, analytics', icon: Database, color: '#f97316' },
    ],
  },
  {
    id: 'goal',
    label: 'Step 3 of 3',
    question: "What's driving your learning?",
    subtitle: 'This helps us prioritize what matters most to you.',
    options: [
      { value: 'career', label: 'Career Switch', desc: 'Transitioning into tech from another field', icon: Briefcase, color: '#22c55e' },
      { value: 'upskill', label: 'Upskilling', desc: 'Getting better at what I already do', icon: Target, color: '#3b82f6' },
      { value: 'interview', label: 'Interview Prep', desc: 'Preparing for technical interviews', icon: FileText, color: '#a855f7' },
      { value: 'projects', label: 'Build Projects', desc: 'I want to ship real stuff', icon: BookOpen, color: '#f97316' },
    ],
  },
];

const QUIZ_RECOMMENDATIONS = {
  backend: {
    tagline: 'Backend Engineering',
    path: 'backend-engineer',
    courses: ['python', 'sql', 'go'],
    message: "Great choice! We recommend starting with Python for server-side logic, then SQL for databases, and Go for high-performance services. This path covers everything from REST APIs to microservices.",
  },
  fullstack: {
    tagline: 'Full-Stack Development',
    path: 'full-stack-developer',
    courses: ['python', 'javascript', 'sql'],
    message: "Full-stack is a powerful combo. Start with Python for backend APIs, JavaScript for frontend interactivity, and SQL for data persistence. You'll be building complete web applications in no time.",
  },
  ai: {
    tagline: 'AI & Machine Learning',
    path: 'ai-engineer',
    courses: ['mathematics-for-ai', 'neural-networks-from-scratch', 'fine-tuning-llms'],
    message: "AI is the future! Start with Mathematics for AI foundations, then learn neural networks from scratch, and cap it off with LLM fine-tuning. This path takes you from theory to production AI.",
  },
  data: {
    tagline: 'Data Engineering',
    path: 'backend-engineer',
    courses: ['sql', 'python', 'numpy-linear-algebra'],
    message: "Data is the backbone. Master SQL for querying and managing data, Python for scripting and automation, and NumPy for numerical computing. You'll be handling data pipelines like a pro.",
  },
};

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } } };
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };

interface SkillQuizProps {
  t: any;
  isDark: boolean;
  courses: any[];
  learningPaths: any[];
  navigate: (url: string) => void;
  onCourseClick: (course: any) => void;
}

const SkillQuiz = ({ t, isDark, courses, learningPaths, navigate, onCourseClick }: SkillQuizProps) => {
  const [step, setStep] = useState<number>(-1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const handleSelect = (stepId: string, value: string) => {
    const newAnswers = { ...answers, [stepId]: value };
    setAnswers(newAnswers);
    setTimeout(() => setStep(s => s + 1), 300);
  };

  const handleReset = () => {
    setStep(-1);
    setAnswers({});
  };

  const recommendation = QUIZ_RECOMMENDATIONS[answers.interest as keyof typeof QUIZ_RECOMMENDATIONS] || QUIZ_RECOMMENDATIONS.backend;
  const recPath = learningPaths.find(lp => lp.slug === recommendation.path);
  const recCourses = recommendation.courses
    .map(slug => courses.find(c => c.slug === slug))
    .filter(Boolean)
    .slice(0, 3);

  const levelLabel = ({ beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' } as Record<string, string>)[answers.level] || '';
  const goalLabel = ({ career: 'career switch', upskill: 'upskilling', interview: 'interview prep', projects: 'building projects' } as Record<string, string>)[answers.goal] || '';

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? 'show' : 'hidden'}
      variants={stagger}
      className="border-t"
      style={{ borderColor: t.borderSubtle, backgroundColor: t.bg }}
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-24">
        <motion.div variants={fadeUp} className="mb-12">
          <span className="text-[11px] uppercase tracking-[0.15em] font-bold mb-3 block" style={{ color: t.purple, fontFamily: 'JetBrains Mono, monospace' }}>
            Find Your Path
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2" style={{ color: t.text }}>
            Not sure where to start?
          </h2>
          <p className="text-sm max-w-lg" style={{ color: t.textSec }}>
            Take a 30-second quiz and get a personalized learning recommendation.
          </p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <div
            className="relative rounded-2xl border overflow-hidden"
            style={{ backgroundColor: t.surface, borderColor: t.border }}
          >
            {step >= 0 && step < 3 && (
              <div className="h-1" style={{ backgroundColor: t.borderSubtle }}>
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: t.primary }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${((step + 1) / 3) * 100}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            )}
            {step === 3 && <div className="h-1" style={{ backgroundColor: t.primary }} />}

            <div className="p-8 lg:p-12 min-h-[340px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {step === -1 && (
                  <motion.div key="start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="text-center max-w-md mx-auto">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: t.purple + '12' }}>
                      <Crosshair size={28} style={{ color: t.purple }} />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: t.text }}>Skill Assessment</h3>
                    <p className="text-sm mb-8 leading-relaxed" style={{ color: t.textSec }}>
                      Answer 3 quick questions and we&apos;ll recommend the perfect learning path and courses for you.
                    </p>
                    <button data-testid="quiz-start-btn" onClick={() => setStep(0)} className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-200" style={{ backgroundColor: t.purple, color: '#fff' }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 24px ${t.purple}60`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                      Start Quiz <ArrowRight size={15} />
                    </button>
                  </motion.div>
                )}

                {step >= 0 && step < 3 && (
                  <motion.div key={`step-${step}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }} className="w-full max-w-2xl mx-auto">
                    <div className="mb-8">
                      <span className="text-[11px] uppercase tracking-[0.15em] font-bold mb-2 block" style={{ color: t.purple, fontFamily: 'JetBrains Mono, monospace' }}>{QUIZ_STEPS[step].label}</span>
                      <h3 className="text-xl font-bold mb-1" style={{ color: t.text }}>{QUIZ_STEPS[step].question}</h3>
                      <p className="text-sm" style={{ color: t.textMut }}>{QUIZ_STEPS[step].subtitle}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {QUIZ_STEPS[step].options.map(opt => {
                        const selected = answers[QUIZ_STEPS[step].id] === opt.value;
                        const OptIcon = opt.icon;
                        return (
                          <button key={opt.value} data-testid={`quiz-option-${opt.value}`} onClick={() => handleSelect(QUIZ_STEPS[step].id, opt.value)}
                            className="group relative text-left rounded-xl border p-5 transition-all duration-200"
                            style={{ backgroundColor: selected ? opt.color + '10' : isDark ? t.surfaceHi : '#fff', borderColor: selected ? opt.color + '50' : t.border }}
                            onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = opt.color + '40'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                            onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.transform = 'translateY(0)'; } }}>
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110" style={{ backgroundColor: opt.color + '15' }}>
                                <OptIcon size={18} style={{ color: opt.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold mb-0.5" style={{ color: t.text }}>{opt.label}</div>
                                <div className="text-xs" style={{ color: t.textMut }}>{opt.desc}</div>
                              </div>
                              {selected && (
                                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: opt.color }}>
                                  <Check size={12} className="text-white" />
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {step > 0 && (
                      <button data-testid="quiz-back-btn" onClick={() => setStep(s => s - 1)} className="mt-4 text-xs font-medium flex items-center gap-1 transition-colors" style={{ color: t.textMut }}
                        onMouseEnter={e => { e.currentTarget.style.color = t.text; }} onMouseLeave={e => { e.currentTarget.style.color = t.textMut; }}>
                        <RotateCcw size={11} /> Back
                      </button>
                    )}
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }} className="w-full max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: t.primary + '15' }}>
                        <Check size={26} style={{ color: t.primary }} />
                      </div>
                      <h3 className="text-xl font-bold mb-1" style={{ color: t.text }}>Your personalized path</h3>
                      <p className="text-sm" style={{ color: t.textMut }}>{levelLabel} &middot; {recommendation.tagline} &middot; Focused on {goalLabel}</p>
                    </div>
                    <div className="rounded-xl border p-5 mb-6" style={{ backgroundColor: isDark ? t.surfaceHi : '#fff', borderColor: t.primary + '30', borderLeft: `3px solid ${t.primary}` }}>
                      <p className="text-sm leading-relaxed" style={{ color: t.textSec }}>{recommendation.message}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                      {recCourses.map((course, i) => {
                        const Icon = COURSE_ICONS[course.slug] || Code;
                        const accent = COURSE_COLORS[course.slug] || t.primary;
                        return (
                          <button key={course.slug} data-testid={`quiz-rec-course-${course.slug}`} onClick={() => onCourseClick(course)}
                            className="group text-left rounded-xl border p-4 transition-all duration-200" style={{ backgroundColor: isDark ? t.surfaceHi : '#fff', borderColor: t.border }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = accent + '50'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.transform = 'translateY(0)'; }}>
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: accent + '15' }}><Icon size={16} style={{ color: accent }} /></div>
                              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: accent, fontFamily: 'JetBrains Mono, monospace' }}>#{i + 1}</span>
                            </div>
                            <h3 className="text-sm font-bold mb-0.5" style={{ color: t.text }}>{course.title}</h3>
                            <span className="text-[11px]" style={{ color: t.textMut, fontFamily: 'JetBrains Mono, monospace' }}>{course.lesson_count} lessons</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
                      {recPath && (
                        <button data-testid="quiz-start-path-btn" onClick={() => navigate(`/paths/${recPath.slug}`)} className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-200" style={{ backgroundColor: t.primary, color: '#052e16' }}
                          onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 24px ${t.glow}`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                          Start {recommendation.tagline} Path <ArrowRight size={15} />
                        </button>
                      )}
                      <button data-testid="quiz-retake-btn" onClick={handleReset} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold border transition-all duration-200" style={{ color: t.textSec, borderColor: t.border }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = t.textMut; e.currentTarget.style.color = t.text; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textSec; }}>
                        <RotateCcw size={12} /> Retake Quiz
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default SkillQuiz;
