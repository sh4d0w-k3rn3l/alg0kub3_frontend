'use client';
import { useEffect, useState, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  ArrowLeft, Sparkles, Loader2, Check, Layers,
  BookOpen, FileText, AlertCircle, ChevronRight,
} from 'lucide-react';

const EXAMPLE_OUTLINE = `Fundamentals & Architecture
  What are Large Language Models
  Transformer Architecture Deep Dive
  Self-Attention Mechanism
  Positional Encoding

Training & Fine-Tuning
  Pre-training vs Fine-tuning
  RLHF and Alignment
  LoRA and Parameter-Efficient Methods
  Dataset Preparation

Deployment & Optimization
  Model Quantization
  Inference Optimization
  Serving at Scale
  Cost Management`;

const CourseOutlineImport = () => {
  const navigate = useRouter();
  const [step, setStep] = useState(1); // 1: outline, 2: preview, 3: creating
  const [categories, setCategories] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    language: 'python',
    category: 'Programming Languages',
    icon: 'code',
  });
  const [outline, setOutline] = useState<string>('');
  const [parsed, setParsed] = useState<{ title: string; lessons: string[] }[]>([]);
  const [creating, setCreating] = useState<boolean>(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const ac = new AbortController();
    api.get<string[]>('/categories', { signal: ac.signal }).then(res => {
      if (!ac.signal.aborted && Array.isArray(res.data) && res.data.length > 0) setCategories(res.data.sort());
    }).catch(() => {});
    return () => ac.abort();
  }, []);

  const LANG_OPTIONS = [
    { value: 'python', label: 'Python' }, { value: 'java', label: 'Java' },
    { value: 'javascript', label: 'JavaScript' }, { value: 'typescript', label: 'TypeScript' },
    { value: 'go', label: 'Go' }, { value: 'sql', label: 'SQL' },
    { value: 'rust', label: 'Rust' }, { value: 'cpp', label: 'C++' },
  ];

  const parseOutline = (text: string): { title: string; lessons: string[] }[] => {
    const sections: { title: string; lessons: string[] }[] = [];
    let current: { title: string; lessons: string[] } | null = null;
    for (const line of text.split('\n')) {
      const stripped = line.trimEnd();
      if (!stripped.trim()) continue;
      const indent = stripped.length - stripped.trimStart().length;
      const clean = stripped.trim().replace(/^[-*•]\s*/, '').replace(/^Section:\s*/i, '').trim();
      if (!clean) continue;
      if (indent < 2 && !stripped.startsWith(' ') && !stripped.startsWith('\t')) {
        current = { title: clean, lessons: [] };
        sections.push(current);
      } else {
        if (!current) { current = { title: 'General', lessons: [] }; sections.push(current); }
        current.lessons.push(clean);
      }
    }
    return sections;
  };

  const handlePreview = () => {
    if (!form.title || !outline.trim()) return;
    const p = parseOutline(outline);
    if (p.length === 0) { setError('No sections detected. Non-indented lines = sections, indented lines = lessons.'); return; }
    setParsed(p);
    setError('');
    setStep(2);
  };

  const handleCreate = async () => {
    setCreating(true);
    setError('');
    try {
      const res = await api.post('/courses/create-from-outline', {
        title: form.title,
        slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: form.description,
        language: form.language,
        category: form.category,
        icon: form.icon,
        raw_outline: outline,
      });
      setResult(res.data as Record<string, unknown>);
      setStep(3);
    } catch (err: unknown) {
      setError((err as { detail?: string }).detail || 'Failed to create course');
    } finally {
      setCreating(false);
    }
  };

  const totalLessons = parsed.reduce((sum, s) => sum + s.lessons.length, 0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button data-testid="outline-back-btn" onClick={() => navigate.push('/admin')} className="text-[#8b949e] hover:text-white transition-colors"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-white text-2xl font-bold">Quick Course Builder</h1>
            <p className="text-[#8b949e] text-sm mt-0.5">Paste an outline, preview it, create everything in one click</p>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-3 mb-8">
          {[
            { n: 1, label: 'Define & Outline' },
            { n: 2, label: 'Preview' },
            { n: 3, label: 'Done' },
          ].map((s, i) => (
            <Fragment key={s.n}>
              {i > 0 && <ChevronRight size={16} className="text-[#484f58]" />}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${step >= s.n ? 'bg-[#22c55e]/15 text-[#22c55e]' : 'bg-[#161b22] text-[#484f58]'}`}>
                {step > s.n ? <Check size={12} /> : <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px]" style={{ borderColor: step >= s.n ? '#22c55e' : '#484f58' }}>{s.n}</span>}
                {s.label}
              </div>
            </Fragment>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3 mb-6">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Step 1: Define + Outline */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-6">
            <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
              <h2 className="text-white font-bold mb-4">Course Details</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-[#8b949e] text-xs block mb-1">Title *</label>
                  <input data-testid="outline-title-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })} placeholder="e.g. LLM Interview Guide" className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]" />
                </div>
                <div>
                  <label className="text-[#8b949e] text-xs block mb-1">Slug</label>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]" />
                </div>
                <div>
                  <label className="text-[#8b949e] text-xs block mb-1">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief course description" rows={2} className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e] resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#8b949e] text-xs block mb-1">Language</label>
                    <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]">
                      {LANG_OPTIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[#8b949e] text-xs block mb-1">Category</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]">
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white font-bold">Course Outline</h2>
                <button onClick={() => setOutline(EXAMPLE_OUTLINE)} className="text-[#484f58] hover:text-[#22c55e] text-xs transition-colors">Load example</button>
              </div>
              <p className="text-[#484f58] text-xs mb-3">Non-indented lines = <span className="text-[#3b82f6]">sections</span>. Indented (2+ spaces) = <span className="text-[#22c55e]">lessons</span>.</p>
              <textarea
                data-testid="outline-textarea"
                value={outline}
                onChange={(e) => setOutline(e.target.value)}
                rows={16}
                placeholder={`Fundamentals\n  What are LLMs\n  Transformer Architecture\n\nTraining\n  Fine-tuning Methods\n  RLHF`}
                className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-[#c9d1d9] text-sm font-mono outline-none focus:border-[#22c55e] resize-none"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-[#484f58] text-xs">
                  {parseOutline(outline).length} sections, {parseOutline(outline).reduce((s, sec) => s + sec.lessons.length, 0)} lessons
                </span>
                <button data-testid="outline-preview-btn" onClick={handlePreview} disabled={!form.title || !outline.trim()} className="flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-white font-medium px-4 py-2 rounded-md text-sm transition-colors">
                  Preview <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 2 && (
          <div>
            <div className="border border-[#2d333b] rounded-xl p-5 mb-6" style={{ backgroundColor: '#161b22' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-white font-bold text-lg">{form.title}</h2>
                  <span className="text-[#484f58] text-xs">{form.language} &middot; {form.category}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-[#3b82f6] flex items-center gap-1"><Layers size={14} /> {parsed.length} sections</span>
                  <span className="text-[#22c55e] flex items-center gap-1"><BookOpen size={14} /> {totalLessons} lessons</span>
                </div>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {parsed.map((sec, si) => (
                  <div key={si} className="border border-[#2d333b] rounded-lg overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-[#2d333b] bg-[#0d1117]">
                      <span className="text-[#c9d1d9] font-medium text-sm">{sec.title}</span>
                      <span className="text-[#484f58] text-xs ml-2">{sec.lessons.length} lessons</span>
                    </div>
                    <div className="divide-y divide-[#1e2533]">
                      {sec.lessons.map((les: string, li: number) => (
                        <div key={li} className="px-4 py-2 flex items-center gap-2">
                          <FileText size={12} className="text-[#484f58]" />
                          <span className="text-[#8b949e] text-sm">{les}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <button onClick={() => setStep(1)} className="text-[#8b949e] hover:text-white text-sm transition-colors">Back to edit</button>
              <button data-testid="outline-create-btn" onClick={handleCreate} disabled={creating} className="flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors shadow-lg shadow-[#22c55e]/20">
                {creating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Create {parsed.length} Sections & {totalLessons} Lessons
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 3 && result && (
          <div className="border border-[#22c55e]/30 rounded-xl p-8 text-center" style={{ backgroundColor: '#22c55e08' }}>
            <div className="w-16 h-16 rounded-full bg-[#22c55e]/20 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-[#22c55e]" />
            </div>
            <h2 className="text-white text-xl font-bold mb-2">Course Created!</h2>
            <p className="text-[#8b949e] mb-6">
              Created <span className="text-[#3b82f6] font-medium">{(result?.sections_created as number) ?? 0} sections</span> and <span className="text-[#22c55e] font-medium">{(result?.lessons_created as number) ?? 0} lessons</span> for &ldquo;{((result?.course as Record<string, unknown>)?.title as string)}&rdquo;
            </p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => navigate.push(`/admin/courses/${((result?.course as Record<string, unknown>)?.id as string)}`)} className="flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors">
                Open Course <ChevronRight size={14} />
              </button>
              <button onClick={() => navigate.push('/admin')} className="text-[#8b949e] hover:text-white px-4 py-2.5 text-sm transition-colors">
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseOutlineImport;
