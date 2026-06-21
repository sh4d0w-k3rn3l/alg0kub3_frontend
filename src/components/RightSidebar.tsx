'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

interface TocItem {
  id: string;
  title: string;
}

interface RightSidebarProps {
  tocItems?: TocItem[];
  isMobileOverlay?: boolean;
}

const RightSidebar = ({ tocItems = [], isMobileOverlay = false }: RightSidebarProps) => {
  const { colors } = useTheme();
  const { isSubscribed } = useAuth();
  const router = useRouter();
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = document.getElementById('main-content');
      if (!scrollContainer) return;
      const scrollTop = scrollContainer.scrollTop;
      const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
      const progress = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
      setReadingProgress(Math.min(progress, 100));

      for (let i = tocItems.length - 1; i >= 0; i--) {
        const el = document.getElementById(tocItems[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200) {
            setActiveSection(tocItems[i].id);
            break;
          }
        }
      }
    };

    const scrollContainer = document.getElementById('main-content');
    if (scrollContainer) scrollContainer.addEventListener('scroll', handleScroll);
    return () => { if (scrollContainer) scrollContainer.removeEventListener('scroll', handleScroll); };
  }, [tocItems]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const ProCard = () => {
    if (isSubscribed) return null;
    return (
      <div className="border rounded-lg p-4 mb-6" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
        <div className="flex items-start gap-2 mb-2">
          <Zap size={16} style={{ color: colors.green }} className="mt-0.5" />
          <div>
            <h3 className="text-sm font-bold" style={{ color: colors.text }}>Upgrade to Pro</h3>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: colors.textSecondary }}>Unlock all 1000+ lessons across every course</p>
          </div>
        </div>
        <button
          data-testid="sidebar-subscribe-btn"
          onClick={() => router.push('/pricing')}
          className="w-full mt-3 text-white font-semibold py-2 rounded-md text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: colors.green }}
        >
          View Pricing
        </button>
      </div>
    );
  };

  const ProgressBar = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>Reading Progress</span>
        <span className="text-xs" style={{ color: colors.textSecondary }}>{readingProgress}%</span>
      </div>
      <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: colors.border }}>
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${readingProgress}%`, backgroundColor: colors.green }} />
      </div>
    </div>
  );

  const TOC = () => {
    if (tocItems.length === 0) return null;
    return (
      <div>
        <h4 className="text-xs font-medium mb-3" style={{ color: colors.textSecondary }}>On this page</h4>
        <nav className="space-y-1">
          {tocItems.map((item) => (
            <button key={item.id} onClick={() => scrollToSection(item.id)}
              className="block w-full text-left px-2 py-1.5 text-[13px] rounded transition-colors duration-150"
              style={{ color: activeSection === item.id ? colors.text : colors.textSecondary, backgroundColor: activeSection === item.id ? colors.hoverBg : 'transparent' }}>
              {item.title}
            </button>
          ))}
        </nav>
      </div>
    );
  };

  if (isMobileOverlay) {
    return (
      <div className="p-4">
        <ProCard />
        <ProgressBar />
        <TOC />
      </div>
    );
  }

  return (
    <aside className="fixed right-0 top-[52px] bottom-[48px] w-[280px] border-l overflow-y-auto custom-scrollbar" style={{ backgroundColor: colors.sidebarBg, borderColor: colors.borderLight }}>
      <div className="p-4">
        <ProCard />
        <ProgressBar />
        <TOC />
      </div>
    </aside>
  );
};

export default RightSidebar;
