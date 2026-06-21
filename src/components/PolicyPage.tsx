'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { Terminal, ArrowLeft, Loader2, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import SEO from './SEO';
import PageHeader from './PageHeader';

interface Policy {
  title: string;
  last_updated: string;
  sections: PolicySection[];
}

interface PolicySection {
  heading: string;
  body?: string;
  bullets?: string[];
}

interface DesignTokens {
  bg: string; surface: string; surfaceHi: string;
  border: string; borderSubtle: string;
  text: string; textSec: string; textMut: string;
  primary: string;
}

const dk: DesignTokens = {
  bg: '#050505', surface: '#0a0a0a', surfaceHi: '#121212',
  border: '#27272a', borderSubtle: '#18181b',
  text: '#ffffff', textSec: '#a1a1aa', textMut: '#8c8c96',
  primary: '#22c55e',
};
const lt: DesignTokens = {
  bg: '#ffffff', surface: '#fafafa', surfaceHi: '#f4f4f5',
  border: '#e4e4e7', borderSubtle: '#f4f4f5',
  text: '#09090b', textSec: '#52525b', textMut: '#a1a1aa',
  primary: '#16a34a',
};

const PolicyPage = () => {
  const params = useParams();
  const slug = (params?.slug as string) || '';
  const { isDark } = useTheme();
  const t = isDark ? dk : lt;
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const ac = new AbortController();
    api.get<Policy>(`/policies/${slug}`, { signal: ac.signal })
      .then(res => {
        if (ac.signal.aborted) return;
        setPolicy(res.data);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(true);
      })
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: t.bg }}>
        <Loader2 size={28} className="animate-spin" style={{ color: t.primary }} />
      </div>
    );
  }

  if (error || !policy) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: t.bg }}>
        <FileText size={40} style={{ color: t.textMut }} />
        <p style={{ color: t.textMut }}>Policy page not found.</p>
        <Link href="/" className="text-sm underline" style={{ color: t.primary }}>Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: t.bg }}>
      <SEO title={`${policy.title} - AlgoKube`} description={policy.title} />

      <PageHeader />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" data-testid="policy-back-link" className="inline-flex items-center gap-1.5 text-xs mb-8 transition-colors hover:underline" style={{ color: t.primary }}>
          <ArrowLeft size={12} /> Back to Home
        </Link>

        {policy.sections?.map((section, i) => (
          <section key={i} className="mb-10">
            <h2
              data-testid={`policy-heading-${i}`}
              className={i === 0 ? "text-3xl font-bold mb-4" : "text-xl font-semibold mb-3"}
              style={{ color: t.text }}
            >
              {section.heading}
            </h2>

            {section.body && (
              <p data-testid={`policy-body-${i}`} className="text-sm leading-relaxed mb-4" style={{ color: t.textSec }}>
                {section.body}
              </p>
            )}

            {(section.bullets?.length ?? 0) > 0 && (
              <ul className="space-y-2.5 ml-1">
                {section.bullets!.map((bullet, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: t.textSec }}>
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.primary }} />
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <div className="border-t pt-6 mt-12" style={{ borderColor: t.borderSubtle }}>
          <p className="text-xs" style={{ color: t.textMut }}>
            Last updated: {policy.last_updated}
          </p>
        </div>
      </main>

      <footer className="border-t" style={{ borderColor: t.borderSubtle, backgroundColor: isDark ? '#020202' : t.surface }}>
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
          <span className="text-[11px]" style={{ color: t.textMut }}>&copy; {new Date().getFullYear()} AlgoKube</span>
          <div className="flex items-center gap-4">
            {[
              { label: 'Shipping Policy', slug: 'shipping-policy' },
              { label: 'Privacy Policy', slug: 'privacy-policy' },
              { label: 'Refund Policy', slug: 'refund-policy' },
              { label: 'Terms of Service', slug: 'terms-of-service' },
            ].map(lk => (
              <Link
                key={lk.slug}
                href={`/policies/${lk.slug}`}
                data-testid={`footer-${lk.slug}`}
                className="text-[11px] transition-colors hover:underline"
                style={{ color: slug === lk.slug ? t.primary : t.textMut }}
              >
                {lk.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PolicyPage;
