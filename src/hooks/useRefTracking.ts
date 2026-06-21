'use client';

import { useEffect } from 'react';
import { api } from '@/lib/api';

const REF_COOKIE_KEY = 'algokube_ref';
const REF_COOKIE_DAYS = 30;

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getRefCode(): string {
  const match = document.cookie.match(new RegExp(`(?:^|; )${REF_COOKIE_KEY}=([^;]*)`));
  if (match) return match[1];
  return localStorage.getItem(REF_COOKIE_KEY) || '';
}

export function useRefTracking() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (!ref) return;

    setCookie(REF_COOKIE_KEY, ref, REF_COOKIE_DAYS);
    localStorage.setItem(REF_COOKIE_KEY, ref);

    api.post('/affiliate/track-click', {
      ref,
      referrer: document.referrer,
      page: window.location.pathname,
    }).catch(() => {});

    const url = new URL(window.location.href);
    url.searchParams.delete('ref');
    window.history.replaceState({}, '', url.toString());
  }, []);
}
