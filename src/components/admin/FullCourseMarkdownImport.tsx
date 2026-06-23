'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { ApiError } from '@/lib/api';
import {
  ArrowLeft, Upload, Loader2, Check, AlertCircle,
  ChevronRight, Layers, BookOpen, FileText,
} from 'lucide-react';

const EXAMPLE_MD = `## Getting Started

### What is Python
Python is a high-level, interpreted programming language known for its simplicity.

It was created by Guido van Rossum and first released in 1991.

\`\`\`python
print("Hello, World!")
\`\`\`

### Setting Up Your Environment
Before writing Python code, you need to set up your development environment.

- Install Python from python.org
- Choose an IDE (VS Code, PyCharm)
- Set up a virtual environment

## Data Structures

### Lists and Tuples
Lists are mutable sequences in Python.

\`\`\`python
fruits = ["apple", "banana", "cherry"]
fruits.append("date")
\`\`\`

### Dictionaries
Dictionaries store key-value pairs.

\`\`\`python
person = {"name": "Alice", "age": 30}
print(person["name"])
\`\`\``;

const FullCourseMarkdownImport = () => {
  const navigate = useRouter();
  const [categories, setCategories] = useState<string[]>([]);
  const [form, setForm] = useState<{ title: string; slug: string; description: string; language: string; category: string }>({
    title: '',
    slug: '',
    description: '',
    language: 'python',
    category: 'Programming Languages',
  });
  const [markdown, setMarkdown] = useState<string>('');
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
  ];

  const parsePreview = (md: string): { title: string; lessons: string[] }[] => {
    const sections: { title: string; lessons: string[] }[] = [];
    let current: { title: string; lessons: string[] } | null = null;
    for (const line of md.split('\n')) {
      const stripped = line.trim();
      if (stripped.startsWith('## ') && !stripped.startsWith('### ')) {
        const title = stripped.slice(3).trim();
        if (title) { current = { title, lessons: [] }; sections.push(current); }
      } else if (stripped.startsWith('### ')) {
        const title = stripped.slice(4).trim();
        if (title) {
          if (!current) { current = { title: 'General', lessons: [] }; sections.push(current); }
          current.lessons.push(title);
        }
      }
    }
    return sections;
  };

  const preview = parsePreview(markdown);
  const totalLessons = preview.reduce((s: number, sec) => s + sec.lessons.length, 0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev: ProgressEvent<FileReader>) => {
      setMarkdown((ev.target?.result as string) || '');
      if (!form.title && file.name) {
        const name = file.name.replace(/\.md$/i, '').replace(/[-_]/g, ' ');
        setForm((prev) => ({
          ...prev,
          title: name.charAt(0).toUpperCase() + name.slice(1),
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        }));
      }
    };
    reader.readAsText(file);
  };

  const handleCreate = async () => {
    if (!form.title || !markdown.trim()) return;
    setCreating(true);
    setError('');
    try {
      const res = await api.post<Record<string, unknown>>('/courses/import-full-markdown', {
        title: form.title,
        slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: form.description,
        language: form.language,
        category: form.category,
        markdown_content: markdown,
      });
      setResult(res.data);
    } catch (err) {
      setError((err as ApiError).detail || 'Import failed');
    } finally {
      setCreating(false);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="border border-[#22c55e]/30 rounded-xl p-8 text-center" style={{ backgroundColor: '#22c55e08' }}>
            <div className="w-16 h-16 rounded-full bg-[#22c55e]/20 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-[#22c55e]" />
            </div>
            <h2 className="text-white text-xl font-bold mb-2">Course Imported!</h2>
            <p className="text-[#8b949e] mb-6">
              Created <span className="text-[#3b82f6] font-medium">{(result.sections_created as number)} sections</span> and <span className="text-[#22c55e] font-medium">{(result.lessons_created as number)} lessons</span> with content
            </p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => navigate.push(`/admin/courses/${((result.course as Record<string, unknown>)?.id as string)}`)} className="flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white font-medium px-5 py-2.5 rounded-lg text-sm">
                Open Course <ChevronRight size={14} />
              </button>
              <button onClick={() => navigate.push('/admin')} className="text-[#8b949e] hover:text-white px-4 py-2.5 text-sm">Back to Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button data-testid="md-import-back-btn" onClick={() => navigate.push('/admin')} className="text-[#8b949e] hover:text-white transition-colors"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-white text-2xl font-bold">Import Course from Markdown</h1>
            <p className="text-[#8b949e] text-sm mt-0.5">Use <code className="text-[#22c55e]">##</code> for sections, <code className="text-[#22c55e]">###</code> for lessons. Content between headings becomes lesson blocks.</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3 mb-6">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="grid grid-cols-5 gap-6">
          {/* Left: Form + Markdown */}
          <div className="col-span-3 space-y-4">
            <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
              <h2 className="text-white font-bold mb-3">Course Details</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8b949e] text-xs block mb-1">Title *</label>
                  <input data-testid="md-import-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })} placeholder="Course Title" className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]" />
                </div>
                <div>
                  <label className="text-[#8b949e] text-xs block mb-1">Language</label>
                  <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]">
                    {LANG_OPTIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <label className="text-[#8b949e] text-xs block mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white font-bold">Markdown Content</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => setMarkdown(EXAMPLE_MD)} className="text-[#484f58] hover:text-[#22c55e] text-xs transition-colors">Load example</button>
                  <label className="flex items-center gap-1.5 text-[#8b949e] hover:text-[#22c55e] text-xs cursor-pointer transition-colors">
                    <Upload size={12} /> Upload .md
                    <input type="file" accept=".md,.txt,.markdown" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>
              <textarea
                data-testid="md-import-content"
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                rows={22}
                placeholder={`## Section Title\n\n### Lesson Title\nLesson content goes here...\n\n\`\`\`python\ncode_example()\n\`\`\``}
                className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-[#c9d1d9] text-sm font-mono outline-none focus:border-[#22c55e] resize-none"
              />
            </div>
          </div>

          {/* Right: Preview */}
          <div className="col-span-2">
            <div className="border border-[#2d333b] rounded-xl p-5 sticky top-8" style={{ backgroundColor: '#161b22' }}>
              <h2 className="text-white font-bold mb-3">Structure Preview</h2>
              {preview.length > 0 ? (
                <>
                  <div className="flex items-center gap-4 text-xs mb-4">
                    <span className="text-[#3b82f6] flex items-center gap-1"><Layers size={12} /> {preview.length} sections</span>
                    <span className="text-[#22c55e] flex items-center gap-1"><BookOpen size={12} /> {totalLessons} lessons</span>
                  </div>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {preview.map((sec, si) => (
                      <div key={si} className="border border-[#2d333b] rounded-lg overflow-hidden">
                        <div className="px-3 py-2 bg-[#0d1117] border-b border-[#2d333b]">
                          <span className="text-[#c9d1d9] font-medium text-xs">{sec.title}</span>
                        </div>
                        {sec.lessons.map((les: string, li: number) => (
                          <div key={li} className="px-3 py-1.5 flex items-center gap-2 border-b border-[#1e2533] last:border-0">
                            <FileText size={10} className="text-[#484f58]" />
                            <span className="text-[#8b949e] text-xs">{les}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-[#484f58] text-sm">
                  <FileText size={24} className="mx-auto mb-2 opacity-30" />
                  <p>Add markdown with ## and ### headings to see the preview</p>
                </div>
              )}

              <button
                data-testid="md-import-create-btn"
                onClick={handleCreate}
                disabled={creating || !form.title || preview.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg text-sm mt-4 transition-colors shadow-lg shadow-[#22c55e]/20"
              >
                {creating ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                Import Course
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullCourseMarkdownImport;
