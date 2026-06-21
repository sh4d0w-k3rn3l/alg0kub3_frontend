'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Terminal, ArrowRight, Mail, ExternalLink, Github, Twitter, Linkedin, Youtube } from 'lucide-react';
import { fetchNavigation, FOOTER_FALLBACK, visible } from '@/config/navigation';

interface FooterTokens {
  bg: string;
  surface: string;
  surfaceHi: string;
  border: string;
  borderSubtle: string;
  text: string;
  textSec: string;
  textMut: string;
  primary: string;
  glow: string;
}

interface FooterLink {
  id: string;
  label: string;
  path?: string;
  external?: boolean;
  visible?: boolean;
  order?: number;
}

interface SocialLink {
  id: string;
  icon: string;
  url: string;
  aria_label?: string;
  visible?: boolean;
  order?: number;
}

interface FooterSection {
  id: string;
  title?: string;
  links?: FooterLink[];
  dynamic_courses?: boolean;
  dynamic_courses_limit?: number;
  visible?: boolean;
  order?: number;
}

interface FooterConfig {
  tagline?: string;
  copyright?: string;
  sections?: FooterSection[];
  legal_links?: FooterLink[];
  social_links?: SocialLink[];
}

interface Course {
  slug: string;
  title: string;
  lesson_count: number;
}

interface SiteFooterProps {
  t: FooterTokens;
  isDark: boolean;
  courses?: Course[];
}

const ICONS: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = { ExternalLink, Mail, Github, Twitter, Linkedin, Youtube };

const SiteFooter = ({ t, isDark, courses = [] }: SiteFooterProps) => {
  const router = useRouter();
  const [cfg, setCfg] = useState<FooterConfig>(FOOTER_FALLBACK as FooterConfig);

  useEffect(() => {
    const ac = new AbortController();
    fetchNavigation('footer').then(c => {
      if (!ac.signal.aborted) setCfg(c as FooterConfig);
    });
    return () => ac.abort();
  }, []);

  const handleLink = (link: FooterLink) => {
    if (link.external || /^https?:|^mailto:/.test(link.path || '')) {
      window.open(link.path, '_blank', 'noopener');
    } else if (link.path) {
      router.push(link.path);
    }
  };

  const sections = visible(cfg.sections);
  const legal = visible(cfg.legal_links);
  const socials = visible(cfg.social_links);

  return (
    <footer className="border-t" style={{ borderColor: t.borderSubtle, backgroundColor: isDark ? '#020202' : t.surface }} data-testid="site-footer">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 pt-16 pb-8">
        <div className={`grid grid-cols-2 md:grid-cols-${Math.min(4, sections.length + 1)} gap-12 mb-12`}>
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: t.primary }}>
                <Terminal size={14} className="text-white" />
              </div>
              <span className="text-sm font-extrabold tracking-tight" style={{ color: t.text }}>
                Algo<span style={{ color: t.primary }}>Kube</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed max-w-[200px]" style={{ color: t.textMut }}>
              {cfg.tagline || FOOTER_FALLBACK.tagline}
            </p>
          </div>

          {sections.map((sec: FooterSection) => (
            <div key={sec.id}>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] mb-4" style={{ color: t.textSec, fontFamily: 'JetBrains Mono, monospace' }}>
                {sec.title}
              </h3>
              <div className="space-y-2.5">
                {sec.dynamic_courses && courses
                  .filter(c => c.lesson_count > 0)
                  .slice(0, sec.dynamic_courses_limit || 8)
                  .map(c => (
                    <button key={c.slug} onClick={() => router.push(`/course/${c.slug}`)}
                      className="block text-xs transition-colors" style={{ color: t.textMut }}
                      onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = t.primary; }}
                      onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = t.textMut; }}>
                      {c.title}
                    </button>
                  ))}
                {visible(sec.links || []).map((link: FooterLink) => (
                  link.path ? (
                    <button key={link.id} onClick={() => handleLink(link)}
                      className="block text-xs transition-colors text-left" style={{ color: t.textMut }}
                      onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = t.primary; }}
                      onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = t.textMut; }}>
                      {link.label}
                    </button>
                  ) : (
                    <span key={link.id} className="block text-xs" style={{ color: t.textMut }}>{link.label}</span>
                  )
                ))}
                {sec.dynamic_courses && (
                  <button
                    data-testid="footer-view-all-courses"
                    onClick={() => router.push('/courses')}
                    className="flex items-center gap-1 text-xs font-semibold transition-colors pt-1"
                    style={{ color: t.primary }}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.opacity = '0.8'; }}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.opacity = '1'; }}>
                    View All <ArrowRight size={10} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderColor: t.borderSubtle }}>
          <span className="text-[11px]" style={{ color: t.textMut, fontFamily: 'JetBrains Mono, monospace' }}>
            {(cfg.copyright || FOOTER_FALLBACK.copyright || '').replace('{year}', String(new Date().getFullYear()))}
          </span>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {legal.map((lk: FooterLink) => (
              <button
                key={lk.id}
                data-testid={`footer-${(lk.path || '').split('/').pop()}`}
                onClick={() => lk.path && router.push(lk.path)}
                className="text-[11px] transition-colors whitespace-nowrap"
                style={{ color: t.textMut }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = t.primary; }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = t.textMut; }}>
                {lk.label}
              </button>
            ))}
            {socials.length > 0 && <span className="text-[#2d333b]">|</span>}
            {socials.map((so: SocialLink) => {
              const Icon = ICONS[so.icon] || ExternalLink;
              const isMail = (so.url || '').startsWith('mailto:');
              return (
                <a key={so.id}
                  href={so.url}
                  target={isMail ? undefined : '_blank'}
                  rel={isMail ? undefined : 'noopener noreferrer'}
                  aria-label={so.aria_label}
                  style={{ color: t.textMut }}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = t.text; }}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = t.textMut; }}>
                  <Icon size={13} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
