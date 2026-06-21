'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { api, type ApiError } from '@/lib/api';
import { showError, showSuccess, handleApiError, showConfirm } from '@/lib/toast';
import { useAuth } from '@/context/AuthContext';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BlockEditor from '../editor/BlockEditor';
import EditorPreview from '../editor/EditorPreview';
import AICourseCreator from './AICourseCreator';
import PDFCourseCreator from './PDFCourseCreator';
import NavigationEditor from './NavigationEditor';
import CourseOutlineImport from './CourseOutlineImport';
import FullCourseMarkdownImport from './FullCourseMarkdownImport';
import QuizManager from './QuizManager';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import RevenueDashboard from './RevenueDashboard';
import QuizAnalytics from './QuizAnalytics';
import CertificateManagement from './CertificateManagement';
import TutorUsage from './TutorUsage';
import SystemHealth from './SystemHealth';
import EmailDigest from './EmailDigest';
import CodeMonitor from './CodeMonitor';
import ActivityFeed from './ActivityFeed';
import AuditLogs from './AuditLogs';
import BulkOperations from './BulkOperations';
import SEOManagement from './SEOManagement';
import ContentHeatmap from './ContentHeatmap';
import Announcements from './Announcements';
import LLMKeysPage from './LLMKeysPage';
import LLMUsageDashboard from './LLMUsageDashboard';
import BackupRestore from './BackupRestore';
import HomepageSettings from './HomepageSettings';
import ApiMonitoring from './ApiMonitoring';
import PolicyEditor from './PolicyEditor';
import DiscussionModeration from './DiscussionModeration';
import PppAnalytics from './PppAnalytics';
import LessonFeedbackAdmin from './LessonFeedbackAdmin';
import CodeExecutionSettings from './CodeExecutionSettings';
import {
  ArrowLeft, Plus, Edit2, Trash2, Save, X, ChevronDown, ChevronUp,
  GripVertical, RefreshCw, BarChart3, BookOpen, Layers, Loader2,
  Download, Upload, Sparkles, Eye, EyeOff, FileText,
  FolderPlus, Copy, Check, AlertCircle, Code, Lock, LogIn, Unlock,
  Route as RouteIcon, Clock, Brain, Server, Database, Zap, Activity, LogOut, Home,
} from 'lucide-react';

const STATUS_COLORS = {
  draft: { bg: '#f59e0b20', text: '#f59e0b', label: 'Draft' },
  review: { bg: '#3b82f620', text: '#3b82f6', label: 'Review' },
  published: { bg: '#22c55e20', text: '#22c55e', label: 'Published' },
};

// ============ Course Dashboard ============
interface CourseItem {
  id: string; title: string; slug: string; description?: string; language: string;
  icon: string; category?: string; status?: string; lesson_count: number;
  section_count?: number; updated_at?: string;
}
interface SeedStatus { running: boolean; progress_percent: number; current_lesson?: string; error?: string; }

const CourseDashboard = () => {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreate, setShowCreate] = useState<boolean>(false);
  const [newCourse, setNewCourse] = useState({ title: '', slug: '', description: '', language: 'python', icon: 'code', category: 'Programming Languages' });
  const [creating, setCreating] = useState<boolean>(false);
  const [seedingCourses, setSeedingCourses] = useState<Record<string, boolean>>({});
  const [seedStatuses, setSeedStatuses] = useState<Record<string, SeedStatus>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [creatingNewCat, setCreatingNewCat] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');
  const navigate = useRouter();

  const fetchCourses = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await api.get<{ courses: CourseItem[] } | CourseItem[]>(`/courses?include_drafts=true`, { signal, cache: 'no-store' });
      if (signal?.aborted) return;
      const data = res.data as { courses?: CourseItem[] } | CourseItem[] | undefined;
      setCourses(Array.isArray(data) ? data : (data?.courses ?? []));
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      handleApiError(err);
    }
    finally { if (!signal?.aborted) setLoading(false); }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCourses(ac.signal);
    return () => ac.abort();
  }, [fetchCourses]);

  useEffect(() => {
    const ac = new AbortController();
    api.get(`/categories`, { signal: ac.signal, cache: 'no-store' }).then(res => {
      if (!ac.signal.aborted && Array.isArray(res.data) && res.data.length > 0) setCategories(res.data.sort());
    }).catch(() => {});
    return () => ac.abort();
  }, []);

  // Poll seed statuses
  useEffect(() => {
    const activeSeeds = Object.entries(seedingCourses).filter(([, v]) => v);
    if (activeSeeds.length === 0) return;
    const ac = new AbortController();
    const interval = setInterval(async () => {
      for (const [courseId] of activeSeeds) {
        try {
          const res = await api.get<SeedStatus>(`/courses/${courseId}/seed-status`, { signal: ac.signal });
          if (ac.signal.aborted) return;
          setSeedStatuses(prev => ({ ...prev, [courseId]: res.data }));
          if (!res.data.running && res.data.progress_percent >= 99) {
            setSeedingCourses(prev => ({ ...prev, [courseId]: false }));
            fetchCourses(ac.signal);
          }
        } catch { /* ignore */ }
      }
    }, 3000);
    return () => { clearInterval(interval); ac.abort(); };
  }, [seedingCourses, fetchCourses]);

  const handleSeedCourse = async (courseId: string, title: string) => {
    if (!(await showConfirm(`Generate AI content for all lessons in "${title}"? This may take several minutes.`))) return;
    try {
      setSeedingCourses(prev => ({ ...prev, [courseId]: true }));
      await api.post(`/courses/${courseId}/seed`);
    } catch (err) { showError('Error starting seed: ' + ((err instanceof ApiError ? err.detail : (err as {message?: string}).message) || 'Unknown error')); setSeedingCourses(prev => ({ ...prev, [courseId]: false })); }
  };

  const handleSeedAll = async () => {
    const emptyCourses = courses.filter(c => c.lesson_count === 0 || c.slug !== 'python');
    if (!(await showConfirm(`Generate AI content for ${emptyCourses.length} courses? This will take a while.`))) return;
    for (const course of emptyCourses) {
      if (course.slug === 'python') continue;
      try {
        setSeedingCourses(prev => ({ ...prev, [course.id]: true }));
        await api.post(`/courses/${course.id}/seed`);
        // Stagger starts to avoid overwhelming the LLM
        await new Promise(r => setTimeout(r, 2000));
      } catch (err) { setSeedingCourses(prev => ({ ...prev, [course.id]: false })); handleApiError(err); }
    }
  };

  const handleCreate = async () => {
    if (!newCourse.title || !newCourse.slug) return;
    setCreating(true);
    try {
      await api.post(`/courses`, newCourse);
      setShowCreate(false);
      setNewCourse({ title: '', slug: '', description: '', language: 'python', icon: 'code', category: 'Programming Languages' });
      await fetchCourses();
      navigate.refresh();
    } catch (err) { showError(err instanceof ApiError ? err.detail : 'Error creating course'); }
    finally { setCreating(false); }
  };

  const handleDelete = async (courseId: string, title: string) => {
    if (!(await showConfirm(`Delete "${title}" and ALL its sections/lessons?`))) return;
    try {
      await api.delete(`/courses/${courseId}`);
      await fetchCourses();
      navigate.refresh();
    } catch { showError('Error deleting course'); }
  };

  // ===== Publish / Unpublish =====
  const [statusModal, setStatusModal] = useState<{ course: CourseItem; info: Record<string, unknown>; target: string } | null>(null);
  const [statusBusy, setStatusBusy] = useState<boolean>(false);

  const openStatusModal = async (course: CourseItem, target: string) => {
    try {
      const res = await api.get<{ published_lessons: number; total_lessons: number; enrolled_users: number }>(`/admin/courses/${course.id}/status`);
      setStatusModal({ course, info: res.data, target });
    } catch (err) {
      showError('Could not load course status: ' + (err instanceof ApiError ? err.detail : (err as {message?: string}).message || 'Unknown'));
    }
  };

  const confirmStatusChange = async () => {
    if (!statusModal) return;
    setStatusBusy(true);
    try {
      const res = await api.put(
        `/admin/courses/${statusModal.course.id}/status`,
        { status: statusModal.target, cascade_lessons: true },
      );
      const verb = statusModal.target === 'draft' ? 'unpublished' : 'republished';
      const affected = (res.data as { affected_lessons?: number }).affected_lessons ?? 0;
      showSuccess(`Course ${verb}. ${affected} lessons affected.`);
      setStatusModal(null);
      await fetchCourses();
      navigate.refresh();
    } catch (err) {
      showError('Status change failed: ' + (err instanceof ApiError ? err.detail : (err as {message?: string}).message || 'Unknown'));
    } finally {
      setStatusBusy(false);
    }
  };

  const LANG_OPTIONS = [
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'go', label: 'Go' },
    { value: 'sql', label: 'SQL' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" data-testid="admin-back-link" className="text-[#8b949e] hover:text-white transition-colors"><ArrowLeft size={20} /></Link>
            <h1 className="text-white text-2xl font-bold">Course Manager</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button data-testid="admin-dashboard-button" onClick={() => navigate.push('/admin/dashboard')} className="flex items-center gap-1.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium px-3 py-1.5 rounded-md text-xs transition-colors">
              <Activity size={14} /> Dashboard
            </button>
            <button data-testid="ai-create-button" onClick={() => navigate.push('/admin/ai-create')} className="flex items-center gap-1.5 bg-gradient-to-r from-[#22c55e] to-[#06b6d4] text-white font-medium px-3 py-1.5 rounded-md text-xs transition-opacity hover:opacity-90">
              <Sparkles size={14} /> AI Create
            </button>
            <button data-testid="pdf-create-button" onClick={() => navigate.push('/admin/pdf-create')} className="flex items-center gap-1.5 bg-gradient-to-r from-[#ef4444] to-[#f59e0b] text-white font-medium px-3 py-1.5 rounded-md text-xs transition-opacity hover:opacity-90">
              <FileText size={14} /> From PDF
            </button>
            <button data-testid="quick-outline-button" onClick={() => navigate.push('/admin/quick-outline')} className="flex items-center gap-1.5 bg-[#f59e0b] hover:bg-[#d97706] text-black font-medium px-3 py-1.5 rounded-md text-xs transition-colors">
              <FolderPlus size={14} /> Quick Outline
            </button>
            <button data-testid="import-md-button" onClick={() => navigate.push('/admin/import-markdown')} className="flex items-center gap-1.5 border border-[#8b5cf6]/30 text-[#8b5cf6] hover:bg-[#8b5cf6]/10 font-medium px-3 py-1.5 rounded-md text-xs transition-colors">
              <Upload size={14} /> Import MD
            </button>
            <button data-testid="manage-paths-button" onClick={() => navigate.push('/admin/learning-paths')} className="flex items-center gap-1.5 border border-[#06b6d4]/30 text-[#06b6d4] hover:bg-[#06b6d4]/10 font-medium px-3 py-1.5 rounded-md text-xs transition-colors">
              <RouteIcon size={14} /> Paths
            </button>
            <button data-testid="manage-pricing-button" onClick={() => navigate.push('/admin/pricing')} className="flex items-center gap-1.5 border border-[#22c55e]/30 text-[#22c55e] hover:bg-[#22c55e]/10 font-medium px-3 py-1.5 rounded-md text-xs transition-colors">
              <BarChart3 size={14} /> Pricing
            </button>
            <button data-testid="manage-cache-button" onClick={() => navigate.push('/admin/cache')} className="flex items-center gap-1.5 border border-[#f97316]/30 text-[#f97316] hover:bg-[#f97316]/10 font-medium px-3 py-1.5 rounded-md text-xs transition-colors">
              <Zap size={14} /> Cache
            </button>
            <button data-testid="manage-quizzes-button" onClick={() => navigate.push('/admin/quizzes')} className="flex items-center gap-1.5 border border-[#8b5cf6]/30 text-[#8b5cf6] hover:bg-[#8b5cf6]/10 font-medium px-3 py-1.5 rounded-md text-xs transition-colors">
              <Brain size={14} /> Quizzes
            </button>
            <button data-testid="seed-all-courses-button" onClick={handleSeedAll} className="flex items-center gap-1.5 border border-[#a855f7]/30 text-[#a855f7] hover:bg-[#a855f7]/10 font-medium px-3 py-1.5 rounded-md text-xs transition-colors">
              <Sparkles size={14} /> Seed All with AI
            </button>
            <button data-testid="create-course-button" onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 bg-[#22c55e] hover:bg-[#16a34a] text-white font-medium px-3 py-1.5 rounded-md text-xs transition-colors">
              <Plus size={14} /> New Course
            </button>
          </div>
        </div>

        {/* Create Course Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-[#161b22] border border-[#2d333b] rounded-xl p-6 w-full max-w-lg mx-4">
              <h2 className="text-white text-lg font-bold mb-4">Create New Course</h2>
              <div className="space-y-3">
                <input data-testid="course-title-input" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })} placeholder="Course Title" className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]" />
                <input data-testid="course-slug-input" value={newCourse.slug} onChange={(e) => setNewCourse({ ...newCourse, slug: e.target.value })} placeholder="Slug (auto-generated)" className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]" />
                <textarea value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} placeholder="Description" rows={2} className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e] resize-none" />
                <select data-testid="course-language-select" value={newCourse.language} onChange={(e) => setNewCourse({ ...newCourse, language: e.target.value })} className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]">
                  {LANG_OPTIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
                {creatingNewCat ? (
                  <div className="flex gap-2">
                    <input data-testid="new-category-input" autoFocus type="text" placeholder="e.g. Cybersecurity" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && newCatName.trim()) { setNewCourse({ ...newCourse, category: newCatName.trim() }); setCreatingNewCat(false); }}} className="flex-1 bg-[#0d1117] border border-[#22c55e] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none" />
                    <button data-testid="confirm-new-category" onClick={() => { if (newCatName.trim()) { setNewCourse({ ...newCourse, category: newCatName.trim() }); setCreatingNewCat(false); }}} disabled={!newCatName.trim()} className="p-2 bg-[#22c55e] rounded-md text-black hover:bg-[#1ea34b] disabled:opacity-40"><Check size={14} /></button>
                    <button data-testid="cancel-new-category" onClick={() => { setCreatingNewCat(false); setNewCatName(''); }} className="p-2 bg-[#21262d] rounded-md text-[#8b949e] hover:bg-[#30363d]"><X size={14} /></button>
                  </div>
                ) : (
                  <select data-testid="course-category-select" value={categories.includes(newCourse.category) ? newCourse.category : '__custom__'} onChange={(e) => { if (e.target.value === '__new__') { setCreatingNewCat(true); setNewCatName(''); } else { setNewCourse({ ...newCourse, category: e.target.value }); }}} className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    {!categories.includes(newCourse.category) && newCourse.category && <option value="__custom__">{newCourse.category}</option>}
                    <option value="__new__">+ Create New Category</option>
                  </select>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-[#8b949e] text-sm hover:text-white">Cancel</button>
                <button data-testid="create-course-submit" onClick={handleCreate} disabled={creating || !newCourse.title} className="flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-white font-medium px-4 py-2 rounded-md text-sm">
                  {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Create
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64"><Loader2 size={32} className="text-[#22c55e] animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => {
              const isSeeding = seedingCourses[course.id as string];
              const seedStatus = seedStatuses[course.id as string];
              return (
              <div key={course.id} data-testid={`course-card-${course.slug}`} className="border border-[#2d333b] rounded-xl p-5 hover:border-[#484f58] transition-colors group" style={{ backgroundColor: '#161b22' }}>
                <div className="flex items-start justify-between mb-3">
                  <div onClick={() => navigate.push(`/admin/courses/${course.id}`)} className="flex-1 cursor-pointer">
                    <h3 className="text-white font-bold text-lg">{course.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded inline-block" style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}>{course.language}</span>
                      {course.status === 'draft' ? (
                        <span data-testid={`course-status-${course.slug}`} className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded inline-flex items-center gap-1" style={{ backgroundColor: '#f59e0b20', color: '#f59e0b' }}>
                          <EyeOff size={10} /> Draft
                        </span>
                      ) : (
                        <span data-testid={`course-status-${course.slug}`} className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded inline-flex items-center gap-1" style={{ backgroundColor: '#3b82f620', color: '#3b82f6' }}>
                          <Eye size={10} /> Published
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {course.status === 'draft' ? (
                      <button
                        data-testid={`republish-course-${course.slug}`}
                        onClick={(e) => { e.stopPropagation(); openStatusModal(course, 'published'); }}
                        title="Republish course"
                        className="text-[#3b82f6] hover:text-[#60a5fa] p-1"
                      >
                        <Eye size={14} />
                      </button>
                    ) : (
                      <button
                        data-testid={`unpublish-course-${course.slug}`}
                        onClick={(e) => { e.stopPropagation(); openStatusModal(course, 'draft'); }}
                        title="Unpublish course"
                        className="text-[#f59e0b] hover:text-[#fbbf24] p-1"
                      >
                        <EyeOff size={14} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(course.id, course.title)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={14} /></button>
                  </div>
                </div>
                <p className="text-[#8b949e] text-sm mb-3 line-clamp-2">{course.description || 'No description'}</p>
                <div className="flex items-center gap-4 text-xs text-[#484f58] mb-3" onClick={() => navigate.push(`/admin/courses/${course.id}`)}>
                  <span className="flex items-center gap-1 cursor-pointer"><Layers size={12} /> {course.section_count} sections</span>
                  <span className="flex items-center gap-1 cursor-pointer"><BookOpen size={12} /> {course.lesson_count} lessons</span>
                </div>

                {/* Seed progress */}
                {isSeeding && seedStatus && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[#a855f7] flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Generating...</span>
                      <span className="text-[#484f58]">{seedStatus.progress_percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#2d333b] rounded-full overflow-hidden">
                      <div className="h-full bg-[#a855f7] rounded-full transition-all duration-500" style={{ width: `${seedStatus.progress_percent}%` }} />
                    </div>
                    {seedStatus.current_lesson && <p className="text-[#484f58] text-[10px] mt-1 truncate">{seedStatus.current_lesson}</p>}
                  </div>
                )}

                {/* Seed button for empty or incomplete courses */}
                {course.slug !== 'python' && !isSeeding && (
                  <button data-testid={`seed-course-${course.slug}`} onClick={() => handleSeedCourse(course.id, course.title)} className="w-full flex items-center justify-center gap-1.5 border border-[#a855f7]/30 text-[#a855f7] hover:bg-[#a855f7]/10 px-3 py-1.5 rounded-md text-xs transition-colors mt-1">
                    <Sparkles size={12} /> {course.lesson_count > 0 ? 'Continue Seeding' : 'Seed with AI'}
                  </button>
                )}
              </div>
            );
            })}
          </div>
        )}

        {/* Publish/Unpublish Confirmation Modal */}
        {statusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }} onClick={() => !statusBusy && setStatusModal(null)}>
            <div data-testid="course-status-modal" className="w-full max-w-md rounded-xl border border-[#2d333b] p-6" style={{ backgroundColor: '#161b22' }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: statusModal.target === 'draft' ? '#f59e0b20' : '#3b82f620' }}>
                  {statusModal.target === 'draft' ? <EyeOff size={20} className="text-[#f59e0b]" /> : <Eye size={20} className="text-[#3b82f6]" />}
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">
                    {statusModal.target === 'draft' ? 'Unpublish' : 'Republish'} course?
                  </h2>
                  <p className="text-[#8b949e] text-sm">{statusModal.course.title}</p>
                </div>
              </div>

              {statusModal.target === 'draft' ? (
                <div className="text-sm text-[#c9d1d9] space-y-3 mb-5">
                  <p>This will hide the course from the public catalog. All published lessons will be cascaded to draft.</p>
                  <div className="border border-[#2d333b] rounded-lg p-3 space-y-1.5 text-xs" style={{ backgroundColor: '#0d1117' }}>
                    <div className="flex justify-between"><span className="text-[#8b949e]">Lessons that will be hidden</span><span className="text-[#f59e0b] font-mono font-semibold">{statusModal.info.published_lessons}</span></div>
                    <div className="flex justify-between"><span className="text-[#8b949e]">Total lessons in course</span><span className="text-[#c9d1d9] font-mono">{statusModal.info.total_lessons}</span></div>
                    <div className="flex justify-between"><span className="text-[#8b949e]">Currently enrolled users</span><span className="text-[#c9d1d9] font-mono">{statusModal.info.enrolled_users}</span></div>
                  </div>
                  <p className="text-[#8b949e] text-xs">Reversible — you can republish anytime and the same lessons will be restored.</p>
                </div>
              ) : (
                <div className="text-sm text-[#c9d1d9] space-y-3 mb-5">
                  <p>This will make the course visible in the public catalog. All lessons that were unpublished as part of the cascade will be restored. Lessons that were manually drafted will stay drafted.</p>
                  <div className="border border-[#2d333b] rounded-lg p-3 space-y-1.5 text-xs" style={{ backgroundColor: '#0d1117' }}>
                    <div className="flex justify-between"><span className="text-[#8b949e]">Total lessons in course</span><span className="text-[#c9d1d9] font-mono">{statusModal.info.total_lessons}</span></div>
                    <div className="flex justify-between"><span className="text-[#8b949e]">Currently published</span><span className="text-[#c9d1d9] font-mono">{statusModal.info.published_lessons}</span></div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  data-testid="course-status-cancel"
                  onClick={() => setStatusModal(null)}
                  disabled={statusBusy}
                  className="px-4 py-2 text-[#8b949e] text-sm hover:text-white disabled:opacity-50"
                >Cancel</button>
                <button
                  data-testid="course-status-confirm"
                  onClick={confirmStatusChange}
                  disabled={statusBusy}
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50"
                  style={{ backgroundColor: statusModal.target === 'draft' ? '#f59e0b' : '#3b82f6' }}
                >
                  {statusBusy ? <Loader2 size={14} className="animate-spin" /> : (statusModal.target === 'draft' ? <EyeOff size={14} /> : <Eye size={14} />)}
                  {statusBusy ? 'Working...' : (statusModal.target === 'draft' ? 'Unpublish' : 'Republish')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============ Course Detail ============
interface LessonItem { id: string; title: string; slug?: string; status?: string; access_type?: string; order?: number; }
interface SectionItem { id: string; title: string; slug?: string; order?: number; total?: number; lessons?: LessonItem[]; }
interface CourseDetailType { id: string; title: string; slug?: string; language: string; description?: string; icon?: string; category?: string; status?: string; lesson_count?: number; section_count?: number; }

const CourseDetail = ({ courseId }: { courseId: string }) => {
  const navigate = useRouter();
  const [course, setCourse] = useState<CourseDetailType | null>(null);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddSection, setShowAddSection] = useState<boolean>(false);
  const [showBulkSections, setShowBulkSections] = useState<boolean>(false);
  const [bulkSectionText, setBulkSectionText] = useState<string>('');
  const [bulkCreating, setBulkCreating] = useState<boolean>(false);
  const [newSection, setNewSection] = useState({ title: '', icon: 'code' });
  const [exporting, setExporting] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState('json');

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    try {
      const [coursesRes, sectionsRes] = await Promise.all([
        api.get<{ courses: CourseDetailType[] } | CourseDetailType[]>(`/courses?include_drafts=true`, { signal, cache: 'no-store' }),
        api.get<SectionItem[]>(`/courses/${courseId}/sections`, { signal, cache: 'no-store' }),
      ]);
      if (signal?.aborted) return;
      const coursesData = coursesRes.data as { courses?: CourseDetailType[] } | CourseDetailType[] | undefined;
      const coursesArr = Array.isArray(coursesData) ? coursesData : (coursesData?.courses ?? []);
      setCourse(coursesArr.find((c: CourseDetailType) => c.id === courseId) ?? null);
      setSections(sectionsRes.data);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      handleApiError(err);
    }
    finally { if (!signal?.aborted) setLoading(false); }
  }, [courseId]);

  useEffect(() => {
    const ac = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(ac.signal);
    return () => ac.abort();
  }, [fetchData]);

  const handleAddSection = async () => {
    if (!newSection.title) return;
    try {
      const slug = newSection.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await api.post(`/sections`, {
        title: newSection.title,
        slug,
        icon: newSection.icon,
        order: sections.length,
        course_id: courseId,
      });
      setShowAddSection(false);
      setNewSection({ title: '', icon: 'code' });
      await fetchData();
      navigate.refresh();
    } catch { showError('Error creating section'); }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api.get<Record<string, unknown>>(`/courses/${courseId}/export?format=${exportFormat}`);
      const blob = new Blob(
        [exportFormat === 'json' ? JSON.stringify(res.data, null, 2) : res.data.content as string],
        { type: exportFormat === 'json' ? 'application/json' : 'text/markdown' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${course?.slug || 'course'}.${exportFormat === 'json' ? 'json' : 'md'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { showError('Export failed'); }
    finally { setExporting(false); }
  };

  const handleDeleteSection = async (sectionId: string, title: string) => {
    if (!(await showConfirm(`Delete section "${title}" and all its lessons?`))) return;
    try {
      await api.delete(`/sections/${sectionId}`);
      await fetchData();
      navigate.refresh();
    } catch { showError('Error deleting section'); }
  };

  const handleBulkCreateSections = async () => {
    const titles = bulkSectionText.split('\n').map(l => l.trim()).filter(Boolean);
    if (titles.length === 0) return;
    setBulkCreating(true);
    try {
      await api.post(`/sections/bulk`, {
        course_id: courseId,
        sections: titles.map(t => ({ title: t })),
      });
      setShowBulkSections(false);
      setBulkSectionText('');
      await fetchData();
      navigate.refresh();
    } catch (err) { showError(err instanceof ApiError ? err.detail : 'Error creating sections'); }
    finally { setBulkCreating(false); }
  };

  const handleCloneSection = async (sectionId: string, title: string) => {
    if (!(await showConfirm(`Clone section "${title}" with all its lessons?`))) return;
    try {
      await api.post(`/sections/${sectionId}/clone`);
      await fetchData();
      navigate.refresh();
    } catch { showError('Error cloning section'); }
  };

  const handleCloneLesson = async (e: React.MouseEvent, lessonId: string, _title: string) => {
    e.stopPropagation();
    try {
      await api.post(`/lessons/${lessonId}/clone`);
      await fetchData();
      navigate.refresh();
    } catch { showError('Error cloning lesson'); }
  };

  const handleMoveSection = async (sectionId: string, direction: string) => {
    const idx = sections.findIndex(s => s.id === sectionId);
    if (direction === 'up' && idx <= 0) return;
    if (direction === 'down' && idx >= sections.length - 1) return;
    const newSections = [...sections];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newSections[idx], newSections[swapIdx]] = [newSections[swapIdx], newSections[idx]];
    setSections(newSections);
    try {
      await api.put(`/sections/reorder`, { order: newSections.map(s => s.id) });
    } catch { await fetchData(); }
  };

  const handleToggleAccess = async (e: React.MouseEvent, lessonId: string, currentAccess: string) => {
    e.stopPropagation();
    const newAccess = currentAccess === 'free' ? 'premium' : 'free';
    // optimistic update
    setSections(prev => prev.map(s => ({
      ...s,
      lessons: (s.lessons || []).map((l: LessonItem) => l.id === lessonId ? { ...l, access_type: newAccess } : l)
    })));
    try {
      await api.put(`/admin/lessons/${lessonId}/access-type`, { access_type: newAccess });
      await fetchData();
    } catch (err) {
      // roll back optimistic update on failure
      setSections(prev => prev.map(s => ({
        ...s,
        lessons: (s.lessons || []).map((l: LessonItem) => l.id === lessonId ? { ...l, access_type: currentAccess } : l)
      })));
      showError('Error updating access type');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d1117' }}><Loader2 size={32} className="text-[#22c55e] animate-spin" /></div>;
  if (!course) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d1117' }}><p className="text-[#8b949e]">Course not found</p></div>;

  const totalLessons = sections.reduce((sum, s) => sum + (s.total || 0), 0);
  const draftCount = sections.reduce((sum, s) => sum + (s.lessons || []).filter((l: LessonItem) => l.status === 'draft').length, 0);
  const publishedCount = sections.reduce((sum, s) => sum + (s.lessons || []).filter((l: LessonItem) => l.status === 'published').length, 0);
  const freeCount = sections.reduce((sum, s) => sum + (s.lessons || []).filter((l: LessonItem) => l.access_type === 'free').length, 0);
  const premiumCount = totalLessons - freeCount;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate.push('/admin')} className="text-[#8b949e] hover:text-white transition-colors"><ArrowLeft size={20} /></button>
            <div>
              <h1 className="text-white text-2xl font-bold">{course.title}</h1>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}>{course.language}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border border-[#2d333b] rounded-md overflow-hidden">
              <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} className="bg-[#0d1117] text-[#8b949e] text-xs px-2 py-1.5 outline-none border-none">
                <option value="json">JSON</option>
                <option value="markdown">Markdown</option>
              </select>
              <button data-testid="export-course-button" onClick={handleExport} disabled={exporting} className="flex items-center gap-1.5 bg-[#161b22] text-[#8b949e] hover:text-white px-3 py-1.5 text-xs transition-colors border-l border-[#2d333b]">
                {exporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />} Export
              </button>
            </div>
            <button onClick={() => navigate.push(`/admin/courses/${courseId}/bulk-create`)} className="flex items-center gap-1.5 border border-[#2d333b] text-[#8b949e] hover:text-white px-3 py-1.5 rounded-md text-xs transition-colors">
              <FolderPlus size={12} /> Bulk Lessons
            </button>
            <button data-testid="bulk-sections-btn" onClick={() => setShowBulkSections(true)} className="flex items-center gap-1.5 border border-[#3b82f6]/30 text-[#3b82f6] hover:bg-[#3b82f6]/10 px-3 py-1.5 rounded-md text-xs transition-colors">
              <Layers size={12} /> Bulk Sections
            </button>
            <button onClick={() => setShowAddSection(true)} className="flex items-center gap-1.5 bg-[#22c55e] hover:bg-[#16a34a] text-white font-medium px-3 py-1.5 rounded-md text-xs transition-colors">
              <Plus size={12} /> Add Section
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Sections', value: sections.length, color: '#3b82f6' },
            { label: 'Total Lessons', value: totalLessons, color: '#22c55e' },
            { label: 'Published', value: publishedCount, color: '#a855f7' },
            { label: 'Drafts', value: draftCount, color: '#f59e0b' },
            { label: 'Free', value: freeCount, color: '#10b981' },
            { label: 'Premium', value: premiumCount, color: '#ef4444' },
          ].map((s, i) => (
            <div key={i} className="border border-[#2d333b] rounded-lg p-3" style={{ backgroundColor: '#161b22' }}>
              <span className="text-[#484f58] text-xs">{s.label}</span>
              <div className="text-white text-xl font-bold mt-1" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Add Section Modal */}
        {showAddSection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-[#161b22] border border-[#2d333b] rounded-xl p-6 w-full max-w-md mx-4">
              <h2 className="text-white text-lg font-bold mb-4">Add Section</h2>
              <input data-testid="section-title-input" value={newSection.title} onChange={(e) => setNewSection({ ...newSection, title: e.target.value })} placeholder="Section Title" className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e] mb-3" />
              <input value={newSection.icon} onChange={(e) => setNewSection({ ...newSection, icon: e.target.value })} placeholder="Icon (e.g., code, file-text)" className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]" />
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowAddSection(false)} className="px-4 py-2 text-[#8b949e] text-sm">Cancel</button>
                <button onClick={handleAddSection} disabled={!newSection.title} className="bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-white font-medium px-4 py-2 rounded-md text-sm"><Plus size={14} className="inline mr-1" />Add</button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Sections Modal */}
        {showBulkSections && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-[#161b22] border border-[#2d333b] rounded-xl p-6 w-full max-w-lg mx-4">
              <h2 className="text-white text-lg font-bold mb-2">Bulk Add Sections</h2>
              <p className="text-[#8b949e] text-xs mb-4">One section title per line</p>
              <textarea
                data-testid="bulk-sections-textarea"
                value={bulkSectionText}
                onChange={(e) => setBulkSectionText(e.target.value)}
                rows={8}
                placeholder={"Fundamentals\nData Structures\nAlgorithms\nAdvanced Topics"}
                className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-[#c9d1d9] text-sm font-mono outline-none focus:border-[#3b82f6] resize-none"
              />
              <div className="flex items-center justify-between mt-4">
                <span className="text-[#484f58] text-xs">{bulkSectionText.split('\n').filter(l => l.trim()).length} sections</span>
                <div className="flex gap-2">
                  <button onClick={() => { setShowBulkSections(false); setBulkSectionText(''); }} className="px-4 py-2 text-[#8b949e] text-sm">Cancel</button>
                  <button data-testid="bulk-sections-create-btn" onClick={handleBulkCreateSections} disabled={bulkCreating || !bulkSectionText.trim()} className="flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-white font-medium px-4 py-2 rounded-md text-sm">
                    {bulkCreating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Create All
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sections List */}
        <div className="space-y-4">
          {sections.map((section, secIdx) => (
            <div key={section.id} className="border border-[#2d333b] rounded-lg overflow-hidden" style={{ backgroundColor: '#161b22' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d333b]">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => handleMoveSection(section.id, 'up')} disabled={secIdx === 0} className="text-[#484f58] hover:text-white disabled:opacity-20 p-0.5 transition-colors"><ChevronUp size={12} /></button>
                    <button onClick={() => handleMoveSection(section.id, 'down')} disabled={secIdx === sections.length - 1} className="text-[#484f58] hover:text-white disabled:opacity-20 p-0.5 transition-colors"><ChevronDown size={12} /></button>
                  </div>
                  <span className="text-[#c9d1d9] font-medium">{section.title}</span>
                  <span className="text-[#484f58] text-xs">{section.total} lessons</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button data-testid={`clone-section-${section.id}`} onClick={() => handleCloneSection(section.id, section.title)} className="text-[#8b949e] hover:text-[#3b82f6] p-1 transition-colors" title="Clone section"><Copy size={13} /></button>
                  <button onClick={() => navigate.push(`/admin/sections/${section.id}`)} className="text-[#8b949e] hover:text-white p-1"><Edit2 size={14} /></button>
                  <button onClick={() => handleDeleteSection(section.id, section.title)} className="text-red-400/60 hover:text-red-400 p-1"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="divide-y divide-[#1e2533]">
                {(section.lessons || []).map((lesson: LessonItem) => {
                  const st = STATUS_COLORS[lesson.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.draft;
                  const isFree = lesson.access_type === 'free';
                  return (
                    <div key={lesson.id} className="flex items-center justify-between px-4 py-2 hover:bg-[#1c2333] transition-colors cursor-pointer" onClick={() => navigate.push(`/admin/lessons/${lesson.id}`)}>
                      <div className="flex items-center gap-3">
                        <GripVertical size={14} className="text-[#484f58]" />
                        <span className="text-[#c9d1d9] text-sm">{lesson.title}</span>
                        <span className="text-[9px] font-medium uppercase px-1.5 py-0.5 rounded" style={{ backgroundColor: st.bg, color: st.text }}>{st.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          data-testid={`access-toggle-${lesson.id}`}
                          onClick={(e) => handleToggleAccess(e, lesson.id, lesson.access_type)}
                          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium uppercase tracking-wide transition-colors"
                          style={{
                            backgroundColor: isFree ? '#22c55e15' : '#f59e0b15',
                            color: isFree ? '#22c55e' : '#f59e0b',
                          }}
                          title={isFree ? 'Click to make premium' : 'Click to make free'}
                        >
                          {isFree ? <Unlock size={10} /> : <Lock size={10} />}
                          {isFree ? 'Free' : 'Premium'}
                        </button>
                        <button data-testid={`clone-lesson-${lesson.id}`} onClick={(e) => handleCloneLesson(e, lesson.id, lesson.title)} className="text-[#484f58] hover:text-[#3b82f6] p-1 transition-colors" title="Clone lesson"><Copy size={11} /></button>
                        <Edit2 size={12} className="text-[#484f58]" />
                      </div>
                    </div>
                  );
                })}
                {(!section.lessons || section.lessons.length === 0) && (
                  <div className="px-4 py-3 text-[#484f58] text-sm text-center">No lessons yet</div>
                )}
              </div>
            </div>
          ))}
          {sections.length === 0 && (
            <div className="text-center py-16 text-[#484f58]">
              <Layers size={40} className="mx-auto mb-3 opacity-30" />
              <p>No sections yet. Create one to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============ Bulk Lesson Creator ============
interface SectionSummary { id: string; title: string; slug?: string; }
interface BulkResult { lessons: { title: string; slug: string; content_preview?: string }[]; }

const BulkLessonCreator = ({ courseId }: { courseId: string }) => {
  const navigate = useRouter();
  const [sections, setSections] = useState<SectionSummary[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [lessonTitles, setLessonTitles] = useState<string>('');
  const [creating, setCreating] = useState<boolean>(false);
  const [result, setResult] = useState<BulkResult | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const res = await api.get<SectionSummary[]>(`/courses/${courseId}/sections`, { signal: ac.signal, cache: 'no-store' });
        if (ac.signal.aborted) return;
        setSections(res.data);
        if (res.data.length > 0) setSelectedSection(res.data[0].id);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        handleApiError(err);
      }
    })();
    return () => ac.abort();
  }, [courseId]);

  const handleCreate = async () => {
    const titles = lessonTitles.split('\n').map(t => t.trim()).filter(Boolean);
    if (!titles.length || !selectedSection) return;
    setCreating(true);
    try {
      const res = await api.post(`/lessons/bulk`, {
        section_id: selectedSection,
        lessons: titles.map((title, i) => ({ title, order: i })),
      });
      setResult(res.data);
      setLessonTitles('');
    } catch { showError('Error creating lessons'); }
    finally { setCreating(false); }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate.push(`/admin/courses/${courseId}`)} className="text-[#8b949e] hover:text-white"><ArrowLeft size={20} /></button>
          <h1 className="text-white text-xl font-bold">Bulk Lesson Creator</h1>
        </div>

        <div className="border border-[#2d333b] rounded-xl p-6" style={{ backgroundColor: '#161b22' }}>
          <div className="mb-4">
            <label className="text-[#8b949e] text-sm block mb-1">Section</label>
            <select data-testid="bulk-section-select" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]">
              {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="text-[#8b949e] text-sm block mb-1">Lesson Titles (one per line)</label>
            <textarea data-testid="bulk-lesson-titles" value={lessonTitles} onChange={(e) => setLessonTitles(e.target.value)} placeholder={"Variables and Constants\nData Types\nOperators\nControl Flow"} rows={10} className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm font-mono outline-none focus:border-[#22c55e] resize-y" />
            <span className="text-[#484f58] text-xs mt-1 block">{lessonTitles.split('\n').filter(t => t.trim()).length} lessons</span>
          </div>
          <button data-testid="bulk-create-submit" onClick={handleCreate} disabled={creating || !lessonTitles.trim()} className="flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-md text-sm">
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Create Lessons
          </button>

          {result && (
            <div className="mt-4 p-4 border border-[#2d333b] rounded-lg bg-[#0d1117]">
              <div className="flex items-center gap-2 mb-2">
                <Check size={16} className="text-[#22c55e]" />
                <span className="text-[#22c55e] text-sm font-medium">Created {result.created} lessons</span>
              </div>
              {result.lessons?.map((l, i: number) => (
                <div key={i} className="text-[#8b949e] text-xs py-1">{l.title} <span className="text-[#484f58]">({l.slug})</span></div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============ Enhanced Lesson Editor with Block Editor ============
interface LessonDetail { id: string; title: string; slug: string; content_blocks?: BlockItem[]; content?: string; section_id?: string; }
interface BlockItem { id?: string; type: string; content?: unknown; tabs?: Record<string, unknown>[]; items?: (string | Record<string, unknown>)[]; rows?: string[][]; [key: string]: unknown; }

const LessonEditor = ({ lessonId }: { lessonId: string }) => {
  const navigate = useRouter();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [regenFromPdf, setRegenFromPdf] = useState<boolean>(false);
  const [showPdfPopover, setShowPdfPopover] = useState<boolean>(false);
  const [showImport, setShowImport] = useState<boolean>(false);
  const [showExport, setShowExport] = useState<boolean>(false);
  const [importMd, setImportMd] = useState<string>('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'unsaved' | 'saving' | 'error'
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(true);
  const pdfStartRef = useRef<HTMLInputElement>(null);
  const pdfEndRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const res = await api.get<LessonDetail>(`/lessons/${lessonId}/by-id`, { signal: ac.signal });
        if (ac.signal.aborted) return;
        setLesson(res.data);
        const initialBlocks = res.data.content_blocks || [];
        setBlocks(initialBlocks);
        lastSavedRef.current = JSON.stringify({
          blocks: initialBlocks.map(({ id, ...rest }: { id?: string }) => rest),
          title: res.data.title,
          read_time: res.data.read_time,
        });
        isInitialLoadRef.current = false;
      } catch (err) {
        if ((err as DOMException)?.name === 'AbortError') return;
        handleApiError(err);
      }
      finally { if (!ac.signal.aborted) setLoading(false); }
    })();
    return () => { ac.abort(); if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  }, [lessonId]);

  // Auto-save: debounce 3s after blocks/title change
  useEffect(() => {
    if (isInitialLoadRef.current || !lesson) return;
    const currentSnapshot = JSON.stringify({
      blocks: blocks.map(({ id, ...rest }) => rest),
      title: lesson.title,
      read_time: lesson.read_time,
    });
    if (currentSnapshot === lastSavedRef.current) {
      setSaveStatus('saved');
      return;
    }
    setSaveStatus('unsaved');
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    const ac = new AbortController();
    autoSaveTimerRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const cleanBlocks = blocks.map(({ id, ...rest }) => rest);
        await api.put(`/lessons/${lessonId}`, {
          content_blocks: cleanBlocks,
          title: lesson.title,
          read_time: lesson.read_time,
          status: lesson.status,
        }, { signal: ac.signal });
        if (ac.signal.aborted) return;
        lastSavedRef.current = JSON.stringify({
          blocks: cleanBlocks,
          title: lesson.title,
          read_time: lesson.read_time,
        });
        setSaveStatus('saved');
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setSaveStatus('error');
      }
    }, 3000);
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); ac.abort(); };
  }, [blocks, lesson?.title, lesson?.read_time]);

  // Warn before unload if unsaved
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'unsaved' || saveStatus === 'saving') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [saveStatus]);

  // Convert blocks to Markdown
  const blocksToMarkdown = (blocksArray: BlockItem[], lessonTitle: string) => {
    let md = `# ${lessonTitle}\n\n`;
    
    for (const block of blocksArray) {
      switch (block.type) {
        case 'paragraph':
          md += `${block.text || ''}\n\n`;
          break;
        case 'heading':
        case 'subheading':
          const level = block.level || 2;
          md += `${'#'.repeat(level)} ${block.text || ''}\n\n`;
          break;
        case 'code':
          md += `\`\`\`${block.language || 'python'}\n${block.code || ''}\n\`\`\`\n\n`;
          break;
        case 'codegroup':
          (block.tabs || []).forEach((tab) => {
            md += `**${tab.label}:**\n\`\`\`${tab.language || 'python'}\n${tab.code || ''}\n\`\`\`\n\n`;
          });
          break;
        case 'callout':
          const variant = (block.variant || 'note').charAt(0).toUpperCase() + (block.variant || 'note').slice(1);
          md += `> **${variant}:** ${block.text || ''}\n\n`;
          break;
        case 'list':
          (block.items || []).forEach((item, i: number) => {
            const prefix = block.ordered ? `${i + 1}.` : '-';
            md += `${prefix} ${typeof item === 'string' ? item : item.text || ''}\n`;
          });
          md += '\n';
          break;
        case 'blockquote':
          md += `> ${block.text || ''}\n\n`;
          break;
        case 'divider':
          md += `---\n\n`;
          break;
        case 'table':
          if ((block.headers as string[] | undefined)?.length) {
            const hdrs = block.headers as string[];
            md += `| ${hdrs.join(' | ')} |\n`;
            md += `| ${hdrs.map(() => '---').join(' | ')} |\n`;
            (block.rows || []).forEach((row) => {
              md += `| ${row.join(' | ')} |\n`;
            });
            md += '\n';
          }
          break;
        case 'image':
          md += `![${block.alt || ''}](${block.url || ''})\n`;
          if (block.caption) md += `*${block.caption}*\n`;
          md += '\n';
          break;
        case 'youtube':
          md += `[YouTube Video${block.title ? `: ${block.title}` : ''}](${block.url || ''})\n\n`;
          break;
        case 'vimeo':
          md += `[Vimeo Video${block.title ? `: ${block.title}` : ''}](${block.url || ''})\n\n`;
          break;
        case 'loom':
          md += `[Loom Recording${block.title ? `: ${block.title}` : ''}](${block.url || ''})\n\n`;
          break;
        case 'video':
          md += `[Video${block.title ? `: ${block.title}` : ''}](${block.url || ''})\n\n`;
          break;
        case 'mermaid':
          md += `\`\`\`mermaid\n${block.code || ''}\n\`\`\`\n\n`;
          break;
        case 'accordion':
          (block.items || []).forEach((item) => {
            md += `<details>\n<summary>${item.title || ''}</summary>\n\n${item.text || ''}\n\n</details>\n\n`;
          });
          break;
        case 'tabs':
          (block.tabs || []).forEach((tab) => {
            md += `**${tab.label}:**\n${tab.text || ''}\n\n`;
          });
          break;
        case 'steps':
          (block.items || []).forEach((item, i: number) => {
            md += `${i + 1}. **${item.title || ''}**\n   ${item.text || ''}\n\n`;
          });
          break;
        case 'card':
          md += `### ${block.title || ''}\n${block.text || ''}\n`;
          if (block.href) md += `[Learn more](${block.href})\n`;
          md += '\n';
          break;
        default:
          if (block.text) md += `${block.text}\n\n`;
      }
    }
    return md;
  };

  // Export handlers
  const handleExportJSON = () => {
    const cleanBlocks = blocks.map(({ id, ...rest }) => rest);
    const exportData = {
      title: lesson.title,
      slug: lesson.slug,
      read_time: lesson.read_time,
      status: lesson.status,
      content_blocks: cleanBlocks,
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lesson.slug || 'lesson'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExport(false);
  };

  const handleExportMarkdown = () => {
    const markdown = blocksToMarkdown(blocks, lesson.title);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lesson.slug || 'lesson'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExport(false);
  };

  const handleCopyJSON = () => {
    const cleanBlocks = blocks.map(({ id, ...rest }) => rest);
    const exportData = {
      title: lesson.title,
      content_blocks: cleanBlocks,
    };
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    showSuccess('JSON copied to clipboard!');
  };

  const handleCopyMarkdown = () => {
    const markdown = blocksToMarkdown(blocks, lesson.title);
    navigator.clipboard.writeText(markdown);
    showSuccess('Markdown copied to clipboard!');
  };

  const handleSave = async () => {
    // Cancel any pending auto-save
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    setSaving(true);
    setSaveStatus('saving');
    try {
      const cleanBlocks = blocks.map(({ id, ...rest }) => rest);
      await api.put(`/lessons/${lessonId}`, {
        content_blocks: cleanBlocks,
        title: lesson.title,
        read_time: lesson.read_time,
        status: lesson.status,
      });
      lastSavedRef.current = JSON.stringify({
        blocks: cleanBlocks,
        title: lesson.title,
        read_time: lesson.read_time,
      });
      setSaveStatus('saved');
      navigate.refresh();
    } catch (err) { 
      setSaveStatus('error');
    }
    finally { setSaving(false); }
  };

  const handleGenerate = async () => {
    if (!(await showConfirm('Generate AI content? This will replace existing content.'))) return;
    setGenerating(true);
    try {
      const res = await api.post<{ success: boolean; lesson_title: string }>(`/lessons/${lessonId}/generate-content`, { difficulty, tone: 'educational' });
      setLesson(res.data);
      setBlocks(res.data.content_blocks || []);
    } catch (err) { showError('Generation failed: ' + (err instanceof ApiError ? err.detail : (err as {message?: string}).message || '')); }
    finally { setGenerating(false); }
  };

  const handleRegenFromPdf = async (pstart: number, pend: number) => {
    setRegenFromPdf(true);
    setShowPdfPopover(false);
    try {
      const res = await api.post<{ success: boolean }>(`/lessons/${lessonId}/regen-from-pdf`, { page_start: pstart, page_end: pend });
      setLesson(res.data);
      setBlocks(res.data.content_blocks || []);
      showSuccess('Content regenerated from PDF!');
    } catch (err) {
      showError('Regeneration failed: ' + (err instanceof ApiError ? err.detail : (err as {message?: string}).message || ''));
    } finally {
      setRegenFromPdf(false);
    }
  };

  const handleImportMd = () => {
    if (!importMd.trim()) return;
    const lines = importMd.split('\n');
    const newBlocks = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      // Code blocks
      if (line.trim().startsWith('```')) {
        const langMatch = line.trim().slice(3).trim() || 'python';
        const codeLines = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) { codeLines.push(lines[i]); i++; }
        newBlocks.push({ type: 'code', code: codeLines.join('\n'), language: langMatch.toLowerCase(), runnable: true });
        i++;
        continue;
      }
      // Callouts (> **Note:** or > **Warning:** etc)
      if (line.trim().startsWith('> **Note:**') || line.trim().startsWith('> **Tip:**') || line.trim().startsWith('> **Warning:**') || line.trim().startsWith('> **Error:**')) {
        const variant = line.includes('Warning') ? 'warning' : line.includes('Tip') ? 'tip' : line.includes('Error') ? 'error' : 'note';
        const text = line.replace(/^>\s*\*\*(Note|Tip|Warning|Error):\*\*\s*/, '').trim();
        newBlocks.push({ type: 'callout', variant, title: variant.charAt(0).toUpperCase() + variant.slice(1), text });
        i++;
        continue;
      }
      // Headings
      if (line.trim().startsWith('## ')) {
        newBlocks.push({ type: 'heading', text: line.trim().replace(/^##\s*/, ''), level: 2 });
        i++;
        continue;
      }
      if (line.trim().startsWith('### ')) {
        newBlocks.push({ type: 'heading', text: line.trim().replace(/^###\s*/, ''), level: 3 });
        i++;
        continue;
      }
      if (line.trim().startsWith('#### ')) {
        newBlocks.push({ type: 'heading', text: line.trim().replace(/^####\s*/, ''), level: 4 });
        i++;
        continue;
      }
      // Unordered lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const items = [];
        while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
          items.push(lines[i].trim().slice(2));
          i++;
        }
        newBlocks.push({ type: 'list', items, ordered: false });
        continue;
      }
      // Ordered lists
      if (/^\d+\.\s/.test(line.trim())) {
        const items = [];
        while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
          items.push(lines[i].trim().replace(/^\d+\.\s*/, ''));
          i++;
        }
        newBlocks.push({ type: 'list', items, ordered: true });
        continue;
      }
      // Blockquotes
      if (line.trim().startsWith('> ') && !line.includes('**Note:**') && !line.includes('**Tip:**')) {
        const quoteLines = [];
        while (i < lines.length && lines[i].trim().startsWith('> ')) {
          quoteLines.push(lines[i].trim().slice(2));
          i++;
        }
        newBlocks.push({ type: 'blockquote', text: quoteLines.join('\n') });
        continue;
      }
      // Horizontal rule
      if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
        newBlocks.push({ type: 'divider' });
        i++;
        continue;
      }
      // Paragraphs
      if (line.trim()) {
        const paraLines = [];
        while (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith('#') && !lines[i].trim().startsWith('```') && !lines[i].trim().startsWith('- ') && !lines[i].trim().startsWith('* ') && !/^\d+\.\s/.test(lines[i].trim()) && !lines[i].trim().startsWith('> ')) {
          paraLines.push(lines[i].trim());
          i++;
        }
        newBlocks.push({ type: 'paragraph', text: paraLines.join(' ') });
        continue;
      }
      i++;
    }
    setBlocks([...blocks, ...newBlocks]);
    setShowImport(false);
    setImportMd('');
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await api.put(`/lessons/${lessonId}/status`, { status: newStatus });
      setLesson({ ...lesson, status: newStatus });
    } catch { showError('Error updating status'); }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [blocks, lesson]);

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d1117' }}><Loader2 size={32} className="text-[#22c55e] animate-spin" /></div>;
  if (!lesson) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d1117' }}><p className="text-[#8b949e]">Lesson not found</p></div>;

  const st = STATUS_COLORS[lesson.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.draft;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#2d333b]">
          <div className="flex items-center gap-4">
            <button data-testid="lesson-back-button" onClick={() => navigate.back()} className="text-[#8b949e] hover:text-white p-2 hover:bg-[#2d333b] rounded-lg transition-colors"><ArrowLeft size={20} /></button>
            <div>
              <input data-testid="lesson-title-input" value={lesson.title} onChange={(e) => setLesson({ ...lesson, title: e.target.value })} className="text-white text-2xl font-bold bg-transparent outline-none w-full focus:ring-1 focus:ring-[#22c55e] rounded px-1" placeholder="Lesson title..." />
              <div className="flex items-center gap-3 mt-2">
                <input value={lesson.read_time || ''} onChange={(e) => setLesson({ ...lesson, read_time: e.target.value })} className="text-[#484f58] text-sm bg-transparent outline-none border-b border-transparent hover:border-[#2d333b] focus:border-[#22c55e] transition-colors" placeholder="5 min read" />
                <span className="text-[#2d333b]">•</span>
                <span className="text-[#484f58] text-xs">{blocks.length} blocks</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Auto-save status indicator */}
            <span data-testid="save-status" className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-all ${
              saveStatus === 'saved' ? 'text-[#22c55e] bg-[#22c55e]/10' :
              saveStatus === 'unsaved' ? 'text-[#f59e0b] bg-[#f59e0b]/10' :
              saveStatus === 'saving' ? 'text-[#8b949e] bg-[#8b949e]/10' :
              saveStatus === 'error' ? 'text-red-400 bg-red-400/10' : ''
            }`}>
              {saveStatus === 'saved' && <><Check size={10} /> Saved</>}
              {saveStatus === 'unsaved' && <><div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse" /> Unsaved</>}
              {saveStatus === 'saving' && <><Loader2 size={10} className="animate-spin" /> Saving...</>}
              {saveStatus === 'error' && <><AlertCircle size={10} /> Error</>}
            </span>
            
            {/* Status dropdown */}
            <select data-testid="lesson-status-select" value={lesson.status || 'draft'} onChange={(e) => handleStatusChange(e.target.value)} className="text-xs rounded-lg px-3 py-2 outline-none border font-medium cursor-pointer" style={{ backgroundColor: st.bg, color: st.text, borderColor: st.text + '40' }}>
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="published">Published</option>
            </select>
            
            {/* Access type toggle */}
            <button
              data-testid="lesson-access-toggle"
              onClick={async () => {
                const newAccess = lesson.access_type === 'free' ? 'premium' : 'free';
                try {
                  await api.put(`/admin/lessons/${lessonId}/access-type`, { access_type: newAccess });
                  setLesson({ ...lesson, access_type: newAccess });
    } catch { showError('Error updating access type'); }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer"
              style={{
                backgroundColor: lesson.access_type === 'free' ? '#22c55e15' : '#f59e0b15',
                color: lesson.access_type === 'free' ? '#22c55e' : '#f59e0b',
                borderColor: lesson.access_type === 'free' ? '#22c55e40' : '#f59e0b40',
              }}
            >
              {lesson.access_type === 'free' ? <Unlock size={12} /> : <Lock size={12} />}
              {lesson.access_type === 'free' ? 'Free' : 'Premium'}
            </button>
            
            <button data-testid="toggle-preview-button" onClick={() => setShowPreview(!showPreview)} className={`flex items-center gap-1.5 border px-3 py-2 rounded-lg text-xs font-medium transition-all ${showPreview ? 'text-[#22c55e] border-[#22c55e]/40 bg-[#22c55e]/5' : 'text-[#8b949e] border-[#2d333b] hover:text-white hover:border-[#484f58]'}`}>
              {showPreview ? <EyeOff size={14} /> : <Eye size={14} />} Preview
            </button>
            
            <button data-testid="import-md-button" onClick={() => setShowImport(true)} className="flex items-center gap-1.5 border border-[#2d333b] text-[#8b949e] hover:text-white hover:border-[#484f58] px-3 py-2 rounded-lg text-xs font-medium transition-colors">
              <Upload size={14} /> Import
            </button>
            
            <button data-testid="export-lesson-button" onClick={() => setShowExport(true)} className="flex items-center gap-1.5 border border-[#2d333b] text-[#8b949e] hover:text-white hover:border-[#484f58] px-3 py-2 rounded-lg text-xs font-medium transition-colors">
              <Download size={14} /> Export
            </button>
            
            <div className="flex items-center border border-[#2d333b] rounded-lg overflow-hidden">
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="bg-[#0d1117] text-[#8b949e] text-xs px-3 py-2 outline-none border-none cursor-pointer">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <button data-testid="ai-generate-button" onClick={handleGenerate} disabled={generating} className="flex items-center gap-1.5 bg-[#161b22] text-[#a855f7] hover:text-[#c084fc] px-3 py-2 text-xs font-medium transition-colors border-l border-[#2d333b] disabled:opacity-50">
                {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} AI
              </button>
            </div>

            {lesson?.source_pages && (
              <div className="relative">
                <button
                  data-testid="regen-from-pdf-button"
                  onClick={() => setShowPdfPopover((v) => !v)}
                  disabled={regenFromPdf}
                  title={`Regenerate from PDF pages ${lesson.source_pages[0]}–${lesson.source_pages[1]}`}
                  className="flex items-center gap-1.5 border border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/10 px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {regenFromPdf ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                  {regenFromPdf ? 'Regenerating…' : `Regen from PDF (pp ${lesson.source_pages[0]}–${lesson.source_pages[1]})`}
                </button>
                {showPdfPopover && !regenFromPdf && (
                  <div className="absolute right-0 top-full mt-1 w-80 bg-[#161b22] border border-[#2d333b] rounded-lg shadow-2xl p-3 z-20" data-testid="regen-pdf-popover">
                    <div className="text-[#c9d1d9] text-xs font-medium mb-2">Regenerate from PDF</div>
                    <div className="text-[#8b949e] text-[11px] leading-relaxed mb-3">
                      Re-runs the LLM against the source PDF and <strong className="text-[#f87171]">replaces</strong> all content blocks on this lesson. Adjust the page range if needed.
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <label className="text-[#8b949e] text-[11px]">Pages</label>
                      <input
                        data-testid="regen-page-start"
                        ref={pdfStartRef}
                        type="number" min="1"
                        defaultValue={lesson.source_pages[0]}
                        className="w-16 bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1 text-white text-xs focus:border-[#22c55e] outline-none"
                      />
                      <span className="text-[#8b949e] text-xs">–</span>
                      <input
                        data-testid="regen-page-end"
                        ref={pdfEndRef}
                        type="number" min="1"
                        defaultValue={lesson.source_pages[1]}
                        className="w-16 bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1 text-white text-xs focus:border-[#22c55e] outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setShowPdfPopover(false)} className="px-2 py-1 text-[#8b949e] text-xs hover:text-white transition-colors">Cancel</button>
                      <button
                        data-testid="regen-pdf-confirm"
                        onClick={() => {
                          const pstart = parseInt(pdfStartRef.current?.value ?? '') || lesson.source_pages[0];
                          const pend = parseInt(pdfEndRef.current?.value ?? '') || lesson.source_pages[1];
                          handleRegenFromPdf(pstart, pend);
                        }}
                        className="flex items-center gap-1 bg-[#ef4444] hover:bg-[#dc2626] text-white text-xs font-medium px-2.5 py-1 rounded transition-colors"
                      >
                        <FileText size={12} /> Regenerate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button data-testid="lesson-save-button" onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors shadow-lg shadow-[#22c55e]/20">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
            </button>
          </div>
        </div>

        {/* Import MD Modal */}
        {showImport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#161b22] border border-[#2d333b] rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-lg font-bold">Import Markdown</h2>
                <button onClick={() => { setShowImport(false); setImportMd(''); }} className="text-[#484f58] hover:text-white p-1"><X size={18} /></button>
              </div>
              <p className="text-[#8b949e] text-sm mb-4">Paste markdown content below. Supports headings, paragraphs, code blocks, lists, blockquotes, and callouts.</p>
              <textarea data-testid="import-md-textarea" value={importMd} onChange={(e) => setImportMd(e.target.value)} rows={18} placeholder={`## Getting Started\n\nWelcome to this lesson...\n\n\`\`\`python\nprint("Hello World")\n\`\`\`\n\n> **Note:** This is a callout\n\n- List item 1\n- List item 2`} className="w-full bg-[#0d1117] border border-[#2d333b] rounded-xl px-4 py-3 text-[#c9d1d9] text-sm font-mono outline-none focus:border-[#22c55e] resize-none" />
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => { setShowImport(false); setImportMd(''); }} className="px-4 py-2 text-[#8b949e] text-sm hover:text-white transition-colors">Cancel</button>
                <button data-testid="import-md-submit" onClick={handleImportMd} disabled={!importMd.trim()} className="flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors"><Upload size={14} /> Import Content</button>
              </div>
            </div>
          </div>
        )}

        {/* Export Modal */}
        {showExport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#161b22] border border-[#2d333b] rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-lg font-bold">Export Lesson</h2>
                <button onClick={() => setShowExport(false)} className="text-[#484f58] hover:text-white p-1"><X size={18} /></button>
              </div>
              <p className="text-[#8b949e] text-sm mb-6">Export "{lesson.title}" in your preferred format.</p>
              
              <div className="space-y-3">
                {/* JSON Export */}
                <div className="border border-[#2d333b] rounded-xl p-4 hover:border-[#484f58] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center">
                        <Code size={20} className="text-[#f59e0b]" />
                      </div>
                      <div>
                        <div className="text-white font-medium">JSON Format</div>
                        <div className="text-[#8b949e] text-xs">Full lesson data with all block properties</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={handleCopyJSON} className="p-2 text-[#8b949e] hover:text-white hover:bg-[#2d333b] rounded-lg transition-colors" title="Copy to clipboard">
                        <Copy size={16} />
                      </button>
                      <button onClick={handleExportJSON} className="flex items-center gap-1.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">
                        <Download size={14} /> Download
                      </button>
                    </div>
                  </div>
                </div>

                {/* Markdown Export */}
                <div className="border border-[#2d333b] rounded-xl p-4 hover:border-[#484f58] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center">
                        <FileText size={20} className="text-[#3b82f6]" />
                      </div>
                      <div>
                        <div className="text-white font-medium">Markdown Format</div>
                        <div className="text-[#8b949e] text-xs">Human-readable text with formatting</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={handleCopyMarkdown} className="p-2 text-[#8b949e] hover:text-white hover:bg-[#2d333b] rounded-lg transition-colors" title="Copy to clipboard">
                        <Copy size={16} />
                      </button>
                      <button onClick={handleExportMarkdown} className="flex items-center gap-1.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">
                        <Download size={14} /> Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#2d333b]">
                <div className="flex items-center justify-between text-xs text-[#484f58]">
                  <span>{blocks.length} blocks • {lesson.read_time || 'Unknown read time'}</span>
                  <span>Status: {lesson.status || 'draft'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Editor + Preview Layout */}
        <div className={`${showPreview ? 'grid grid-cols-2 gap-6' : ''}`}>
          {/* Block Editor */}
          <div className="border border-[#2d333b] rounded-2xl p-5 overflow-hidden" style={{ backgroundColor: '#161b22' }}>
            <BlockEditor
              blocks={blocks}
              onChange={setBlocks}
              onAiGenerate={handleGenerate}
              generating={generating}
              lessonId={lessonId}
            />
          </div>

          {/* Live Preview */}
          {showPreview && (
            <div className="border border-[#2d333b] rounded-2xl p-6 overflow-y-auto sticky top-6" style={{ backgroundColor: '#161b22', maxHeight: 'calc(100vh - 140px)' }}>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#2d333b]">
                <Eye size={14} className="text-[#22c55e]" />
                <span className="text-white text-sm font-medium">Live Preview</span>
              </div>
              <EditorPreview blocks={blocks} title={lesson.title} readTime={lesson.read_time} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============ Section Editor ============
interface SectionDetail { id: string; title: string; slug?: string; icon?: string; order?: number; course_id?: string; }

const SectionEditor = ({ sectionId }: { sectionId: string }) => {
  const navigate = useRouter();
  const [section, setSection] = useState<SectionDetail | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const res = await api.get<{ sections: SectionDetail[] } | SectionDetail[]>(`/sections`, { signal: ac.signal, cache: 'no-store' });
        if (ac.signal.aborted) return;
        const secs = Array.isArray(res.data) ? res.data : ((res.data as { sections?: SectionDetail[] }).sections ?? []);
        setSection(secs.find((s: SectionDetail) => s.id === sectionId) ?? null);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        handleApiError(err);
      }
    })();
    return () => ac.abort();
  }, [sectionId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/sections/${sectionId}`, { title: section.title, icon: section.icon, order: section.order });
      showSuccess('Section saved!');
      navigate.refresh();
    } catch (err) { handleApiError(err); }
    finally { setSaving(false); }
  };

  if (!section) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d1117' }}><Loader2 size={32} className="text-[#22c55e] animate-spin" /></div>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate.back()} className="text-[#8b949e] hover:text-white"><ArrowLeft size={20} /></button>
            <h1 className="text-white text-xl font-bold">Edit Section</h1>
          </div>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-white font-medium px-4 py-2 rounded-md text-sm"><Save size={16} /> {saving ? 'Saving...' : 'Save'}</button>
        </div>
        <div className="border border-[#2d333b] rounded-lg p-6 space-y-4" style={{ backgroundColor: '#161b22' }}>
          <div>
            <label className="text-[#8b949e] text-sm block mb-1">Title</label>
            <input value={section.title} onChange={(e) => setSection({ ...section, title: e.target.value })} className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]" />
          </div>
          <div>
            <label className="text-[#8b949e] text-sm block mb-1">Icon</label>
            <input value={section.icon} onChange={(e) => setSection({ ...section, icon: e.target.value })} className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]" />
          </div>
          <div>
            <label className="text-[#8b949e] text-sm block mb-1">Order</label>
            <input type="number" value={section.order} onChange={(e) => setSection({ ...section, order: parseInt(e.target.value) })} className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ Pricing Editor ============
interface PlanItem { id: string; name: string; price: number; features: string[]; }

const PricingEditor = () => {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [edits, setEdits] = useState<Record<string, PlanItem>>({});
  const [newFeature, setNewFeature] = useState<Record<string, string>>({});
  const navigate = useRouter();

  const fetchPlans = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await api.get<PlanItem[]>(`/plans`, { signal, cache: 'no-store' });
      if (signal?.aborted) return;
      setPlans(res.data);
      const initial: Record<string, PlanItem> = {};
      res.data.forEach((p: PlanItem) => { initial[p.id] = { ...p }; });
      setEdits(initial);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      handleApiError(err);
    }
    finally { if (!signal?.aborted) setLoading(false); }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPlans(ac.signal);
    return () => ac.abort();
  }, [fetchPlans]);

  const handleSave = async (planId: string) => {
    setSaving(prev => ({ ...prev, [planId]: true }));
    try {
      const edit = edits[planId];
      await api.put(`/admin/plans/${planId}`, {
        name: edit.name,
        price: parseFloat(edit.price as unknown as string),
        features: edit.features,
      });
      await fetchPlans();
    } catch (err) { showError('Error saving plan: ' + (err instanceof ApiError ? err.detail : (err as {message?: string}).message || '')); }
    finally { setSaving(prev => ({ ...prev, [planId]: false })); }
  };

  const updateField = (planId: string, field: string, value: string | number | string[]) => {
    setEdits(prev => ({ ...prev, [planId]: { ...prev[planId], [field]: value as never } }));
  };

  const removeFeature = (planId: string, idx: number) => {
    setEdits(prev => ({
      ...prev,
      [planId]: {
        ...prev[planId],
        features: prev[planId].features.filter((_, i: number) => i !== idx),
      },
    }));
  };

  const addFeature = (planId: string) => {
    const text = (newFeature[planId] || '').trim();
    if (!text) return;
    setEdits(prev => ({
      ...prev,
      [planId]: {
        ...prev[planId],
        features: [...(prev[planId].features || []), text],
      },
    }));
    setNewFeature(prev => ({ ...prev, [planId]: '' }));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d1117' }}><Loader2 size={32} className="text-[#22c55e] animate-spin" /></div>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate.push('/admin')} className="text-[#8b949e] hover:text-white transition-colors"><ArrowLeft size={20} /></button>
            <h1 className="text-white text-2xl font-bold">Subscription Pricing</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map(plan => {
            const edit = edits[plan.id] || plan;
            const isPro = plan.id === 'pro';
            return (
              <div key={plan.id} data-testid={`admin-plan-${plan.id}`} className="border rounded-xl p-6" style={{ backgroundColor: '#161b22', borderColor: isPro ? '#22c55e' : '#2d333b' }}>
                {isPro && <div className="text-xs font-medium px-2 py-0.5 rounded-full inline-block mb-3" style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}>Revenue Plan</div>}

                <div className="space-y-4">
                  <div>
                    <label className="text-[#8b949e] text-xs block mb-1">Plan Name</label>
                    <input
                      data-testid={`plan-name-${plan.id}`}
                      value={edit.name || ''}
                      onChange={(e) => updateField(plan.id, 'name', e.target.value)}
                      className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]"
                    />
                  </div>

                  <div>
                    <label className="text-[#8b949e] text-xs block mb-1">Price (USD)</label>
                    <div className="flex items-center gap-1">
                      <span className="text-[#8b949e] text-sm">$</span>
                      <input
                        data-testid={`plan-price-${plan.id}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={edit.price ?? 0}
                        onChange={(e) => updateField(plan.id, 'price', e.target.value)}
                        className="w-32 bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]"
                      />
                      {plan.id !== 'free' && <span className="text-[#484f58] text-xs">/month</span>}
                    </div>
                  </div>

                  <div>
                    <label className="text-[#8b949e] text-xs block mb-2">Features</label>
                    <div className="space-y-1.5">
                      {(edit.features || []).map((f: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 group">
                          <Check size={12} className="text-[#22c55e] flex-shrink-0" />
                          <span className="text-[#c9d1d9] text-sm flex-1">{f}</span>
                          <button
                            onClick={() => removeFeature(plan.id, idx)}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity p-0.5"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        data-testid={`plan-new-feature-${plan.id}`}
                        value={newFeature[plan.id] || ''}
                        onChange={(e) => setNewFeature(prev => ({ ...prev, [plan.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && addFeature(plan.id)}
                        placeholder="Add feature..."
                        className="flex-1 bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-1.5 text-[#c9d1d9] text-xs outline-none focus:border-[#22c55e]"
                      />
                      <button
                        onClick={() => addFeature(plan.id)}
                        className="text-[#22c55e] hover:text-[#16a34a] p-1"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  data-testid={`save-plan-${plan.id}`}
                  onClick={() => handleSave(plan.id)}
                  disabled={saving[plan.id]}
                  className="mt-5 w-full flex items-center justify-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-white font-medium py-2 rounded-md text-sm transition-colors"
                >
                  {saving[plan.id] ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving[plan.id] ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============ Learning Path Manager ============
const ICON_OPTIONS = [
  { value: 'brain', label: 'Brain', Icon: Brain },
  { value: 'layers', label: 'Layers', Icon: Layers },
  { value: 'server', label: 'Server', Icon: Server },
  { value: 'code', label: 'Code', Icon: Code },
  { value: 'sparkles', label: 'Sparkles', Icon: Sparkles },
];

const DIFFICULTY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];
const DIFF_COLORS = { Beginner: '#22c55e', Intermediate: '#f59e0b', Advanced: '#ef4444' };

interface PathCourse { course_slug: string; order: number; }
interface PathItem { id: string; title: string; slug: string; description?: string; icon?: string; difficulty?: string; estimated_hours?: number; courses?: PathCourse[]; }
interface CourseBrief { id: string; slug: string; title: string; lesson_count: number; }

const LearningPathManager = () => {
  const navigate = useRouter();
  const [paths, setPaths] = useState<PathItem[]>([]);
  const [courses, setCourses] = useState<CourseBrief[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreate, setShowCreate] = useState<boolean>(false);
  const [editingPath, setEditingPath] = useState<PathItem | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [form, setForm] = useState<{ title: string; slug: string; description: string; icon: string; difficulty: string; estimated_hours: number; courses: PathCourse[] }>({
    title: '', slug: '', description: '', icon: 'layers',
    difficulty: 'Beginner', estimated_hours: 0, courses: [],
  });

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    try {
      const [pathsRes, coursesRes] = await Promise.all([
        api.get<PathItem[]>(`/learning-paths`, { signal, cache: 'no-store' }),
        api.get<{ courses: CourseBrief[] } | CourseBrief[]>(`/courses?include_drafts=true`, { signal, cache: 'no-store' }),
      ]);
      if (signal?.aborted) return;
      setPaths(pathsRes.data);
      const coursesData = coursesRes.data as { courses?: CourseBrief[] } | CourseBrief[] | undefined;
      const coursesArr = Array.isArray(coursesData) ? coursesData : (coursesData?.courses ?? []);
      setCourses(coursesArr.filter((c: CourseBrief) => c.lesson_count > 0));
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      handleApiError(err);
    }
    finally { if (!signal?.aborted) setLoading(false); }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(ac.signal);
    return () => ac.abort();
  }, [fetchData]);

  const resetForm = () => {
    setForm({ title: '', slug: '', description: '', icon: 'layers', difficulty: 'Beginner', estimated_hours: 0, courses: [] });
    setEditingPath(null);
    setShowCreate(false);
  };

  const openEdit = (path: PathItem) => {
    setForm({
      title: path.title,
      slug: path.slug,
      description: path.description || '',
      icon: path.icon || 'layers',
      difficulty: path.difficulty || 'Beginner',
      estimated_hours: path.estimated_hours || 0,
      courses: (path.courses || []).map((c: PathCourse) => ({ course_slug: c.course_slug, order: c.order })),
    });
    setEditingPath(path);
    setShowCreate(true);
  };

  const handleSave = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        description: form.description,
        icon: form.icon,
        difficulty: form.difficulty,
        estimated_hours: parseInt(String(form.estimated_hours)) || 0,
        courses: form.courses.map((c: PathCourse, i: number) => ({ course_slug: c.course_slug, order: i })),
      };
      if (!editingPath) {
        payload.slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      if (editingPath) {
        await api.put(`/learning-paths/${editingPath.id}`, payload);
      } else {
        await api.post(`/learning-paths`, payload);
      }
      resetForm();
      await fetchData();
      navigate.refresh();
    } catch (err) {
      showError((err instanceof ApiError ? err.detail : 'Error saving path'));
    } finally { setSaving(false); }
  };

  const handleDelete = async (pathId: string, title: string) => {
    if (!(await showConfirm(`Delete "${title}" learning path?`))) return;
    try {
      await api.delete(`/learning-paths/${pathId}`);
      await fetchData();
      navigate.refresh();
    } catch { showError('Error deleting path'); }
  };

  const addCourseToPath = (slug: string) => {
    if (form.courses.find((c: PathCourse) => c.course_slug === slug)) return;
    setForm(prev => ({
      ...prev,
      courses: [...prev.courses, { course_slug: slug, order: prev.courses.length }],
    }));
  };

  const removeCourseFromPath = (slug: string) => {
    setForm(prev => ({
      ...prev,
      courses: prev.courses.filter((c: PathCourse) => c.course_slug !== slug).map((c: PathCourse, i: number) => ({ ...c, order: i })),
    }));
  };

  const moveCourse = (idx: number, direction: number) => {
    const newCourses = [...form.courses];
    const target = idx + direction;
    if (target < 0 || target >= newCourses.length) return;
    [newCourses[idx], newCourses[target]] = [newCourses[target], newCourses[idx]];
    setForm(prev => ({ ...prev, courses: newCourses.map((c: PathCourse, i: number) => ({ ...c, order: i })) }));
  };

  const availableCourses = courses.filter((c: CourseBrief) => !form.courses.find((pc: PathCourse) => pc.course_slug === c.slug));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = async (event: { active: { id: string }; over: { id: string } | null }) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = paths.findIndex(p => p.id === active.id);
    const newIndex = paths.findIndex(p => p.id === over.id);
    const reordered = arrayMove(paths, oldIndex, newIndex);
    setPaths(reordered);
    try {
      await api.put(`/learning-paths/reorder`, { order: reordered.map(p => p.id) });
    } catch (err) { console.error('Reorder failed', err); await fetchData(); }
  };

  const SortablePathItem = ({ path, onEdit, onDelete }: { path: PathItem; onEdit: () => void; onDelete: () => void }) => {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: path.id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 10 : 'auto',
    };
    const dc = DIFF_COLORS[path.difficulty as keyof typeof DIFF_COLORS] || '#8b949e';
    return (
      <div
        ref={setNodeRef}
        style={{ ...style, backgroundColor: '#161b22' }}
        data-testid={`admin-path-${path.slug}`}
        className="border border-[#2d333b] rounded-xl p-5 hover:border-[#484f58] transition-colors group"
        {...attributes}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div
              ref={setActivatorNodeRef}
              {...listeners}
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing hover:bg-[#22c55e20] transition-colors"
              style={{ backgroundColor: isDragging ? '#22c55e20' : '#22c55e15' }}
              title="Drag to reorder"
            >
              <GripVertical size={18} style={{ color: isDragging ? '#22c55e' : '#484f58' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-bold text-lg">{path.title}</h3>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: dc + '20', color: dc }}>{path.difficulty}</span>
              </div>
              <p className="text-[#8b949e] text-sm mb-3 line-clamp-1">{path.description || 'No description'}</p>
              <div className="flex items-center gap-4 text-xs text-[#484f58]">
                <span className="flex items-center gap-1"><BookOpen size={12} /> {path.course_count} courses</span>
                <span className="flex items-center gap-1"><Layers size={12} /> {path.total_lessons} lessons</span>
                <span className="flex items-center gap-1"><Clock size={12} /> ~{path.estimated_hours}h</span>
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                {(path.courses || []).map((c: PathCourse, i: number) => (
                  <span key={c.course_slug} className="text-[10px] px-2 py-0.5 rounded-full border border-[#2d333b] text-[#8b949e]">
                    {i + 1}. {c.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-4">
            <button data-testid={`edit-path-${path.slug}`} onClick={onEdit} className="text-[#8b949e] hover:text-white p-2 hover:bg-[#2d333b] rounded-lg transition-colors">
              <Edit2 size={14} />
            </button>
            <button data-testid={`delete-path-${path.slug}`} onClick={onDelete} className="text-red-400/60 hover:text-red-400 p-2 hover:bg-red-400/10 rounded-lg transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d1117' }}>
        <Loader2 size={32} className="text-[#22c55e] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate.push('/admin')} className="text-[#8b949e] hover:text-white transition-colors"><ArrowLeft size={20} /></button>
            <h1 className="text-white text-2xl font-bold">Learning Paths</h1>
            <span className="text-[#484f58] text-sm">{paths.length} paths</span>
          </div>
          <button
            data-testid="create-path-button"
            onClick={() => { resetForm(); setShowCreate(true); }}
            className="flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white font-medium px-4 py-2 rounded-md text-sm transition-colors"
          >
            <Plus size={16} /> New Path
          </button>
        </div>

        {/* Create/Edit Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-[#161b22] border border-[#2d333b] rounded-xl p-6 w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white text-lg font-bold">{editingPath ? 'Edit Path' : 'Create Learning Path'}</h2>
                <button onClick={resetForm} className="text-[#484f58] hover:text-white p-1"><X size={18} /></button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="text-[#8b949e] text-xs block mb-1">Title</label>
                  <input
                    data-testid="path-title-input"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({
                      ...prev,
                      title: e.target.value,
                      slug: editingPath ? prev.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                    }))}
                    placeholder="e.g., AI Engineer Path"
                    className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="text-[#8b949e] text-xs block mb-1">Slug</label>
                  <input
                    data-testid="path-slug-input"
                    value={form.slug}
                    onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="ai-engineer-path"
                    className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[#8b949e] text-xs block mb-1">Description</label>
                  <textarea
                    data-testid="path-description-input"
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the learning path..."
                    rows={2}
                    className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e] resize-none"
                  />
                </div>

                {/* Icon + Difficulty + Hours row */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[#8b949e] text-xs block mb-1">Icon</label>
                    <select
                      data-testid="path-icon-select"
                      value={form.icon}
                      onChange={(e) => setForm(prev => ({ ...prev, icon: e.target.value }))}
                      className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]"
                    >
                      {ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[#8b949e] text-xs block mb-1">Difficulty</label>
                    <select
                      data-testid="path-difficulty-select"
                      value={form.difficulty}
                      onChange={(e) => setForm(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]"
                    >
                      {DIFFICULTY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[#8b949e] text-xs block mb-1">Est. Hours</label>
                    <input
                      data-testid="path-hours-input"
                      type="number"
                      min="0"
                      value={form.estimated_hours}
                      onChange={(e) => setForm(prev => ({ ...prev, estimated_hours: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]"
                    />
                  </div>
                </div>

                {/* Course selector */}
                <div>
                  <label className="text-[#8b949e] text-xs block mb-2">Courses in Path ({form.courses.length})</label>

                  {/* Current courses */}
                  {form.courses.length > 0 && (
                    <div className="space-y-1.5 mb-3">
                      {form.courses.map((pc: PathCourse, idx: number) => {
                        const course = courses.find((c: CourseBrief) => c.slug === pc.course_slug);
                        return (
                          <div key={pc.course_slug} className="flex items-center gap-2 px-3 py-2 rounded-md border border-[#2d333b] bg-[#0d1117]">
                            <span className="text-xs font-bold text-[#484f58] w-5 text-center">{idx + 1}</span>
                            <span className="text-[#c9d1d9] text-sm flex-1">{course?.title || pc.course_slug}</span>
                            <span className="text-[#484f58] text-[10px]">{course?.lesson_count || 0} lessons</span>
                            <button onClick={() => moveCourse(idx, -1)} disabled={idx === 0} className="text-[#8b949e] hover:text-white disabled:opacity-20 p-0.5"><ChevronUp size={14} /></button>
                            <button onClick={() => moveCourse(idx, 1)} disabled={idx === form.courses.length - 1} className="text-[#8b949e] hover:text-white disabled:opacity-20 p-0.5"><ChevronDown size={14} /></button>
                            <button onClick={() => removeCourseFromPath(pc.course_slug)} className="text-red-400/60 hover:text-red-400 p-0.5"><X size={14} /></button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add course dropdown */}
                  {availableCourses.length > 0 && (
                    <select
                      data-testid="path-add-course-select"
                      value=""
                      onChange={(e) => { if (e.target.value) addCourseToPath(e.target.value); }}
                      className="w-full bg-[#0d1117] border border-dashed border-[#2d333b] rounded-md px-3 py-2 text-[#8b949e] text-sm outline-none focus:border-[#22c55e]"
                    >
                      <option value="">+ Add a course...</option>
                      {availableCourses.map(c => (
                        <option key={c.slug} value={c.slug}>{c.title} ({c.lesson_count} lessons)</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button onClick={resetForm} className="px-4 py-2 text-[#8b949e] text-sm hover:text-white">Cancel</button>
                <button
                  data-testid="save-path-button"
                  onClick={handleSave}
                  disabled={saving || !form.title || form.courses.length === 0}
                  className="flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-white font-medium px-5 py-2 rounded-md text-sm transition-colors"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {editingPath ? 'Update Path' : 'Create Path'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Paths List */}
        {paths.length === 0 ? (
          <div className="text-center py-16 text-[#484f58]">
            <RouteIcon size={40} className="mx-auto mb-3 opacity-30" />
            <p>No learning paths yet. Create one to group courses into guided tracks.</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={paths.map(p => p.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {paths.map((path) => (
                  <SortablePathItem
                    key={path.id}
                    path={path}
                    onEdit={() => openEdit(path)}
                    onDelete={() => handleDelete(path.id, path.title)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

// ============ Cache Manager ============
const CacheManager = () => {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [flushing, setFlushing] = useState<boolean>(false);
  const navigate = useRouter();

  const fetchStats = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await api.get<Record<string, unknown>>(`/admin/cache/stats`, { signal });
      if (signal?.aborted) return;
      setStats(res.data);
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return;
      handleApiError(err);
    }
    finally { if (!signal?.aborted) setLoading(false); }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats(ac.signal);
    return () => ac.abort();
  }, [fetchStats]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const ac = new AbortController();
    const interval = setInterval(() => fetchStats(ac.signal), 5000);
    return () => { clearInterval(interval); ac.abort(); };
  }, [fetchStats]);

  const handleFlush = async () => {
    if (!(await showConfirm('Flush all cached data? This will temporarily increase response times.'))) return;
    setFlushing(true);
    try {
      await api.post(`/admin/cache/flush`, {});
      await fetchStats();
    } catch (err) { handleApiError(err); }
    finally { setFlushing(false); }
  };

  const formatUptime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button data-testid="cache-back-button" onClick={() => navigate.push('/admin')} className="text-[#8b949e] hover:text-white transition-colors"><ArrowLeft size={20} /></button>
            <div>
              <h1 className="text-white text-2xl font-bold flex items-center gap-2"><Zap size={24} className="text-[#f97316]" /> Performance & Cache</h1>
              <p className="text-[#8b949e] text-sm mt-1">Redis caching layer with GZip compression</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button data-testid="cache-refresh-button" onClick={() => fetchStats()} className="flex items-center gap-2 border border-[#2d333b] text-[#8b949e] hover:text-white hover:border-[#484f58] px-3 py-2 rounded-lg text-sm transition-colors">
              <RefreshCw size={14} /> Refresh
            </button>
            <button data-testid="cache-flush-button" onClick={handleFlush} disabled={flushing} className="flex items-center gap-2 bg-[#da3633] hover:bg-[#f85149] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              {flushing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              {flushing ? 'Flushing...' : 'Flush All Cache'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="text-[#f97316] animate-spin" />
          </div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Connection Status */}
            <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${stats.connected ? 'bg-[#22c55e]' : 'bg-[#da3633]'}`} />
                <span className="text-white font-medium" data-testid="cache-connection-status">
                  Redis {stats.connected ? 'Connected' : 'Disconnected'}
                </span>
                <span className="text-[#484f58] text-xs ml-auto">Auto-refreshes every 5s</span>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0d1117] border border-[#2d333b] rounded-lg p-4">
                  <div className="text-[#8b949e] text-xs uppercase tracking-wider mb-1">Hit Rate</div>
                  <div className="text-2xl font-bold text-[#22c55e]" data-testid="cache-hit-rate">{stats.hit_rate_percent}%</div>
                  <div className="text-[#484f58] text-xs mt-1">{stats.total_requests} total requests</div>
                </div>
                <div className="bg-[#0d1117] border border-[#2d333b] rounded-lg p-4">
                  <div className="text-[#8b949e] text-xs uppercase tracking-wider mb-1">Cached Keys</div>
                  <div className="text-2xl font-bold text-[#f97316]" data-testid="cache-key-count">{stats.cached_keys || 0}</div>
                  <div className="text-[#484f58] text-xs mt-1">Active entries</div>
                </div>
                <div className="bg-[#0d1117] border border-[#2d333b] rounded-lg p-4">
                  <div className="text-[#8b949e] text-xs uppercase tracking-wider mb-1">Memory</div>
                  <div className="text-2xl font-bold text-[#06b6d4]" data-testid="cache-memory">{stats.memory_used || 'N/A'}</div>
                  <div className="text-[#484f58] text-xs mt-1">Redis memory</div>
                </div>
                <div className="bg-[#0d1117] border border-[#2d333b] rounded-lg p-4">
                  <div className="text-[#8b949e] text-xs uppercase tracking-wider mb-1">Uptime</div>
                  <div className="text-2xl font-bold text-[#a855f7]" data-testid="cache-uptime">{formatUptime(stats.uptime_seconds)}</div>
                  <div className="text-[#484f58] text-xs mt-1">Since last restart</div>
                </div>
              </div>
            </div>

            {/* Hit/Miss Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
                <h3 className="text-white font-medium mb-4 flex items-center gap-2"><Activity size={16} className="text-[#22c55e]" /> Cache Operations</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8b949e] text-sm">Cache Hits</span>
                    <span className="text-[#22c55e] font-mono font-medium" data-testid="cache-hits">{stats.hits}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8b949e] text-sm">Cache Misses</span>
                    <span className="text-[#f97316] font-mono font-medium" data-testid="cache-misses">{stats.misses}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8b949e] text-sm">Cache Sets</span>
                    <span className="text-[#06b6d4] font-mono font-medium" data-testid="cache-sets">{stats.sets}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8b949e] text-sm">Cache Deletes</span>
                    <span className="text-[#da3633] font-mono font-medium" data-testid="cache-deletes">{stats.deletes}</span>
                  </div>
                </div>
                {/* Hit Rate Bar */}
                <div className="mt-4 pt-4 border-t border-[#2d333b]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#8b949e] text-xs">Hit Rate</span>
                    <span className="text-white text-xs font-medium">{stats.hit_rate_percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#0d1117] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${stats.hit_rate_percent}%`, backgroundColor: stats.hit_rate_percent > 70 ? '#22c55e' : stats.hit_rate_percent > 40 ? '#f97316' : '#da3633' }} />
                  </div>
                </div>
              </div>

              {/* Cache TTL Info */}
              <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
                <h3 className="text-white font-medium mb-4 flex items-center gap-2"><Clock size={16} className="text-[#06b6d4]" /> Cache TTL Configuration</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8b949e] text-sm">Courses & Sections</span>
                    <span className="text-white font-mono text-sm bg-[#0d1117] px-2 py-0.5 rounded">5 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8b949e] text-sm">Individual Lessons</span>
                    <span className="text-white font-mono text-sm bg-[#0d1117] px-2 py-0.5 rounded">10 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8b949e] text-sm">Search Results</span>
                    <span className="text-white font-mono text-sm bg-[#0d1117] px-2 py-0.5 rounded">2 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8b949e] text-sm">Categories & Sitemap</span>
                    <span className="text-white font-mono text-sm bg-[#0d1117] px-2 py-0.5 rounded">1 hour</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8b949e] text-sm">Admin Stats</span>
                    <span className="text-white font-mono text-sm bg-[#0d1117] px-2 py-0.5 rounded">2 min</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Optimization Features */}
            <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
              <h3 className="text-white font-medium mb-4 flex items-center gap-2"><Server size={16} className="text-[#a855f7]" /> Active Optimizations</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 bg-[#0d1117] border border-[#2d333b] rounded-lg p-4">
                  <div className="w-8 h-8 rounded-lg bg-[#22c55e]/10 flex items-center justify-center flex-shrink-0">
                    <Database size={16} className="text-[#22c55e]" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">Redis Caching</div>
                    <div className="text-[#8b949e] text-xs mt-0.5">In-memory cache for API responses with auto-invalidation on writes</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-[#0d1117] border border-[#2d333b] rounded-lg p-4">
                  <div className="w-8 h-8 rounded-lg bg-[#06b6d4]/10 flex items-center justify-center flex-shrink-0">
                    <Zap size={16} className="text-[#06b6d4]" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">GZip Compression</div>
                    <div className="text-[#8b949e] text-xs mt-0.5">Responses compressed at middleware level, reducing transfer size by 60-80%</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-[#0d1117] border border-[#2d333b] rounded-lg p-4">
                  <div className="w-8 h-8 rounded-lg bg-[#f97316]/10 flex items-center justify-center flex-shrink-0">
                    <Activity size={16} className="text-[#f97316]" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">Smart Invalidation</div>
                    <div className="text-[#8b949e] text-xs mt-0.5">Cache auto-clears on content changes (CRUD operations) for data freshness</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-[#8b949e]">Failed to load cache stats</div>
        )}
      </div>
    </div>
  );
};

// ============ Admin Panel Router ============
const ROUTE_MAP: Record<string, React.ComponentType<any>> = {
  '/dashboard': AdminDashboard,
  '/dashboard/users': UserManagement,
  '/dashboard/revenue': RevenueDashboard,
  '/dashboard/quizzes': QuizAnalytics,
  '/dashboard/certificates': CertificateManagement,
  '/dashboard/tutor': TutorUsage,
  '/dashboard/system': SystemHealth,
  '/dashboard/digest': EmailDigest,
  '/dashboard/code-monitor': CodeMonitor,
  '/dashboard/activity': ActivityFeed,
  '/dashboard/audit-logs': AuditLogs,
  '/dashboard/bulk': BulkOperations,
  '/dashboard/seo': SEOManagement,
  '/dashboard/heatmap': ContentHeatmap,
  '/dashboard/announcements': Announcements,
  '/dashboard/llm-keys': LLMKeysPage,
  '/dashboard/code-execution': CodeExecutionSettings,
  '/dashboard/llm-keys/usage': LLMUsageDashboard,
  '/dashboard/backup': BackupRestore,
  '/dashboard/homepage': HomepageSettings,
  '/dashboard/api-monitoring': ApiMonitoring,
  '/dashboard/policies': PolicyEditor,
  '/dashboard/discussions': DiscussionModeration,
  '/dashboard/ppp-analytics': PppAnalytics,
  '/dashboard/lesson-feedback': LessonFeedbackAdmin,
  '/pricing': PricingEditor,
  '/quizzes': QuizManager,
  '/learning-paths': LearningPathManager,
  '/ai-create': AICourseCreator,
  '/pdf-create': PDFCourseCreator,
  '/navigation': NavigationEditor,
  '/quick-outline': CourseOutlineImport,
  '/import-markdown': FullCourseMarkdownImport,
  '/cache': CacheManager,
};

function matchAdminRoute(pathname: string): { Component: React.ComponentType<any> | null; params: Record<string, string> } {
  const p = pathname.replace(/^\/admin/, '') || '/';

  if (ROUTE_MAP[p]) {
    return { Component: ROUTE_MAP[p], params: {} };
  }

  // Parameterized routes
  const paramRoutes = [
    { pattern: /^\/courses\/([^/]+)$/, keys: ['courseId'] },
    { pattern: /^\/courses\/([^/]+)\/bulk-create$/, keys: ['courseId'] },
    { pattern: /^\/lessons\/([^/]+)$/, keys: ['lessonId'] },
    { pattern: /^\/sections\/([^/]+)$/, keys: ['sectionId'] },
  ];

  for (const route of paramRoutes) {
    const match = p.match(route.pattern);
    if (match) {
      const params: Record<string, string> = {};
      route.keys.forEach((key, i) => { params[key] = match[i + 1]; });
      switch (route.keys[0]) {
        case 'courseId': return { Component: p.includes('bulk-create') ? BulkLessonCreator : CourseDetail, params };
        case 'lessonId': return { Component: LessonEditor, params };
        case 'sectionId': return { Component: SectionEditor, params };
      }
    }
  }

  return { Component: CourseDashboard, params: {} };
}

const AdminPanel = () => {
  const [authed, setAuthed] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [logging, setLogging] = useState<boolean>(false);
  const { logout: userLogout } = useAuth();
  const navigate = useRouter();
  const pathname = usePathname() || '';

  useEffect(() => {
    const ac = new AbortController();
    api.get(`/admin/verify`, { signal: ac.signal })
      .then(() => { if (!ac.signal.aborted) setAuthed(true); })
      .catch(() => {})
      .finally(() => { if (!ac.signal.aborted) setChecking(false); });
    return () => ac.abort();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLogging(true);
    try {
      await api.post(`/admin/login`, { password });
      setAuthed(true);
    } catch {
      setError('Invalid password');
    } finally {
      setLogging(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d1117' }}>
        <Loader2 size={28} className="text-[#22c55e] animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d1117' }}>
        <form onSubmit={handleLogin} className="w-full max-w-xs">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#22c55e' }}>
              <Lock size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Admin Access</h1>
            <p className="text-sm text-[#8b949e] mt-1">Enter password to continue</p>
          </div>
          <div className="border border-[#2d333b] rounded-xl p-5 space-y-4" style={{ backgroundColor: '#161b22' }}>
            <input
              data-testid="admin-password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2.5 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e] placeholder-[#484f58]"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              data-testid="admin-login-btn"
              type="submit"
              disabled={logging || !password}
              className="w-full flex items-center justify-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              {logging ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
              {logging ? 'Verifying...' : 'Enter Admin'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  const route = matchAdminRoute(pathname);
  const ActiveComponent = route.Component as React.ElementType;
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="sticky top-0 z-50 flex items-center justify-between gap-3 px-4 h-11 border-b" style={{ backgroundColor: '#161b22', borderColor: '#2d333b' }}>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => { try { await api.post('/admin/logout'); } catch {} userLogout(); }}
            className="flex items-center gap-1.5 text-xs font-medium transition-colors px-2.5 py-1 rounded"
            style={{ color: '#ef4444' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2d333b'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut size={13} /> Log Out
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: '#8b949e' }}>
          <Code size={13} style={{ color: '#22c55e' }} />
          <span className="font-semibold hidden sm:inline" style={{ color: '#c9d1d9' }}>Admin Panel</span>
        </div>
        <button
          onClick={() => navigate.push('/')}
          className="flex items-center gap-1.5 text-xs font-medium transition-colors px-2.5 py-1 rounded"
          style={{ color: '#8b949e' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2d333b'; e.currentTarget.style.color = '#c9d1d9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#8b949e'; }}
        >
          <Home size={13} /> Back to Site
        </button>
      </div>
      <ActiveComponent {...(route.params as any)} />
    </div>
  );
};

export default AdminPanel;
