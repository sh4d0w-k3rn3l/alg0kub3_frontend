'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { showConfirm } from '@/lib/toast';
import {
  ArrowLeft, Download, Upload, Trash2, Loader2, CheckCircle,
  AlertTriangle, FolderArchive, Clock,
  FileText, ChevronDown, ChevronRight, HardDrive,
  BookOpen, Layers, FileCode
} from 'lucide-react';

interface BackupItem { folder: string; created_at?: string; timestamp?: string; size_kb: number; stats?: { courses: number; sections: number; lessons: number; lessons_with_content?: number }; }
interface BackupTreeNode { slug: string; title: string; sections: { slug: string; title: string; lessons: { file: string; title: string; has_content: boolean; blocks?: number }[] }[]; }

const BackupRestore = () => {
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expandedBackup, setExpandedBackup] = useState<string | null>(null);
  const [backupDetail, setBackupDetail] = useState<{ tree: BackupTreeNode[] } | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const navigate = useRouter();

  const showToast = (message: string, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadBackups = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const res = await api.get<BackupItem[]>('/admin/backups', { signal });
      if (signal?.aborted) return;
      setBackups(res.data);
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return;
      showToast('Failed to load backups', 'error');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    (async () => { await loadBackups(ac.signal); })();
    return () => ac.abort();
  }, [loadBackups]);

  const createBackup = async () => {
    setCreating(true);
    try {
      const res = await api.post<{ stats: { courses: number; sections: number; lessons: number } }>('/admin/backup');
      showToast(`Backup created: ${res.data.stats.courses} courses, ${res.data.stats.sections} sections, ${res.data.stats.lessons} lessons`);
      loadBackups();
    } catch {
      showToast('Failed to create backup', 'error');
    } finally {
      setCreating(false);
    }
  };

  const restoreBackup = async (folder: string) => {
    if (!(await showConfirm(`Restore backup "${folder}"? This will overwrite existing data for matching courses/sections/lessons.`))) return;
    setRestoring(folder);
    try {
      const res = await api.post<{ stats: { courses_restored: number; sections_restored: number; lessons_restored: number } }>(`/admin/restore/${folder}`);
      const s = res.data.stats;
      showToast(`Restored: ${s.courses_restored} courses, ${s.sections_restored} sections, ${s.lessons_restored} lessons`);
    } catch {
      showToast('Restore failed', 'error');
    } finally {
      setRestoring(null);
    }
  };

  const deleteBackup = async (folder: string) => {
    if (!(await showConfirm(`Delete backup "${folder}"? This cannot be undone.`))) return;
    setDeleting(folder);
    try {
      await api.delete(`/admin/backups/${folder}`);
      showToast('Backup deleted');
      loadBackups();
      if (expandedBackup === folder) {
        setExpandedBackup(null);
        setBackupDetail(null);
      }
    } catch {
      showToast('Failed to delete backup', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const toggleDetail = async (folder: string) => {
    if (expandedBackup === folder) {
      setExpandedBackup(null);
      setBackupDetail(null);
      return;
    }
    setExpandedBackup(folder);
    setDetailLoading(true);
    try {
      const res = await api.get<{ tree: BackupTreeNode[] }>(`/admin/backups/${folder}`);
      setBackupDetail(res.data);
    } catch {
      showToast('Failed to load backup details', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const formatDate = (ts: string) => {
    if (!ts) return 'Unknown';
    try {
      if (ts.includes('T')) return new Date(ts).toLocaleString();
      const y = ts.slice(0, 4), m = ts.slice(4, 6), d = ts.slice(6, 8);
      const h = ts.slice(9, 11), mi = ts.slice(11, 13), s = ts.slice(13, 15);
      return new Date(`${y}-${m}-${d}T${h}:${mi}:${s}Z`).toLocaleString();
    } catch { return ts; }
  };

  return (
    <div data-testid="backup-restore-page" className="min-h-screen bg-[#0d1117] text-white p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
          toast.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-emerald-500/90 text-white'
        }`}>
          {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button data-testid="backup-back-button" onClick={() => navigate.push('/admin/dashboard')} className="text-[#8b949e] hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <FolderArchive size={24} className="text-[#f59e0b]" />
                Backup & Restore
              </h1>
              <p className="text-sm text-[#8b949e] mt-1">Export and restore all courses, sections, and lesson content</p>
            </div>
          </div>
          <button
            data-testid="create-backup-button"
            onClick={createBackup}
            disabled={creating}
            className="flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-50 text-black font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            {creating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {creating ? 'Creating Backup...' : 'Create Backup'}
          </button>
        </div>

        {/* Info Card */}
        <div className="border border-[#f59e0b]/20 bg-[#f59e0b]/5 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <HardDrive size={18} className="text-[#f59e0b] mt-0.5 shrink-0" />
            <div className="text-sm text-[#8b949e]">
              <p className="text-[#c9d1d9] font-medium mb-1">How Backups Work</p>
              <p>Each backup saves every course, section, and lesson as <span className="text-[#f59e0b]">JSON</span> (full structured data) and <span className="text-[#f59e0b]">Markdown</span> (human-readable content) files organized by course and section folders. Restore will upsert data without deleting existing content.</p>
            </div>
          </div>
        </div>

        {/* Backup List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-[#8b949e]" />
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#2d333b] rounded-xl">
            <FolderArchive size={48} className="text-[#484f58] mx-auto mb-4" />
            <p className="text-[#8b949e] text-lg mb-2">No backups yet</p>
            <p className="text-[#484f58] text-sm">Click &ldquo;Create Backup&rdquo; to export all course data</p>
          </div>
        ) : (
          <div className="space-y-3">
            {backups.map((backup) => (
              <div key={backup.folder} className="border border-[#2d333b] rounded-xl overflow-hidden bg-[#161b22]">
                {/* Backup Header Row */}
                <div className="flex items-center justify-between p-4 hover:bg-[#1c2333] transition-colors">
                  <button
                    data-testid={`backup-expand-${backup.folder}`}
                    onClick={() => toggleDetail(backup.folder)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    {expandedBackup === backup.folder ? <ChevronDown size={16} className="text-[#8b949e]" /> : <ChevronRight size={16} className="text-[#8b949e]" />}
                    <FolderArchive size={18} className="text-[#f59e0b]" />
                    <div>
                      <p className="text-sm font-medium text-[#c9d1d9]">{backup.folder}</p>
                      <p className="text-xs text-[#8b949e] mt-0.5">
                        <Clock size={10} className="inline mr-1" />
                        {formatDate((backup.created_at || backup.timestamp) ?? '')}
                      </p>
                    </div>
                  </button>
                  <div className="flex items-center gap-4">
                    {/* Stats chips */}
                    {backup.stats && (
                      <div className="flex items-center gap-3 text-xs text-[#8b949e]">
                        {backup.stats.courses !== undefined && (
                          <span className="flex items-center gap-1"><BookOpen size={12} className="text-[#3b82f6]" />{backup.stats.courses} courses</span>
                        )}
                        {backup.stats.sections !== undefined && (
                          <span className="flex items-center gap-1"><Layers size={12} className="text-[#8b5cf6]" />{backup.stats.sections} sections</span>
                        )}
                        {backup.stats.lessons !== undefined && (
                          <span className="flex items-center gap-1"><FileText size={12} className="text-[#22c55e]" />{backup.stats.lessons} lessons</span>
                        )}
                        {backup.stats.lessons_with_content !== undefined && (
                          <span className="flex items-center gap-1"><FileCode size={12} className="text-[#f59e0b]" />{backup.stats.lessons_with_content} with content</span>
                        )}
                      </div>
                    )}
                    <span className="text-xs text-[#484f58]">{backup.size_kb} KB</span>
                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        data-testid={`backup-restore-${backup.folder}`}
                        onClick={() => restoreBackup(backup.folder)}
                        disabled={restoring === backup.folder}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-[#22c55e]/30 text-[#22c55e] hover:bg-[#22c55e]/10 transition-colors disabled:opacity-50"
                      >
                        {restoring === backup.folder ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                        Restore
                      </button>
                      <button
                        data-testid={`backup-delete-${backup.folder}`}
                        onClick={() => deleteBackup(backup.folder)}
                        disabled={deleting === backup.folder}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        {deleting === backup.folder ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Detail */}
                {expandedBackup === backup.folder && (
                  <div className="border-t border-[#2d333b] bg-[#0d1117] p-4">
                    {detailLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 size={20} className="animate-spin text-[#8b949e]" />
                      </div>
                    ) : backupDetail ? (
                      <BackupTree tree={backupDetail.tree} />
                    ) : (
                      <p className="text-sm text-[#484f58]">No details available</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const BackupTree = ({ tree }: { tree: BackupTreeNode[] }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  if (!tree || tree.length === 0) return <p className="text-sm text-[#484f58]">Empty backup</p>;

  return (
    <div data-testid="backup-tree" className="space-y-2 text-sm">
      {tree.map((course: BackupTreeNode) => (
        <div key={course.slug}>
          <button onClick={() => toggle(course.slug)} className="flex items-center gap-2 w-full text-left py-1.5 px-2 rounded hover:bg-[#161b22] transition-colors">
            {expanded[course.slug] ? <ChevronDown size={14} className="text-[#8b949e]" /> : <ChevronRight size={14} className="text-[#8b949e]" />}
            <BookOpen size={14} className="text-[#3b82f6]" />
            <span className="text-[#c9d1d9] font-medium">{course.title}</span>
            <span className="text-xs text-[#484f58] ml-2">{course.sections?.length || 0} sections</span>
          </button>
          {expanded[course.slug] && course.sections?.map((sec: BackupTreeNode['sections'][number]) => (
            <div key={sec.slug} className="ml-6">
              <button onClick={() => toggle(`${course.slug}/${sec.slug}`)} className="flex items-center gap-2 w-full text-left py-1 px-2 rounded hover:bg-[#161b22] transition-colors">
                {expanded[`${course.slug}/${sec.slug}`] ? <ChevronDown size={12} className="text-[#8b949e]" /> : <ChevronRight size={12} className="text-[#8b949e]" />}
                <Layers size={12} className="text-[#8b5cf6]" />
                <span className="text-[#8b949e]">{sec.title}</span>
                <span className="text-xs text-[#484f58] ml-2">{sec.lessons?.length || 0} lessons</span>
              </button>
              {expanded[`${course.slug}/${sec.slug}`] && sec.lessons?.map((lesson: { file: string; title: string; has_content: boolean; blocks?: number }) => (
                <div key={lesson.file} className="ml-8 flex items-center gap-2 py-1 px-2 text-xs">
                  {lesson.has_content ? (
                    <CheckCircle size={12} className="text-[#22c55e]" />
                  ) : (
                    <FileText size={12} className="text-[#484f58]" />
                  )}
                  <span className={lesson.has_content ? 'text-[#c9d1d9]' : 'text-[#484f58]'}>
                    {lesson.title}
                  </span>
                  {lesson.has_content && (
                    <span className="text-[#22c55e]/60">{lesson.blocks} blocks</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default BackupRestore;
