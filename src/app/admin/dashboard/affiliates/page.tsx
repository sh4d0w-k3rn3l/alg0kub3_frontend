'use client';
import dynamic from 'next/dynamic';

const AffiliateAdmin = dynamic(() => import('@/components/admin/AffiliateAdmin'), { ssr: false });

export default function Page() {
  return <AffiliateAdmin />;
}
