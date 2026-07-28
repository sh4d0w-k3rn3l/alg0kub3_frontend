'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { posthog, isEnabled } from '@/lib/posthog';

export function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPath = useRef<string>('');

  useEffect(() => {
    if (!isEnabled) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    if (url === prevPath.current) return;
    prevPath.current = url;

    posthog.capture('$pageview', {
      $current_url: url,
      $pathname: pathname,
    });
  }, [pathname, searchParams]);

  return null;
}
