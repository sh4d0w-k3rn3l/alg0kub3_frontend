'use client';
import { useEffect, useRef, useState, Fragment, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import {
  ArrowLeft, Sparkles, Loader2, Check, ChevronUp,
  ChevronDown, Plus, X, Trash2, Edit2, BookOpen, Layers,
  RefreshCw, AlertCircle, CheckCircle2,
} from 'lucide-react';

interface CourseForm {
  topic: string;
  audience: string;
  section_count: number;
  lessons_per_section: number;
  focus_areas: string;
  content_style: string;
  category: string;
  language: string;
}

interface CourseOutline {
  title?: string;
  description?: string;
  sections: CourseSection[];
}

interface CourseSection {
  title: string;
  lessons: CourseLesson[];
}

interface CourseLesson {
  title: string;
  summary?: string;
}

interface GenerationStatus {
  status: string;
  progress_percent: number;
  completed_lessons: number;
  total_lessons: number;
  current_lesson?: string;
  failed_lessons?: Array<{ title: string }>;
}

const FALLBACK_CATEGORIES = [
  'Programming Languages',
  'AI & Machine Learning',
  'Data & Databases',
  'DevOps',
  'Web Development',
  'Mobile Development',
  'Cloud & Infrastructure',
];

const LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'sql', label: 'SQL' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'ruby', label: 'Ruby' },
];

const STEPS = [
  { label: 'Define', icon: Edit2 },
  { label: 'Outline', icon: Layers },
  { label: 'Generate', icon: Sparkles },
];

// ============ Step 1: Define Course ============
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StepDefine = ({ form, setForm, onNext, generating, categories }: any) => {
  const [creatingNew, setCreatingNew] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === '__new__') {
      setCreatingNew(true);
      setNewCategoryName('');
    } else {
      setCreatingNew(false);
      setForm((p: Record<string, unknown>) => ({ ...p, category: e.target.value }));
    }
  };

  const confirmNewCategory = () => {
    const trimmed = newCategoryName.trim();
    if (trimmed) {
      setForm((p: Record<string, unknown>) => ({ ...p, category: trimmed }));
      setCreatingNew(false);
    }
  };

  const cancelNewCategory = () => {
    setCreatingNew(false);
    setNewCategoryName('');
  };

  return (
  <div className="max-w-xl mx-auto">
    <h2 className="text-white text-xl font-bold mb-1">Define Your Course</h2>
    <p className="text-[#8b949e] text-sm mb-6">Tell us what you want to teach, and AI will create a structured course.</p>

    <div className="space-y-4">
      <div>
        <label className="text-[#8b949e] text-xs block mb-1.5">Course Topic *</label>
        <input
          data-testid="ai-topic-input"
          value={form.topic}
          onChange={(e) =>       setForm((p: CourseForm) => ({ ...p, topic: e.target.value }))}
          placeholder="e.g., Docker & Kubernetes for Developers"
          className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-4 py-3 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e] transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[#8b949e] text-xs block mb-1.5">Target Audience</label>
          <select
            data-testid="ai-audience-select"
            value={form.audience}
            onChange={(e) => setForm((p: CourseForm) => ({ ...p, audience: e.target.value }))}
            className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-4 py-3 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label className="text-[#8b949e] text-xs block mb-1.5">Content Style</label>
          <select
            data-testid="ai-style-select"
            value={form.content_style}
            onChange={(e) => setForm((p: CourseForm) => ({ ...p, content_style: e.target.value }))}
            className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-4 py-3 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]"
          >
            <option value="mixed">Mixed (Theory + Code)</option>
            <option value="code-heavy">Code-Heavy (Hands-on)</option>
            <option value="conceptual">Conceptual (Theory-first)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[#8b949e] text-xs block mb-1.5">Sections</label>
          <input
            data-testid="ai-sections-input"
            type="number" min="2" max="20"
            value={form.section_count}
            onChange={(e) => setForm((p: CourseForm) => ({ ...p, section_count: parseInt(e.target.value) || 6 }))}
            className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-4 py-3 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]"
          />
        </div>
        <div>
          <label className="text-[#8b949e] text-xs block mb-1.5">Lessons per Section</label>
          <input
            data-testid="ai-lessons-input"
            type="number" min="1" max="10"
            value={form.lessons_per_section}
            onChange={(e) => setForm((p: CourseForm) => ({ ...p, lessons_per_section: parseInt(e.target.value) || 3 }))}
            className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-4 py-3 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[#8b949e] text-xs block mb-1.5">Category</label>
          {creatingNew ? (
            <div className="flex gap-2">
              <input
                data-testid="ai-new-category-input"
                autoFocus
                type="text"
                placeholder="e.g. Cybersecurity"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmNewCategory()}
                className="flex-1 bg-[#0d1117] border border-[#22c55e] rounded-lg px-4 py-3 text-[#c9d1d9] text-sm outline-none"
              />
              <button
                data-testid="ai-confirm-new-category"
                onClick={confirmNewCategory}
                disabled={!newCategoryName.trim()}
                className="p-3 bg-[#22c55e] rounded-lg text-black hover:bg-[#1ea34b] disabled:opacity-40 transition-colors"
              ><Check size={16} /></button>
              <button
                data-testid="ai-cancel-new-category"
                onClick={cancelNewCategory}
                className="p-3 bg-[#21262d] rounded-lg text-[#8b949e] hover:bg-[#30363d] transition-colors"
              ><X size={16} /></button>
            </div>
          ) : (
            <select
              data-testid="ai-category-select"
              value={categories.includes(form.category) ? form.category : '__custom__'}
              onChange={handleCategoryChange}
              className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-4 py-3 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]"
            >
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              {!categories.includes(form.category) && form.category && (
                <option value="__custom__">{form.category}</option>
              )}
              <option value="__new__">+ Create New Category</option>
            </select>
          )}
        </div>
        <div>
          <label className="text-[#8b949e] text-xs block mb-1.5">Primary Language</label>
          <select
            data-testid="ai-language-select"
            value={form.language}
            onChange={(e) => setForm((p: CourseForm) => ({ ...p, language: e.target.value }))}
            className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-4 py-3 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]"
          >
            {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-[#8b949e] text-xs block mb-1.5">Special Focus (optional)</label>
        <textarea
          data-testid="ai-focus-input"
          value={form.focus_areas}
          onChange={(e) => setForm((p: CourseForm) => ({ ...p, focus_areas: e.target.value }))}
          placeholder="e.g., Include hands-on projects, focus on cloud deployment, real-world examples..."
          rows={2}
          className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-4 py-3 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e] resize-none"
        />
      </div>

      <button
        data-testid="ai-generate-outline-btn"
        onClick={onNext}
        disabled={!form.topic.trim() || generating}
        className="w-full flex items-center justify-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors mt-2"
      >
        {generating ? (
          <><Loader2 size={16} className="animate-spin" /> Generating Outline...</>
        ) : (
          <><Sparkles size={16} /> Generate Course Outline</>
        )}
      </button>
    </div>
  </div>
  );
};

// ============ Step 2: Review Outline ============
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StepOutline = ({ outline, setOutline, onBack, onNext, onRegenerate, generating }: any) => {
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);

  const updateSectionTitle = (sIdx: number, title: string) => {
    const updated = { ...outline, sections: [...outline.sections] };
    updated.sections[sIdx] = { ...updated.sections[sIdx], title };
    setOutline(updated);
  };

  const updateLessonTitle = (sIdx: number, lIdx: number, title: string) => {
    const updated = { ...outline, sections: [...outline.sections] };
    updated.sections[sIdx] = { ...updated.sections[sIdx], lessons: [...updated.sections[sIdx].lessons] };
    updated.sections[sIdx].lessons[lIdx] = { ...updated.sections[sIdx].lessons[lIdx], title };
    setOutline(updated);
  };

  const removeSection = (sIdx: number) => {
    const updated = { ...outline, sections: outline.sections.filter((_: Record<string, unknown>, i: number) => i !== sIdx) };
    setOutline(updated);
  };

  const removeLesson = (sIdx: number, lIdx: number) => {
    const updated = { ...outline, sections: [...outline.sections] };
    updated.sections[sIdx] = {
      ...updated.sections[sIdx],
      lessons:     updated.sections[sIdx].lessons.filter((_: CourseLesson, i: number) => i !== lIdx),
    };
    setOutline(updated);
  };

  const addLesson = (sIdx: number) => {
    const updated = { ...outline, sections: [...outline.sections] };
    updated.sections[sIdx] = {
      ...updated.sections[sIdx],
      lessons: [...updated.sections[sIdx].lessons, { title: 'New Lesson', summary: '' }],
    };
    setOutline(updated);
  };

  const addSection = () => {
    const updated = {
      ...outline,
      sections: [...outline.sections, { title: 'New Section', lessons: [{ title: 'New Lesson', summary: '' }] }],
    };
    setOutline(updated);
  };

  const moveSection = (idx: number, dir: number) => {
    const target = idx + dir;
    if (target < 0 || target >= outline.sections.length) return;
    const updated = { ...outline, sections: [...outline.sections] };
    [updated.sections[idx], updated.sections[target]] = [updated.sections[target], updated.sections[idx]];
    setOutline(updated);
  };

  const totalLessons = outline.sections.reduce((a: number, s: CourseSection) => a + s.lessons.length, 0);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-xl font-bold mb-1">Review & Edit Outline</h2>
          <p className="text-[#8b949e] text-sm">{outline.sections.length} sections, {totalLessons} lessons</p>
        </div>
        <button
          data-testid="ai-regenerate-btn"
          onClick={onRegenerate}
          disabled={generating}
          className="flex items-center gap-1.5 text-[#8b949e] hover:text-white text-xs border border-[#2d333b] hover:border-[#484f58] px-3 py-1.5 rounded-lg transition-colors"
        >
          {generating ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          Regenerate
        </button>
      </div>

      {/* Course title & description */}
      <div className="mb-5 p-4 rounded-xl border border-[#2d333b]" style={{ backgroundColor: '#161b22' }}>
        <input
          data-testid="ai-outline-title"
          value={outline.title || ''}
          onChange={(e) => setOutline((prev: CourseOutline | null) => ({ ...prev, title: e.target.value }))}
          className="w-full bg-transparent text-white font-bold text-lg outline-none mb-2"
        />
        <textarea
          value={outline.description || ''}
          onChange={(e) => setOutline((prev: CourseOutline | null) => ({ ...prev, description: e.target.value }))}
          className="w-full bg-transparent text-[#8b949e] text-sm outline-none resize-none"
          rows={2}
        />
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {outline.sections.map((section: CourseSection, sIdx: number) => (
          <div key={sIdx} className="border border-[#2d333b] rounded-xl overflow-hidden" style={{ backgroundColor: '#161b22' }}>
            {/* Section header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2d333b]">
              <span className="text-[#22c55e] text-xs font-bold w-6 text-center">{sIdx + 1}</span>
              {editingSection === sIdx ? (
                <input
                  autoFocus
                  value={section.title}
                  onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
                  onBlur={() => setEditingSection(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingSection(null)}
                  className="flex-1 bg-[#0d1117] border border-[#22c55e] rounded px-2 py-1 text-white text-sm outline-none"
                />
              ) : (
                <span
                  className="flex-1 text-white text-sm font-medium cursor-pointer hover:text-[#22c55e] transition-colors"
                  onClick={() => setEditingSection(sIdx)}
                >
                  {section.title}
                </span>
              )}
              <span className="text-[#484f58] text-[10px]">{section.lessons.length} lessons</span>
              <button onClick={() => moveSection(sIdx, -1)} disabled={sIdx === 0} className="text-[#484f58] hover:text-white disabled:opacity-20 p-0.5"><ChevronUp size={14} /></button>
              <button onClick={() => moveSection(sIdx, 1)} disabled={sIdx === outline.sections.length - 1} className="text-[#484f58] hover:text-white disabled:opacity-20 p-0.5"><ChevronDown size={14} /></button>
              <button onClick={() => removeSection(sIdx)} className="text-red-400/40 hover:text-red-400 p-0.5"><Trash2 size={13} /></button>
            </div>

            {/* Lessons */}
            <div className="px-4 py-2 space-y-1">
              {section.lessons.map((lesson: CourseLesson, lIdx: number) => (
                <div key={lIdx} className="flex items-center gap-2 py-1.5 group">
                  <span className="text-[#484f58] text-[10px] w-6 text-center">{sIdx + 1}.{lIdx + 1}</span>
                  {editingLesson === `${sIdx}-${lIdx}` ? (
                    <input
                      autoFocus
                      value={lesson.title}
                      onChange={(e) => updateLessonTitle(sIdx, lIdx, e.target.value)}
                      onBlur={() => setEditingLesson(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingLesson(null)}
                      className="flex-1 bg-[#0d1117] border border-[#22c55e] rounded px-2 py-1 text-[#c9d1d9] text-xs outline-none"
                    />
                  ) : (
                    <span
                      className="flex-1 text-[#c9d1d9] text-xs cursor-pointer hover:text-white transition-colors"
                      onClick={() => setEditingLesson(`${sIdx}-${lIdx}`)}
                    >
                      {lesson.title}
                    </span>
                  )}
                  <button onClick={() => removeLesson(sIdx, lIdx)} className="text-red-400/0 group-hover:text-red-400/40 hover:!text-red-400 p-0.5"><X size={12} /></button>
                </div>
              ))}
              <button
                onClick={() => addLesson(sIdx)}
                className="flex items-center gap-1 text-[#484f58] hover:text-[#22c55e] text-[10px] py-1 transition-colors"
              >
                <Plus size={10} /> Add lesson
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={addSection}
          className="w-full flex items-center justify-center gap-2 border border-dashed border-[#2d333b] hover:border-[#22c55e] text-[#484f58] hover:text-[#22c55e] rounded-xl py-3 text-xs transition-colors"
        >
          <Plus size={14} /> Add Section
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-6">
        <button onClick={onBack} className="text-[#8b949e] hover:text-white text-sm flex items-center gap-1">
          <ArrowLeft size={14} /> Back
        </button>
        <button
          data-testid="ai-start-generation-btn"
          onClick={onNext}
          className="flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
        >
          <Sparkles size={16} /> Generate All Content
        </button>
      </div>
    </div>
  );
};

// ============ Step 3: Generation Progress ============
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StepGenerate = ({ courseId, onDone }: any) => {
  const [status, setStatus] = useState<GenerationStatus | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!courseId) return;
    const ac = new AbortController();
    const poll = async () => {
      try {
        const res = await api.get<GenerationStatus>(`/ai/generation-status/${courseId}`, { signal: ac.signal });
        if (ac.signal.aborted) return;
        setStatus(res.data);
        if (res.data.status === 'complete') {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch (err: unknown) {
        if ((err as DOMException)?.name === 'AbortError') return;
        handleApiError(err);
      }
    };
    poll();
    intervalRef.current = setInterval(poll, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      ac.abort();
    };
  }, [courseId]);

  if (!status) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={32} className="text-[#22c55e] animate-spin" />
      </div>
    );
  }

  const isComplete = status.status === 'complete';
  const pct = status.progress_percent || 0;

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        {isComplete ? (
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#22c55e20' }}>
            <CheckCircle2 size={32} style={{ color: '#22c55e' }} />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#22c55e15' }}>
            <Sparkles size={28} className="text-[#22c55e] animate-pulse" />
          </div>
        )}
        <h2 className="text-white text-xl font-bold mb-1">
          {isComplete ? 'Course Generated!' : 'Generating Content...'}
        </h2>
        <p className="text-[#8b949e] text-sm">
          {isComplete
            ? `${status.completed_lessons} lessons created successfully`
            : `Generating lesson ${status.completed_lessons + 1} of ${status.total_lessons}`}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-[#8b949e]">{status.completed_lessons} / {status.total_lessons} lessons</span>
          <span className="text-[#22c55e] font-bold">{pct}%</span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#2d333b' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: '#22c55e' }}
          />
        </div>
      </div>

      {/* Current lesson */}
      {!isComplete && status.current_lesson && (
        <div className="border border-[#2d333b] rounded-lg p-4 mb-4" style={{ backgroundColor: '#161b22' }}>
          <div className="flex items-center gap-2">
            <Loader2 size={14} className="text-[#22c55e] animate-spin" />
            <span className="text-[#c9d1d9] text-sm">Creating: <strong>{status.current_lesson}</strong></span>
          </div>
        </div>
      )}

      {/* Failed lessons */}
      {status.failed_lessons?.length > 0 && (
        <div className="border border-red-400/20 rounded-lg p-4 mb-4" style={{ backgroundColor: '#161b2240' }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={14} className="text-red-400" />
            <span className="text-red-400 text-xs font-medium">{status.failed_lessons.length} lesson(s) failed</span>
          </div>
          {status.failed_lessons.map((fl: { title: string }, i: number) => (
            <p key={i} className="text-[#8b949e] text-xs ml-5">{fl.title}</p>
          ))}
        </div>
      )}

      {/* Complete actions */}
      {isComplete && (
        <div className="flex items-center gap-3 justify-center mt-6">
          <button
            data-testid="ai-view-course-btn"
            onClick={() => onDone('view')}
            className="flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            <BookOpen size={14} /> View Course
          </button>
          <button
            data-testid="ai-edit-admin-btn"
            onClick={() => onDone('admin')}
            className="flex items-center gap-2 border border-[#2d333b] hover:border-[#484f58] text-[#c9d1d9] px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            <Edit2 size={14} /> Edit in Admin
          </button>
          <button
            data-testid="ai-create-another-btn"
            onClick={() => onDone('new')}
            className="flex items-center gap-2 border border-[#2d333b] hover:border-[#484f58] text-[#c9d1d9] px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            <Plus size={14} /> Create Another
          </button>
        </div>
      )}
    </div>
  );
};

// ============ Main Wizard ============
const AICourseCreator = () => {
  const navigate = useRouter();
  const [step, setStep] = useState<number>(0);
  const [generating, setGenerating] = useState<boolean>(false);
  const [outline, setOutline] = useState<CourseOutline | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [courseSlug, setCourseSlug] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);

  useEffect(() => {
    const ac = new AbortController();
    api.get<string[]>('/categories', { signal: ac.signal }).then(res => {
      if (ac.signal.aborted) return;
      const fetched = res.data;
      if (Array.isArray(fetched) && fetched.length > 0) {
        const merged = [...new Set([...fetched, ...FALLBACK_CATEGORIES])].sort();
        setCategories(merged);
      }
    }).catch(() => {});
    return () => ac.abort();
  }, []);

  const [form, setForm] = useState({
    topic: '',
    audience: 'Beginner',
    section_count: 6,
    lessons_per_section: 3,
    focus_areas: '',
    content_style: 'mixed',
    category: 'Programming Languages',
    language: 'python',
  });

  const generateOutline = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await api.post<CourseOutline>('/ai/generate-outline', {
        topic: form.topic,
        audience: form.audience,
        section_count: form.section_count,
        lessons_per_section: form.lessons_per_section,
        focus_areas: form.focus_areas,
        content_style: form.content_style,
      });
      setOutline(res.data);
      setStep(1);
    } catch (err: unknown) {
      setError((err as { detail?: string }).detail || 'Failed to generate outline. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const startGeneration = async () => {
    setError('');
    const slug = (outline.title || form.topic).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setCourseSlug(slug);
    try {
      const res = await api.post<{ course_id: string }>('/ai/generate-course', {
        topic: outline.title || form.topic,
        slug,
        description: outline.description || '',
        audience: form.audience,
        content_style: form.content_style,
        category: form.category,
        language: form.language,
        sections: outline.sections,
      });
      setCourseId(res.data.course_id);
      setStep(2);
    } catch (err: unknown) {
      setError((err as { detail?: string }).detail || 'Failed to start generation.');
    }
  };

  const handleDone = async (action: string) => {
    if (action === 'view') {
      try {
        const res = await api.get<{ slug: string }>(`/courses/${courseSlug}/first-lesson`);
        navigate.push(`/learn/${courseSlug}/${res.data.slug}`);
      } catch {
        navigate.push('/');
      }
    } else if (action === 'admin') {
      navigate.push('/admin');
    } else {
      setStep(0);
      setOutline(null);
      setCourseId(null);
      setCourseSlug('');
      setForm((p: CourseForm) => ({ ...p, topic: '' }));
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      {/* Header */}
      <div className="border-b border-[#2d333b]" style={{ backgroundColor: '#161b22' }}>
        <div className="max-w-4xl mx-auto px-6 h-[52px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate.push('/admin')} className="text-[#8b949e] hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-[#22c55e]" />
              <span className="text-white font-bold text-sm">AI Course Creator</span>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => {
              const StepIcon = s.icon;
              const isActive = i === step;
              const isDone = i < step;
              return (
                <Fragment key={i}>
                  {i > 0 && <div className="w-8 h-[1px] mx-1" style={{ backgroundColor: isDone ? '#22c55e' : '#2d333b' }} />}
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{
                        backgroundColor: isDone ? '#22c55e' : isActive ? '#22c55e20' : '#2d333b',
                        color: isDone ? '#fff' : isActive ? '#22c55e' : '#484f58',
                      }}
                    >
                      {isDone ? <Check size={12} /> : <StepIcon size={12} />}
                    </div>
                    <span className="text-[11px] hidden sm:inline" style={{ color: isActive ? '#22c55e' : '#484f58' }}>{s.label}</span>
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        {error && (
          <div className="mb-6 p-3 rounded-lg border border-red-400/20 flex items-center gap-2 max-w-xl mx-auto" style={{ backgroundColor: '#161b22' }}>
            <AlertCircle size={14} className="text-red-400 shrink-0" />
            <span className="text-red-400 text-sm">{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-red-400/60 hover:text-red-400"><X size={14} /></button>
          </div>
        )}

        {step === 0 && <StepDefine form={form} setForm={setForm} onNext={generateOutline} generating={generating} categories={categories} />}
        {step === 1 && outline && (
          <StepOutline
            outline={outline}
            setOutline={setOutline}
            onBack={() => setStep(0)}
            onNext={startGeneration}
            onRegenerate={generateOutline}
            generating={generating}
          />
        )}
        {step === 2 && <StepGenerate courseId={courseId} onDone={handleDone} />}
      </div>
    </div>
  );
};

export default AICourseCreator;
