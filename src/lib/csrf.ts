import { ensureCsrfToken } from '@/lib/api';

export function installCsrfInterceptor(): void {
  // CSRF is handled automatically by the api module
}

export async function ensureCsrfCookie(): Promise<void> {
  await ensureCsrfToken();
}
