'use client';
import { useCallback, useRef, useState, Fragment, useEffect, type DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { ApiError } from '@/lib/api';
import {
  ArrowLeft, Upload, FileText, Loader2, Sparkles, Check,
  AlertCircle, ChevronRight, ChevronDown, Trash2, Plus,
} from 'lucide-react';

const CATEGORIES = [
  'Programming Languages', 'AI & Machine Learning', 'Data & Databases',
  'DevOps', 'Web Development', 'Mobile Development', 'Cloud & Infrastructure',
  'System Design', 'Interview Prep',
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
  { value: 'none', label: 'Language-agnostic' },
];

const STEP_LABELS = ['Upload PDF', 'Review Outline', 'Generating'];

const slugify = (s: string) =>
  (s || '').toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80);

// ───────────────────────────────────────────────────────────────
// Step 1 — Upload + Generate outline
// ───────────────────────────────────────────────────────────────
const StepUpload = ({ onOutlineReady }: { onOutlineReady: (pdfId: string, outline: Record<string, unknown>, filename: string) => void; }) => {
  const [uploadStatus, setUploadStatus] = useState({ pdf_id: null, num_pages: 0, filename: '', preview: '' });
  const [uploading, setUploading] = useState<boolean>(false);
  const [outlining, setOutlining] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [audience, setAudience] = useState('Beginner');
  const [sectionCount, setSectionCount] = useState<number>(0);
  const [lessonsPerSection, setLessonsPerSection] = useState<number>(0);
  const [focusAreas, setFocusAreas] = useState<string>('');
  const [contentStyle, setContentStyle] = useState('mixed');
  const [dragOver, setDragOver] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (selectedFile: File | undefined) => {
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', selectedFile);
      const res = await api.post<Record<string, unknown>>('/admin/pdf-to-course/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadStatus(res.data);
    } catch (e) {
      setError((e as ApiError).detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateOutline = async () => {
    if (!uploadStatus.pdf_id) return;
    setOutlining(true);
    setError('');
    try {
      const res = await api.post('/admin/pdf-to-course/outline', {
        pdf_id: uploadStatus.pdf_id,
        audience,
        section_count: sectionCount,
        lessons_per_section: lessonsPerSection,
        focus_areas: focusAreas,
        content_style: contentStyle,
      });
      onOutlineReady(uploadStatus.pdf_id, res.data, uploadStatus.filename);
    } catch (e) {
      setError((e as ApiError).detail || 'Outline generation failed');
    } finally {
      setOutlining(false);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) handleUpload(f);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-white text-xl font-bold mb-1">Upload a PDF</h2>
      <p className="text-[#8b949e] text-sm mb-6">
        Upload a reference PDF (book, whitepaper, course materials). The AI will extract the structure,
        propose a curriculum grounded in the source pages, and generate rich lesson content.
      </p>

      {!uploadStatus.pdf_id ? (
        <div
          data-testid="pdf-dropzone"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${dragOver ? 'border-[#22c55e] bg-[#22c55e]/5' : 'border-[#2d333b] hover:border-[#484f58]'}`}
        >
          <input
            ref={inputRef} type="file" accept="application/pdf" className="hidden"
            data-testid="pdf-file-input"
            onChange={(e) => handleUpload(e.target.files?.[0])}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-3 text-[#8b949e]">
              <Loader2 className="w-8 h-8 animate-spin text-[#22c55e]" />
              <span>Uploading & extracting text…</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-10 h-10 text-[#8b949e]" />
              <div>
                <div className="text-white font-medium">Drag & drop a PDF here</div>
                <div className="text-[#8b949e] text-xs mt-1">or click to browse (60 MB max)</div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#0d1117] border border-[#2d333b] rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#22c55e]/15 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#22c55e]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate" data-testid="pdf-filename">{uploadStatus.filename}</div>
              <div className="text-[#8b949e] text-xs">{uploadStatus.num_pages} pages · text extracted</div>
            </div>
            <Check className="w-5 h-5 text-[#22c55e]" />
          </div>
          {uploadStatus.preview && (
            <div className="mt-3 text-[#8b949e] text-xs bg-[#161b22] border border-[#1e2533] rounded p-2 max-h-24 overflow-y-auto font-mono leading-relaxed">
              {uploadStatus.preview.slice(0, 500)}…
            </div>
          )}
        </div>
      )}

      {uploadStatus.pdf_id && (
        <div className="space-y-4 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#8b949e] text-xs block mb-1.5">Audience</label>
              <select
                data-testid="pdf-audience-select"
                value={audience} onChange={(e) => setAudience(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#2d333b] rounded px-3 py-2 text-white text-sm focus:border-[#22c55e] outline-none"
              >
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
              </select>
            </div>
            <div>
              <label className="text-[#8b949e] text-xs block mb-1.5">Content style</label>
              <select
                data-testid="pdf-style-select"
                value={contentStyle} onChange={(e) => setContentStyle(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#2d333b] rounded px-3 py-2 text-white text-sm focus:border-[#22c55e] outline-none"
              >
                <option value="mixed">Mixed</option>
                <option value="code-heavy">Code-heavy</option>
                <option value="conceptual">Conceptual</option>
              </select>
            </div>
            <div>
              <label className="text-[#8b949e] text-xs block mb-1.5">Sections <span className="text-[#484f58]">(0 = auto)</span></label>
              <input
                data-testid="pdf-section-count"
                type="number" min="0" max="20"
                value={sectionCount} onChange={(e) => setSectionCount(parseInt(e.target.value) || 0)}
                className="w-full bg-[#0d1117] border border-[#2d333b] rounded px-3 py-2 text-white text-sm focus:border-[#22c55e] outline-none"
              />
            </div>
            <div>
              <label className="text-[#8b949e] text-xs block mb-1.5">Lessons / section <span className="text-[#484f58]">(0 = auto)</span></label>
              <input
                data-testid="pdf-lessons-per-section"
                type="number" min="0" max="20"
                value={lessonsPerSection} onChange={(e) => setLessonsPerSection(parseInt(e.target.value) || 0)}
                className="w-full bg-[#0d1117] border border-[#2d333b] rounded px-3 py-2 text-white text-sm focus:border-[#22c55e] outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-[#8b949e] text-xs block mb-1.5">Focus areas <span className="text-[#484f58]">(optional)</span></label>
            <input
              data-testid="pdf-focus-areas"
              placeholder="e.g., emphasise practical examples, skip appendix"
              value={focusAreas} onChange={(e) => setFocusAreas(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#2d333b] rounded px-3 py-2 text-white text-sm focus:border-[#22c55e] outline-none"
            />
          </div>
          <button
            data-testid="pdf-generate-outline-btn"
            onClick={handleGenerateOutline}
            disabled={outlining}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#22c55e] to-[#06b6d4] text-white font-medium px-4 py-2.5 rounded-md text-sm disabled:opacity-50 transition-opacity hover:opacity-90"
          >
            {outlining ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing PDF…</> : <><Sparkles className="w-4 h-4" /> Generate Outline</>}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#f87171] rounded p-3 text-sm" data-testid="pdf-error">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
        </div>
      )}
    </div>
  );
};

// ───────────────────────────────────────────────────────────────
// Step 2 — Review outline & generate course
// ───────────────────────────────────────────────────────────────
const StepReview = ({ pdfId, filename, outline, onGenerated, onBack }: { pdfId: string; filename: string; outline: Record<string, unknown>; onGenerated: (info: Record<string, unknown>) => void; onBack: () => void; }) => {
  const [title, setTitle] = useState(outline.title || '');
  const [slug, setSlug] = useState(slugify(outline.title || ''));
  const [description, setDescription] = useState(outline.description || '');
  const [category, setCategory] = useState(CATEGORIES.includes(outline.category) ? outline.category : 'Programming Languages');
  const [language, setLanguage] = useState(outline.language && LANGUAGES.find((l) => l.value === outline.language) ? outline.language : 'python');
  const [sections, setSections] = useState(outline.sections || []);
  const [openSection, setOpenSection] = useState<number>(0);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const totalLessons = sections.reduce((a: number, s: Record<string, unknown>) => a + ((s.lessons as unknown[])?.length || 0), 0);

  const updateLesson = (sIdx: number, lIdx: number, patch: Record<string, unknown>) => {
    const next = [...sections];
    next[sIdx] = { ...next[sIdx], lessons: [...(next[sIdx].lessons || [])] };
    next[sIdx].lessons[lIdx] = { ...next[sIdx].lessons[lIdx], ...patch };
    setSections(next);
  };
  const removeLesson = (sIdx: number, lIdx: number) => {
    const next = [...sections];
    next[sIdx] = { ...next[sIdx], lessons: [...(next[sIdx].lessons || [])] };
    next[sIdx].lessons.splice(lIdx, 1);
    setSections(next);
  };
  const addLesson = (sIdx: number) => {
    const next = [...sections];
    next[sIdx] = { ...next[sIdx], lessons: [...(next[sIdx].lessons || [])] };
    const lastLesson = next[sIdx].lessons.at(-1);
    const p = lastLesson?.page_end || 1;
    next[sIdx].lessons.push({ title: 'New Lesson', summary: '', page_start: p, page_end: p + 2 });
    setSections(next);
  };
  const updateSection = (sIdx: number, patch: Record<string, unknown>) => {
    const next = [...sections];
    next[sIdx] = { ...next[sIdx], ...patch };
    setSections(next);
  };
  const removeSection = (sIdx: number) => {
    setSections(sections.filter((_: Record<string, unknown>, i: number) => i !== sIdx));
  };

  const handleGenerate = async () => {
    if (!title.trim() || !slug.trim()) {
      setError('Title and slug are required');
      return;
    }
    if (totalLessons === 0) {
      setError('At least one lesson is required');
      return;
    }
    setGenerating(true);
    setError('');
    try {
      const res = await api.post<Record<string, unknown>>('/admin/pdf-to-course/generate', {
        pdf_id: pdfId,
        slug,
        title,
        description,
        category,
        language,
        audience: 'Beginner',
        content_style: 'mixed',
          sections: sections.map((s: Record<string, unknown>) => ({
            title: s.title as string,
            lessons: ((s.lessons as unknown[]) || []).map((l: Record<string, unknown>) => ({
            title: l.title as string,
            summary: (l.summary as string) || '',
            page_start: Math.max(1, parseInt(l.page_start as string) || 1),
            page_end: Math.max(parseInt(l.page_start as string) || 1, parseInt(l.page_end as string) || 1),
          })),
        })),
      });
      onGenerated(res.data);
    } catch (e) {
      setError((e as ApiError).detail || 'Course generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-white text-xl font-bold mb-1">Review the AI-drafted outline</h2>
      <p className="text-[#8b949e] text-sm mb-6">
        Edit titles, page ranges, and lesson lists — then kick off generation. Each lesson will be
        written using only the pages you set as its source.
      </p>

      <div className="bg-[#0d1117] border border-[#2d333b] rounded-lg p-4 mb-6">
        <div className="text-[#8b949e] text-xs mb-3">SOURCE · {filename}</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[#8b949e] text-xs block mb-1.5">Course title</label>
            <input
              data-testid="review-title-input"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setSlug(slugify(e.target.value)); }}
              className="w-full bg-[#161b22] border border-[#2d333b] rounded px-3 py-2 text-white text-sm focus:border-[#22c55e] outline-none"
            />
          </div>
          <div>
            <label className="text-[#8b949e] text-xs block mb-1.5">Slug</label>
            <input
              data-testid="review-slug-input"
              value={slug} onChange={(e) => setSlug(slugify(e.target.value))}
              className="w-full bg-[#161b22] border border-[#2d333b] rounded px-3 py-2 text-white text-sm focus:border-[#22c55e] outline-none font-mono"
            />
          </div>
          <div className="col-span-2">
            <label className="text-[#8b949e] text-xs block mb-1.5">Description</label>
            <textarea
              data-testid="review-description-input"
              value={description} onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-[#161b22] border border-[#2d333b] rounded px-3 py-2 text-white text-sm focus:border-[#22c55e] outline-none resize-none"
            />
          </div>
          <div>
            <label className="text-[#8b949e] text-xs block mb-1.5">Category</label>
            <select
              data-testid="review-category-select"
              value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#161b22] border border-[#2d333b] rounded px-3 py-2 text-white text-sm focus:border-[#22c55e] outline-none"
            >
              {CATEGORIES.map((c: string) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[#8b949e] text-xs block mb-1.5">Language</label>
            <select
              data-testid="review-language-select"
              value={language} onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-[#161b22] border border-[#2d333b] rounded px-3 py-2 text-white text-sm focus:border-[#22c55e] outline-none"
            >
              {LANGUAGES.map((l: { value: string; label: string }) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="text-[#8b949e] text-sm mb-3">
        <span className="text-white font-medium">{sections.length}</span> sections ·
        <span className="text-white font-medium ml-1">{totalLessons}</span> lessons
      </div>

      <div className="space-y-3 mb-6" data-testid="review-outline-sections">
        {sections.map((sec: Record<string, unknown>, sIdx: number) => (
          <div key={sIdx} className="bg-[#0d1117] border border-[#2d333b] rounded-lg">
            <div className="flex items-center gap-2 p-3 border-b border-[#1e2533]">
              <button onClick={() => setOpenSection(openSection === sIdx ? -1 : sIdx)} className="text-[#8b949e]">
                {openSection === sIdx ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              <input
                data-testid={`section-title-${sIdx}`}
                value={sec.title}
                onChange={(e) => updateSection(sIdx, { title: e.target.value })}
                className="flex-1 bg-transparent text-white font-medium text-sm focus:outline-none"
              />
              <span className="text-[#8b949e] text-xs">{(sec.lessons || []).length} lessons</span>
              <button onClick={() => removeSection(sIdx)} className="text-[#8b949e] hover:text-[#ef4444] p-1" data-testid={`remove-section-${sIdx}`}>
                <Trash2 size={14} />
              </button>
            </div>
            {openSection === sIdx && (
              <div className="p-3 space-y-2">
                {(sec.lessons as unknown[] || []).map((lesson: Record<string, unknown>, lIdx: number) => (
                  <div key={lIdx} className="bg-[#161b22] border border-[#1e2533] rounded p-2">
                    <div className="flex items-center gap-2">
                      <input
                        data-testid={`lesson-title-${sIdx}-${lIdx}`}
                        value={lesson.title}
                        onChange={(e) => updateLesson(sIdx, lIdx, { title: e.target.value })}
                        className="flex-1 bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1.5 text-white text-sm focus:border-[#22c55e] outline-none"
                        placeholder="Lesson title"
                      />
                      <div className="flex items-center gap-1 text-xs text-[#8b949e]">
                        <span>pp</span>
                        <input
                          type="number" min="1"
                          value={lesson.page_start}
                          onChange={(e) => updateLesson(sIdx, lIdx, { page_start: parseInt(e.target.value) || 1 })}
                          className="w-14 bg-[#0d1117] border border-[#2d333b] rounded px-1.5 py-1 text-white text-xs focus:border-[#22c55e] outline-none"
                        />
                        <span>–</span>
                        <input
                          type="number" min="1"
                          value={lesson.page_end}
                          onChange={(e) => updateLesson(sIdx, lIdx, { page_end: parseInt(e.target.value) || 1 })}
                          className="w-14 bg-[#0d1117] border border-[#2d333b] rounded px-1.5 py-1 text-white text-xs focus:border-[#22c55e] outline-none"
                        />
                      </div>
                      <button onClick={() => removeLesson(sIdx, lIdx)} className="text-[#8b949e] hover:text-[#ef4444] p-1" data-testid={`remove-lesson-${sIdx}-${lIdx}`}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                    {lesson.summary && (
                      <input
                        value={lesson.summary}
                        onChange={(e) => updateLesson(sIdx, lIdx, { summary: e.target.value })}
                        className="mt-1.5 w-full bg-transparent text-[#8b949e] text-xs focus:outline-none"
                      />
                    )}
                  </div>
                ))}
                <button onClick={() => addLesson(sIdx)} className="flex items-center gap-1 text-[#22c55e] text-xs hover:text-[#16a34a]" data-testid={`add-lesson-${sIdx}`}>
                  <Plus size={12} /> Add lesson
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-2 border border-[#2d333b] text-[#8b949e] hover:text-white hover:border-[#484f58] px-4 py-2.5 rounded-md text-sm transition-colors">
          <ArrowLeft size={14} /> Back
        </button>
        <button
          data-testid="pdf-generate-course-btn"
          onClick={handleGenerate}
          disabled={generating || !title.trim() || !slug.trim() || totalLessons === 0}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#22c55e] to-[#06b6d4] text-white font-medium px-4 py-2.5 rounded-md text-sm disabled:opacity-50 transition-opacity hover:opacity-90"
        >
          {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating course…</> : <><Sparkles className="w-4 h-4" /> Generate {totalLessons} Lessons from PDF</>}
        </button>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#f87171] rounded p-3 text-sm" data-testid="review-error">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
        </div>
      )}
    </div>
  );
};

// ───────────────────────────────────────────────────────────────
// Step 3 — Progress
// ───────────────────────────────────────────────────────────────
const StepProgress = ({ courseInfo, onDone }: { courseInfo: Record<string, unknown>; onDone: (info: Record<string, unknown>) => void; }) => {
  const [status, setStatus] = useState({
    total_lessons: courseInfo.total_lessons || 0,
    completed_lessons: 0,
    progress_percent: 0,
    current_lesson: '',
    failed_lessons: [],
    status: 'generating',
  });

  const poll = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await api.get<Record<string, unknown>>(`/admin/pdf-to-course/status/${courseInfo.course_id}`, {
        signal,
      });
      if (signal?.aborted) return null;
      setStatus(res.data);
      return res.data.status;
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return null;
      return 'generating' as const;
    }
  }, [courseInfo.course_id]);

  useEffect(() => {
    const ac = new AbortController();
    const tick = async () => {
      const s = await poll(ac.signal);
      if (ac.signal.aborted) return;
      if (s !== 'complete') setTimeout(tick, 3000);
    };
    tick();
    return () => ac.abort();
  }, [poll]);

  const isDone = status.status === 'complete';

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-white text-xl font-bold mb-1">Generating lesson content</h2>
      <p className="text-[#8b949e] text-sm mb-6">
        The AI is writing each lesson from its assigned PDF pages. This may take a few minutes depending on
        the total lesson count. You can safely leave this page — generation runs in the background.
      </p>

      <div className="bg-[#0d1117] border border-[#2d333b] rounded-lg p-5">
        <div className="flex items-center justify-between mb-2" data-testid="pdf-progress-counts">
          <span className="text-white text-sm">{status.completed_lessons} / {status.total_lessons} lessons</span>
          <span className="text-[#22c55e] text-sm font-medium">{status.progress_percent}%</span>
        </div>
        <div className="h-2 bg-[#1e2533] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#22c55e] to-[#06b6d4] transition-all duration-500"
            style={{ width: `${status.progress_percent}%` }}
          />
        </div>
        {status.current_lesson && !isDone && (
          <div className="mt-4 flex items-center gap-2 text-[#8b949e] text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-[#22c55e]" />
            <span className="truncate">Writing: {status.current_lesson}</span>
          </div>
        )}
        {status.failed_lessons?.length > 0 && (
          <div className="mt-4 text-[#f87171] text-xs">
            {status.failed_lessons.length} lesson(s) failed (you can retry via Admin panel)
          </div>
        )}
      </div>

      {isDone && (
        <button
          data-testid="pdf-done-btn"
          onClick={() => onDone(courseInfo)}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white font-medium px-4 py-2.5 rounded-md text-sm transition-colors"
        >
          <Check className="w-4 h-4" /> Go to Course
        </button>
      )}
    </div>
  );
};

// ───────────────────────────────────────────────────────────────
// Top-level wrapper
// ───────────────────────────────────────────────────────────────
const PDFCourseCreator = () => {
  const navigate = useRouter();
  const [step, setStep] = useState<number>(0);
  const [pdfId, setPdfId] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>('');
  const [outline, setOutline] = useState<Record<string, unknown> | null>(null);
  const [courseInfo, setCourseInfo] = useState<Record<string, unknown> | null>(null);

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="sticky top-0 z-10 bg-[#0d1117]/90 backdrop-blur border-b border-[#1e2533] px-6 py-3 flex items-center gap-3">
        <button onClick={() => navigate.push('/admin')} className="flex items-center gap-1 text-[#8b949e] hover:text-white text-sm" data-testid="pdf-back-admin">
          <ArrowLeft size={14} /> Admin
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-xs">
          {STEP_LABELS.map((label: string, i: number) => (
            <Fragment key={i}>
              <span className={i === step ? 'text-[#22c55e] font-medium' : i < step ? 'text-white' : 'text-[#484f58]'}>
                {i + 1}. {label}
              </span>
              {i < STEP_LABELS.length - 1 && <span className="text-[#484f58]">›</span>}
            </Fragment>
          ))}
        </div>
      </div>
      <div className="px-6 py-8">
        {step === 0 && (
          <StepUpload onOutlineReady={(id, o, fn) => { setPdfId(id); setOutline(o); setFilename(fn); setStep(1); }} />
        )}
        {step === 1 && outline && (
          <StepReview
            pdfId={pdfId} filename={filename} outline={outline}
            onGenerated={(info) => { setCourseInfo(info); setStep(2); }}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && courseInfo && (
          <StepProgress
            courseInfo={courseInfo}
            onDone={(info) => navigate.push(`/admin/course/${info.slug}`)}
          />
        )}
      </div>
    </div>
  );
};

export default PDFCourseCreator;
