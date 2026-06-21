'use client';
import React, { useEffect, useState } from 'react';

import { api } from '@/lib/api';
import { X, Info, AlertTriangle, CheckCircle, Bell } from 'lucide-react';

interface Announcement {
  id: string;
  type: string;
  title: string;
  message: string;
  dismissible: boolean;
}

const TYPE_CONFIG: Record<string, { icon: React.FC<{ size?: number }>; bg: string; bgLight: string; border: string }> = {
  info: { icon: Info, bg: '#3b82f6', bgLight: '#3b82f610', border: '#3b82f630' },
  warning: { icon: AlertTriangle, bg: '#f59e0b', bgLight: '#f59e0b10', border: '#f59e0b30' },
  success: { icon: CheckCircle, bg: '#22c55e', bgLight: '#22c55e10', border: '#22c55e30' },
  urgent: { icon: Bell, bg: '#ef4444', bgLight: '#ef444415', border: '#ef444440' },
};

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const ac = new AbortController();
    api.get<{ announcements: Announcement[] }>('/announcements/active', { signal: ac.signal })
      .then(res => {
        if (ac.signal.aborted) return;
        setAnnouncements(res.data.announcements || []);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
      });
    return () => ac.abort();
  }, []);

  const dismiss = async (annId: string) => {
    setDismissed(prev => new Set([...prev, annId]));
    try {
      await api.post(`/announcements/${annId}/dismiss`);
    } catch {
      // silent
    }
  };

  const visible = announcements.filter(a => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  return (
    <div data-testid="announcement-banner-container" className="w-full">
      {visible.map(ann => {
        const cfg = TYPE_CONFIG[ann.type] || TYPE_CONFIG.info;
        const Icon = cfg.icon;
        return (
          <div
            key={ann.id}
            data-testid={`announcement-${ann.id}`}
            className="flex items-center gap-3 px-4 py-2.5 border-b"
            style={{ backgroundColor: cfg.bgLight, borderColor: cfg.border }}
          >
            <span style={{ color: cfg.bg, flexShrink: 0 }}><Icon size={16} /></span>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium mr-2" style={{ color: cfg.bg }}>{ann.title}</span>
              <span className="text-sm text-[#c9d1d9]">{ann.message}</span>
            </div>
            {ann.dismissible && (
              <button
                data-testid={`dismiss-announcement-${ann.id}`}
                onClick={() => dismiss(ann.id)}
                className="text-[#484f58] hover:text-[#c9d1d9] transition-colors p-1 shrink-0"
              >
                <X size={14} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AnnouncementBanner;
