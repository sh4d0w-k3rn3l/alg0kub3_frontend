'use client';

import { useCallback } from 'react';
import { api, type ApiOptions, type ApiError } from '@/lib/api';

export type { ApiOptions, ApiError };

interface UseApiFetcherReturn {
  get: <T>(endpoint: string, options?: ApiOptions) => Promise<T>;
  post: <T>(endpoint: string, body?: unknown, options?: ApiOptions) => Promise<T>;
  put: <T>(endpoint: string, body?: unknown, options?: ApiOptions) => Promise<T>;
  patch: <T>(endpoint: string, body?: unknown, options?: ApiOptions) => Promise<T>;
  delete: <T>(endpoint: string, options?: ApiOptions) => Promise<T>;
}

export function useApiFetcher(): UseApiFetcherReturn {
  const get = useCallback(async <T>(endpoint: string, options?: ApiOptions) => {
    const res = await api.get<T>(endpoint, options);
    return res.data;
  }, []);

  const post = useCallback(async <T>(endpoint: string, body?: unknown, options?: ApiOptions) => {
    const res = await api.post<T>(endpoint, body, options);
    return res.data;
  }, []);

  const put = useCallback(async <T>(endpoint: string, body?: unknown, options?: ApiOptions) => {
    const res = await api.put<T>(endpoint, body, options);
    return res.data;
  }, []);

  const patch = useCallback(async <T>(endpoint: string, body?: unknown, options?: ApiOptions) => {
    const res = await api.patch<T>(endpoint, body, options);
    return res.data;
  }, []);

  const del = useCallback(async <T>(endpoint: string, options?: ApiOptions) => {
    const res = await api.delete<T>(endpoint, options);
    return res.data;
  }, []);

  return { get, post, put, patch, delete: del };
}
