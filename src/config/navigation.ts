import type { NavigationConfig, FooterConfig } from '@/types';
import { api } from '@/lib/api';

const _cache: Record<string, NavigationConfig | FooterConfig | null> = { header: null, footer: null };
const _promises: Record<string, Promise<NavigationConfig | FooterConfig> | null> = { header: null, footer: null };
const CACHE_TTL_MS = 5 * 60 * 1000;
const _expires: Record<string, number> = { header: 0, footer: 0 };

export const HEADER_FALLBACK: NavigationConfig = {
  primary_links: [
    { id: 'pl-aieng',      label: 'AI Eng',     path: '/ai-engineering-for-beginners', is_new: true,  visible: true, order: 0 },
    { id: 'pl-playground', label: 'Playground', path: '/playground',                    is_new: false, visible: true, order: 1 },
    { id: 'pl-pricing',    label: 'Pricing',    path: '/pricing',                       is_new: false, visible: true, order: 2 },
  ],
  practice_items: [
    { id: 'pr-dsa', label: 'DSA Patterns',               desc: 'Practice data structures & algorithms', icon: 'Code',   path: '/practice/dsa',  is_new: false, visible: true, order: 0 },
    { id: 'pr-sd',  label: 'System Design Interview',    desc: '15 sections, 85 problems',              icon: 'Server', path: '/system-design', is_new: false, visible: true, order: 1 },
    { id: 'pr-lld', label: 'Low-Level Design Interview', desc: 'Practice object-oriented design',       icon: 'Braces', path: '/practice/lld',  is_new: true,  visible: true, order: 2 },
  ],
  more_items: [
    { id: 'm-anim',      label: 'DSA Animations', desc: 'Visualise sorting, graph & DP algorithms', path: '/animations/dsa',  visible: true, order: 0 },
    { id: 'm-aicurr',    label: 'AI Curriculum',  desc: 'End-to-end AI learning path',              path: '/ai-curriculum',   visible: true, order: 1 },
    { id: 'm-leader',    label: 'Leaderboard',    desc: 'Top learners this week',                   path: '/leaderboard',     visible: true, order: 2 },
    { id: 'm-affiliate', label: 'Affiliate',      desc: 'Earn 30% lifetime commission',             path: '/affiliate',       visible: true, order: 3 },
  ],
};

export const FOOTER_FALLBACK: FooterConfig = {
  tagline: 'Production-grade courses for developers who learn by doing.',
  sections: [
    { id: 'sec-courses',  title: 'Courses',  visible: true, order: 0, dynamic_courses: true,  dynamic_courses_limit: 8, links: [] },
    { id: 'sec-platform', title: 'Platform', visible: true, order: 1, dynamic_courses: false, links: [
      { id: 'pf-paths',     label: 'Learning Paths', path: '/#learning-paths', external: false, visible: true, order: 0 },
      { id: 'pf-pricing',   label: 'Pricing',        path: '/pricing',         external: false, visible: true, order: 1 },
      { id: 'pf-dashboard', label: 'Dashboard',      path: '/dashboard',       external: false, visible: true, order: 2 },
    ] },
    { id: 'sec-features', title: 'Features', visible: true, order: 2, dynamic_courses: false, links: [
      { id: 'ft-run',    label: 'Code Execution',    path: '', external: false, visible: true, order: 0 },
      { id: 'ft-tutor',  label: 'AI Tutoring',       path: '', external: false, visible: true, order: 1 },
      { id: 'ft-track',  label: 'Progress Tracking', path: '', external: false, visible: true, order: 2 },
      { id: 'ft-read',   label: 'Reading Settings',  path: '', external: false, visible: true, order: 3 },
      { id: 'ft-search', label: 'Search',            path: '', external: false, visible: true, order: 4 },
    ] },
  ],
  legal_links: [
    { id: 'lg-shipping', label: 'Shipping Policy',  path: '/policies/shipping-policy', visible: true, order: 0 },
    { id: 'lg-privacy',  label: 'Privacy Policy',   path: '/policies/privacy-policy',  visible: true, order: 1 },
    { id: 'lg-refund',   label: 'Refund Policy',    path: '/policies/refund-policy',   visible: true, order: 2 },
    { id: 'lg-terms',    label: 'Terms of Service', path: '/policies/terms-of-service', visible: true, order: 3 },
  ],
  social_links: [
    { id: 'so-github', icon: 'ExternalLink', url: 'https://github.com',      aria_label: 'GitHub',   visible: true, order: 0 },
    { id: 'so-email',  icon: 'Mail',         url: 'mailto:hello@algokube.dev', aria_label: 'Email us', visible: true, order: 1 },
  ],
  copyright: '\u00a9 {year} AlgoKube. All rights reserved.',
};

export function fetchNavigation(area: 'header' | 'footer'): Promise<NavigationConfig | FooterConfig> {
  const now = Date.now();
  if (_cache[area] && now < _expires[area]) return Promise.resolve(_cache[area]!);
  if (_promises[area]) return _promises[area]!;
  _promises[area] = api.get(`/navigation/${area}`)
    .then((res) => {
      _cache[area] = (res.data as Record<string, unknown>)?.config as NavigationConfig | FooterConfig || (area === 'header' ? HEADER_FALLBACK : FOOTER_FALLBACK);
      _expires[area] = Date.now() + CACHE_TTL_MS;
      return _cache[area]!;
    })
    .catch(() => {
      _cache[area] = area === 'header' ? HEADER_FALLBACK : FOOTER_FALLBACK;
      _expires[area] = Date.now() + CACHE_TTL_MS;
      return _cache[area]!;
    })
    .finally(() => { _promises[area] = null; });
  return _promises[area]!;
}

export function invalidateNavCache(area?: string): void {
  if (area) { _cache[area as keyof typeof _cache] = null; _expires[area as keyof typeof _expires] = 0; }
  else { _cache.header = _cache.footer = null; _expires.header = _expires.footer = 0; }
}

export function visible<T extends { visible?: boolean; order?: number }>(list?: T[]): T[] {
  return (list || []).filter(i => i.visible !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
}
