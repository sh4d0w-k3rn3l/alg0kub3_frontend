// CSRF protection is handled automatically by the api module
// (sends X-CSRF-Token: 1 on every unsafe method).
// No additional setup required.

export function installCsrfInterceptor(): void {}
export async function ensureCsrfCookie(): Promise<void> {}
