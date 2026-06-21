'use client';

import { useCallback, useEffect, useRef } from 'react';
import { api, type ApiOptions } from '@/lib/api';

interface UseApiReturn {
  get: <T>(endpoint: string, options?: ApiOptions) => Promise<T>;
  post: <T>(endpoint: string, body?: unknown, options?: ApiOptions) => Promise<T>;
  put: <T>(endpoint: string, body?: unknown, options?: ApiOptions) => Promise<T>;
  patch: <T>(endpoint: string, body?: unknown, options?: ApiOptions) => Promise<T>;
  delete: <T>(endpoint: string, options?: ApiOptions) => Promise<T>;
}

export function useApi(): UseApiReturn {
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const withSignal = useCallback(<T>(
    fn: (endpoint: string, options?: ApiOptions) => Promise<{ data: T; status: number; ok: boolean }>,
    endpoint: string,
    options?: ApiOptions,
  ): Promise<T> => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    return fn(endpoint, { ...options, signal: abortRef.current.signal }).then(r => r.data);
  }, []);

  const get = useCallback(<T>(endpoint: string, options?: ApiOptions) =>
    withSignal<T>(api.get, endpoint, options), [withSignal]);

  const post = useCallback(<T>(endpoint: string, body?: unknown, options?: ApiOptions) =>
    withSignal<T>((ep, opts) => api.post<T>(ep, body, opts), endpoint, options), [withSignal]);

  const put = useCallback(<T>(endpoint: string, body?: unknown, options?: ApiOptions) =>
    withSignal<T>((ep, opts) => api.put<T>(ep, body, opts), endpoint, options), [withSignal]);

  const patch = useCallback(<T>(endpoint: string, body?: unknown, options?: ApiOptions) =>
    withSignal<T>((ep, opts) => api.patch<T>(ep, body, opts), endpoint, options), [withSignal]);

  const del = useCallback(<T>(endpoint: string, options?: ApiOptions) =>
    withSignal<T>(api.delete, endpoint, options), [withSignal]);

  return { get, post, put, patch, delete: del };
}
