const API_BASE = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`;

function readCsrfToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail?: string) {
    super(detail || `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail || '';
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isValidationError(): boolean {
    return this.status === 422;
  }
}

export interface ApiOptions {
  params?: Record<string, string>;
  body?: unknown;
  headers?: Record<string, string>;
  skipCsrf?: boolean;
  cache?: RequestCache;
  next?: { revalidate?: number; tags?: string[] };
  signal?: AbortSignal;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  ok: boolean;
}

async function request<T>(
  endpoint: string,
  options: ApiOptions = {},
  method: string = 'GET',
): Promise<ApiResponse<T>> {
  const { params, body, headers, skipCsrf, cache, next, signal } = options;

  const url = new URL(`${API_BASE}${endpoint}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (!skipCsrf && !['GET', 'HEAD'].includes(method)) {
    const token = readCsrfToken();
    if (token) {
      reqHeaders['X-CSRF-Token'] = token;
    }
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method,
      headers: reqHeaders,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
      cache,
      next,
      signal,
    });
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') throw err;
    throw new ApiError(
      0,
      err instanceof TypeError && err.message === 'Failed to fetch'
        ? 'Unable to reach the server. Please check your internet connection.'
        : (err as Error)?.message || 'A network error occurred.'
    );
  }

  let data: T;
  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    data = await res.json();
  } else {
    data = (await res.text()) as unknown as T;
  }

  if (!res.ok) {
    const errData = data as Record<string, unknown>;
    let detail: string =
      (errData?.detail as string) ||
      (errData?.message as string) ||
      ((errData?.error as Record<string, unknown>)?.message as string) ||
      (typeof errData?.error === 'string' ? errData.error : undefined) ||
      res.statusText;
    if (typeof detail === 'object') detail = JSON.stringify(detail);
    throw new ApiError(res.status, detail);
  }

  return { data, status: res.status, ok: true };
}

export const api = {
  get: <T>(endpoint: string, options?: ApiOptions) =>
    request<T>(endpoint, options, 'GET'),

  post: <T>(endpoint: string, body?: unknown, options?: ApiOptions) =>
    request<T>(endpoint, { ...options, body }, 'POST'),

  put: <T>(endpoint: string, body?: unknown, options?: ApiOptions) =>
    request<T>(endpoint, { ...options, body }, 'PUT'),

  patch: <T>(endpoint: string, body?: unknown, options?: ApiOptions) =>
    request<T>(endpoint, { ...options, body }, 'PATCH'),

  delete: <T>(endpoint: string, options?: ApiOptions) =>
    request<T>(endpoint, options, 'DELETE'),
};

export async function ensureCsrfToken(): Promise<void> {
  if (readCsrfToken()) return;
  try {
    await fetch(`${API_BASE}/csrf-token`, { credentials: 'include' });
  } catch {}
}
