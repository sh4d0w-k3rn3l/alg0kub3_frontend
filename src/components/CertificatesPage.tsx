'use client';

import React, { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Award, Download, Share2, CheckCircle, XCircle, Loader2, FileText, Image as ImageIcon, ExternalLink, ShieldCheck, Linkedin } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { showError } from '@/lib/toast';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/PageHeader';

const buildShareUrls = (verificationId: string, userName: string, courseTitle: string) => {
  const certUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/certificate/${verificationId}`;
  const text = `I just earned my ${courseTitle} certificate on AlgoKube!`;
  return {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certUrl)}`,
    twitter: `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(certUrl)}`,
    certUrl,
  };
};

const XIcon: FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface CertificateData {
  user_name: string;
  course_title: string;
  total_lessons: number;
  total_quizzes: number;
  issue_date: string;
  verification_id: string;
}

export const CertificateVerifyPage: FC = () => {
  const params = useParams();
  const verificationId = (params?.verificationId as string) || '';
  const { colors } = useTheme();
  const [cert, setCert] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    const fetchCert = async () => {
      try {
        const res = await api.get<CertificateData>(`/certificates/verify/${verificationId}`, { signal: ac.signal });
        if (ac.signal.aborted) return;
        setCert(res.data);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCert();
    return () => ac.abort();
  }, [verificationId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
      <Loader2 className="animate-spin" size={32} style={{ color: colors.green }} />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
      <div className="text-center max-w-md">
        <XCircle size={48} className="mx-auto mb-4 text-red-400" />
        <h1 className="text-xl font-bold mb-2" style={{ color: colors.text }}>Certificate Not Found</h1>
        <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
          The verification ID &quot;{verificationId}&quot; does not match any issued certificate.
        </p>
        <Link href="/" className="text-sm font-medium" style={{ color: colors.green }}>Go to AlgoKube</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      <PageHeader />
      <div className="py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ backgroundColor: colors.green + '15', border: `1px solid ${colors.green}40` }}>
            <ShieldCheck size={18} style={{ color: colors.green }} />
            <span className="text-sm font-semibold" style={{ color: colors.green }}>Verified Certificate</span>
          </div>
        </div>

        <div data-testid="certificate-verify-card" className="rounded-xl overflow-hidden" style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgCard }}>
          <div className="p-8 text-center" style={{ background: `linear-gradient(135deg, #0d1117, #161b22)`, borderBottom: `1px solid ${colors.border}` }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ border: `2px solid #d4a843`, backgroundColor: '#d4a84315' }}>
              <Award size={28} style={{ color: '#d4a843' }} />
            </div>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#d4a843' }}>Certificate of Completion</p>
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#ffffff' }}>{(cert as CertificateData).user_name}</h1>
            <p className="text-sm" style={{ color: '#8b949e' }}>has successfully completed</p>
            <h2 className="text-xl font-bold mt-2" style={{ color: '#22c55e' }}>{(cert as CertificateData).course_title}</h2>
          </div>

          <div className="p-6 grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: colors.bgTertiary }}>
              <p className="text-xl font-bold" style={{ color: colors.text }}>{(cert as CertificateData).total_lessons}</p>
              <p className="text-xs" style={{ color: colors.textSecondary }}>Lessons Completed</p>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: colors.bgTertiary }}>
              <p className="text-xl font-bold" style={{ color: colors.text }}>{(cert as CertificateData).total_quizzes}</p>
              <p className="text-xs" style={{ color: colors.textSecondary }}>Quizzes Passed</p>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs" style={{ color: colors.textSecondary }}>Issued: {(cert as CertificateData).issue_date}</p>
                <p className="text-xs font-mono" style={{ color: colors.textMuted }}>ID: {(cert as CertificateData).verification_id}</p>
              </div>
              <div className="flex gap-2">
                <a href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/certificates/download/${(cert as CertificateData).verification_id}/pdf`} data-testid="cert-download-pdf" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors" style={{ backgroundColor: colors.green, color: '#fff' }}>
                  <FileText size={12} /> PDF
                </a>
                <a href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/certificates/download/${(cert as CertificateData).verification_id}/png`} data-testid="cert-download-png" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors" style={{ borderColor: colors.border, color: colors.text }}>
                  <ImageIcon size={12} /> PNG
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3" style={{ borderTop: `1px solid ${colors.border}` }}>
              <span className="text-xs font-medium mr-1" style={{ color: colors.textSecondary }}>Share:</span>
              <a href={buildShareUrls((cert as CertificateData).verification_id, (cert as CertificateData).user_name, (cert as CertificateData).course_title).linkedin} target="_blank" rel="noopener noreferrer" data-testid="cert-share-linkedin" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-90" style={{ backgroundColor: '#0a66c2', color: '#fff' }}>
                <Linkedin size={13} /> LinkedIn
              </a>
              <a href={buildShareUrls((cert as CertificateData).verification_id, (cert as CertificateData).user_name, (cert as CertificateData).course_title).twitter} target="_blank" rel="noopener noreferrer" data-testid="cert-share-twitter" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-90" style={{ backgroundColor: '#000', color: '#fff' }}>
                <XIcon size={13} /> Post
              </a>
              <button onClick={() => { navigator.clipboard.writeText(buildShareUrls((cert as CertificateData).verification_id, (cert as CertificateData).user_name, (cert as CertificateData).course_title).certUrl); }} data-testid="cert-copy-link" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors hover:opacity-80" style={{ borderColor: colors.border, color: colors.textSecondary }}>
                <ExternalLink size={12} /> Copy Link
              </button>
            </div>
          </div>
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: colors.textMuted }}>
          Issued by <Link href="/" className="underline" style={{ color: colors.green }}>AlgoKube</Link> Learning Platform
        </p>
      </div>
      </div>
    </div>
  );
};

interface CompletionData {
  total_lessons: number;
  total_quizzes: number;
  lessons_done: number;
  quizzes_passed: number;
}

interface CourseCertificateData {
  eligible: boolean;
  completion: CompletionData;
  existing_certificate: {
    verification_id: string;
    issued_at: string;
  } | null;
}

interface CourseCertificateSectionProps {
  courseSlug: string;
}

export const CourseCertificateSection: FC<CourseCertificateSectionProps> = ({ courseSlug }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [data, setData] = useState<CourseCertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);

  const sessionToken = user?.session_token;

  useEffect(() => {
    if (!sessionToken || !courseSlug || !user) return;
    const ac = new AbortController();
    const check = async () => {
      try {
        const res = await api.get<CourseCertificateData>(`/certificates/check/${courseSlug}`, {
          headers: { Authorization: `Bearer ${sessionToken}` },
          signal: ac.signal,
        });
        if (ac.signal.aborted) return;
        setData(res.data);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    check();
    return () => ac.abort();
  }, [courseSlug, user, sessionToken]);

  const handleIssue = async () => {
    setIssuing(true);
    try {
      const res = await api.post<{ verification_id: string; issued_at: string }>(`/certificates/issue/${courseSlug}`, {}, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      setData(prev => ({
        ...prev!,
        existing_certificate: {
          verification_id: res.data.verification_id,
          issued_at: res.data.issued_at,
        },
      }));
    } catch (err) {
      showError(err instanceof ApiError ? err.detail : (err as Error)?.message || 'Failed to issue certificate');
    } finally {
      setIssuing(false);
    }
  };

  if (loading || !data) return null;
  if (!sessionToken) return null;

  const { eligible, completion, existing_certificate } = data;

  if (existing_certificate) {
    return (
      <div data-testid="certificate-issued" className="rounded-xl p-5 mt-6" style={{ border: `1px solid #d4a84340`, backgroundColor: '#d4a84308' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ border: '2px solid #d4a843', backgroundColor: '#d4a84315' }}>
            <Award size={18} style={{ color: '#d4a843' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: colors.text }}>Certificate Earned!</h3>
            <p className="text-xs" style={{ color: colors.textSecondary }}>ID: {existing_certificate.verification_id}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/certificates/download/${existing_certificate.verification_id}/pdf`} data-testid="cert-download-pdf-btn" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium" style={{ backgroundColor: colors.green, color: '#fff' }}>
            <Download size={12} /> Download PDF
          </a>
          <a href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/certificates/download/${existing_certificate.verification_id}/png`} data-testid="cert-download-png-btn" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border" style={{ borderColor: colors.border, color: colors.text }}>
            <ImageIcon size={12} /> Download PNG
          </a>
          <Link href={`/certificate/${existing_certificate.verification_id}`} data-testid="cert-view-btn" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border" style={{ borderColor: colors.border, color: colors.text }}>
            <ExternalLink size={12} /> View & Share
          </Link>
          <a href={buildShareUrls(existing_certificate.verification_id, user?.name || '', '').linkedin} target="_blank" rel="noopener noreferrer" data-testid="cert-share-linkedin-btn" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-90" style={{ backgroundColor: '#0a66c2', color: '#fff' }}>
            <Linkedin size={12} /> LinkedIn
          </a>
          <a href={buildShareUrls(existing_certificate.verification_id, user?.name || '', '').twitter} target="_blank" rel="noopener noreferrer" data-testid="cert-share-twitter-btn" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-90" style={{ backgroundColor: '#000', color: '#fff' }}>
            <XIcon size={12} /> Post
          </a>
        </div>
      </div>
    );
  }

  if (eligible) {
    return (
      <div data-testid="certificate-eligible" className="rounded-xl p-5 mt-6" style={{ border: `1px solid ${colors.green}40`, backgroundColor: colors.green + '08' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.green + '20' }}>
            <Award size={18} style={{ color: colors.green }} />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: colors.text }}>Course Completed! Claim Your Certificate</h3>
            <p className="text-xs" style={{ color: colors.textSecondary }}>All {completion.total_lessons} lessons and {completion.total_quizzes} quizzes completed</p>
          </div>
        </div>
        <button data-testid="claim-certificate-btn" onClick={handleIssue} disabled={issuing} className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: colors.green }}>
          {issuing ? <Loader2 size={14} className="animate-spin" /> : <Award size={14} />}
          {issuing ? 'Issuing...' : 'Claim Certificate'}
        </button>
      </div>
    );
  }

  return (
    <div data-testid="certificate-progress" className="rounded-xl p-5 mt-6" style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgCard }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.bgTertiary }}>
          <Award size={18} style={{ color: colors.textMuted }} />
        </div>
        <div>
          <h3 className="text-sm font-bold" style={{ color: colors.text }}>Earn a Certificate</h3>
          <p className="text-xs" style={{ color: colors.textSecondary }}>Complete all lessons and pass all quizzes</p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5" style={{ color: completion.lessons_done >= completion.total_lessons ? colors.green : colors.textSecondary }}>
            {completion.lessons_done >= completion.total_lessons ? <CheckCircle size={12} /> : <span className="w-3 h-3 rounded-full border" style={{ borderColor: colors.border }} />}
            Lessons: {completion.lessons_done}/{completion.total_lessons}
          </span>
          <span className="font-mono" style={{ color: colors.textMuted }}>{completion.total_lessons > 0 ? Math.round(completion.lessons_done / completion.total_lessons * 100) : 0}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.bgTertiary }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${completion.total_lessons > 0 ? (completion.lessons_done / completion.total_lessons * 100) : 0}%`, backgroundColor: colors.green }} />
        </div>
        <div className="flex items-center justify-between text-xs mt-2">
          <span className="flex items-center gap-1.5" style={{ color: completion.quizzes_passed >= completion.total_quizzes ? colors.green : colors.textSecondary }}>
            {completion.quizzes_passed >= completion.total_quizzes && completion.total_quizzes > 0 ? <CheckCircle size={12} /> : <span className="w-3 h-3 rounded-full border" style={{ borderColor: colors.border }} />}
            Quizzes Passed: {completion.quizzes_passed}/{completion.total_quizzes}
          </span>
          <span className="font-mono" style={{ color: colors.textMuted }}>{completion.total_quizzes > 0 ? Math.round(completion.quizzes_passed / completion.total_quizzes * 100) : 0}%</span>
        </div>
        {completion.total_quizzes > 0 && (
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.bgTertiary }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${(completion.quizzes_passed / completion.total_quizzes * 100)}%`, backgroundColor: colors.green }} />
          </div>
        )}
      </div>
    </div>
  );
};

interface CertItem {
  id: string;
  verification_id: string;
  course_title: string;
  total_lessons: number;
  total_quizzes: number;
  issue_date: string;
  user_name: string;
}

const CertificatesPage: FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [certs, setCerts] = useState<CertItem[]>([]);
  const [loading, setLoading] = useState(true);

  const sessionToken = user?.session_token;

  useEffect(() => {
    if (!sessionToken || !user) return;
    const ac = new AbortController();
    const fetchCerts = async () => {
      try {
        const res = await api.get<{ certificates: CertItem[] }>('/certificates/user', {
          headers: { Authorization: `Bearer ${sessionToken}` },
          signal: ac.signal,
        });
        if (ac.signal.aborted) return;
        setCerts(res.data.certificates || []);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setCerts([]);
      }
      finally { setLoading(false); }
    };
    fetchCerts();
    return () => ac.abort();
  }, [user, sessionToken]);

  if (loading && sessionToken) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
      <Loader2 className="animate-spin" size={32} style={{ color: colors.green }} />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      <PageHeader />
      <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>My Certificates</h1>
        </div>

        {certs.length === 0 ? (
          <div className="text-center py-16 rounded-xl" style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}>
            <Award size={48} className="mx-auto mb-4" style={{ color: colors.textMuted }} />
            <h2 className="text-lg font-bold mb-2" style={{ color: colors.text }}>No Certificates Yet</h2>
            <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>Complete all lessons and pass all quizzes in a course to earn a certificate.</p>
            <Link href="/courses" className="text-sm font-medium" style={{ color: colors.green }}>Browse Courses</Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {certs.map(cert => (
              <div key={cert.id} data-testid={`cert-card-${(cert as CertificateData).verification_id}`} className="rounded-xl p-5 flex items-center justify-between" style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgCard }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ border: '2px solid #d4a843', backgroundColor: '#d4a84315' }}>
                    <Award size={20} style={{ color: '#d4a843' }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold" style={{ color: colors.text }}>{cert.course_title}</h3>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>
                      {(cert as CertificateData).total_lessons} lessons | {(cert as CertificateData).total_quizzes} quizzes | Issued {(cert as CertificateData).issue_date}
                    </p>
                    <p className="text-[10px] font-mono" style={{ color: colors.textMuted }}>ID: {(cert as CertificateData).verification_id}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <a href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/certificates/download/${(cert as CertificateData).verification_id}/pdf`} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium" style={{ backgroundColor: colors.green, color: '#fff' }}>
                    <Download size={12} /> PDF
                  </a>
                  <a href={buildShareUrls(cert.verification_id, cert.user_name, cert.course_title).linkedin} target="_blank" rel="noopener noreferrer" data-testid={`cert-linkedin-${(cert as CertificateData).verification_id}`} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-90" style={{ backgroundColor: '#0a66c2', color: '#fff' }}>
                    <Linkedin size={12} />
                  </a>
                  <a href={buildShareUrls(cert.verification_id, cert.user_name, cert.course_title).twitter} target="_blank" rel="noopener noreferrer" data-testid={`cert-twitter-${(cert as CertificateData).verification_id}`} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-90" style={{ backgroundColor: '#000', color: '#fff' }}>
                    <XIcon size={12} />
                  </a>
                  <Link href={`/certificate/${(cert as CertificateData).verification_id}`} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium border" style={{ borderColor: colors.border, color: colors.text }}>
                    <Share2 size={12} /> View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default CertificatesPage;
