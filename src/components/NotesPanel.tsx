'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Save, Loader2, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';

interface NotesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  lessonSlug: string;
  lessonTitle: string;
  courseSlug: string;
}

const NotesPanel: React.FC<NotesPanelProps> = ({ isOpen, onClose, lessonSlug, lessonTitle, courseSlug }) => {
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!lessonSlug || !isOpen) return;
    const ac = new AbortController();
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const res = await api.get<{ notes: string }>(`/lessons/${lessonSlug}`, { params: { course: courseSlug }, signal: ac.signal });
        if (ac.signal.aborted) return;
        setNotes(res.data.notes || '');
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        handleApiError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
    return () => ac.abort();
  }, [lessonSlug, isOpen, courseSlug]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const autoSave = useCallback(async (text: string) => {
    if (!lessonSlug) return;
    setSaving(true);
    setSaved(false);
    try {
      await api.put(`/lessons/${lessonSlug}/notes`, { notes: text }, { params: { course: courseSlug } });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      handleApiError(err);
    } finally {
      setSaving(false);
    }
  }, [lessonSlug, courseSlug]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNotes(text);
    setSaved(false);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => autoSave(text), 1500);
  };

  const handleManualSave = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    autoSave(notes);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl mx-4 mb-[48px] rounded-t-xl border border-[#2d333b] border-b-0 overflow-hidden flex flex-col shadow-2xl"
        style={{ backgroundColor: '#0f1117', maxHeight: '60vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2533]" style={{ backgroundColor: '#161b22' }}>
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-[#f59e0b]" />
            <span className="text-white text-sm font-semibold">Notes</span>
            <span className="text-[#484f58] text-xs truncate max-w-[200px]">for {lessonTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            {saving && (
              <span className="flex items-center gap-1 text-[#8b949e] text-xs">
                <Loader2 size={12} className="animate-spin" />
                Saving...
              </span>
            )}
            {saved && (
              <span className="text-[#22c55e] text-xs">Saved!</span>
            )}
            <button
              onClick={handleManualSave}
              className="flex items-center gap-1 text-[#8b949e] hover:text-white text-xs transition-colors px-2 py-1 rounded hover:bg-[#1c2333]"
            >
              <Save size={12} />
              Save
            </button>
            <button onClick={onClose} className="text-[#8b949e] hover:text-white transition-colors p-1">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 size={24} className="text-[#22c55e] animate-spin" />
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={notes}
              onChange={handleChange}
              placeholder="Write your notes here... (auto-saves after 1.5s)"
              className="w-full h-full bg-[#0d1117] border border-[#2d333b] rounded-lg p-4 text-[#c9d1d9] text-sm leading-relaxed outline-none focus:border-[#22c55e] resize-none placeholder-[#484f58] font-mono"
              style={{ minHeight: '250px' }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesPanel;
