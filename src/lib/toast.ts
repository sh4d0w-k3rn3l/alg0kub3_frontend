import { toast } from 'sonner';
import type { ApiError } from './api';

export { showConfirm } from './confirm';

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function showSuccess(message: string, options?: ToastOptions) {
  toast.success(message, {
    duration: options?.duration || 3000,
    description: options?.description,
    action: options?.action,
  });
}

export function showError(message: string, options?: ToastOptions) {
  toast.error(message, {
    duration: options?.duration || 5000,
    description: options?.description,
    action: options?.action,
  });
}

export function showInfo(message: string, options?: ToastOptions) {
  toast.info(message, {
    duration: options?.duration || 3000,
    description: options?.description,
    action: options?.action,
  });
}

export function showWarning(message: string, options?: ToastOptions) {
  toast.warning(message, {
    duration: options?.duration || 4000,
    description: options?.description,
    action: options?.action,
  });
}

export function showPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  },
) {
  return toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: (err) => {
      const d = (err as ApiError)?.detail;
      if (d) return typeof d === 'object' ? JSON.stringify(d) : d;
      return messages.error;
    },
  });
}

export function handleApiError(err: unknown, fallback?: string): void {
  if (err && typeof err === 'object' && (err as DOMException)?.name === 'AbortError') {
    return;
  }
  if (err && typeof err === 'object' && 'detail' in err) {
    const detail = (err as ApiError).detail;
    showError(typeof detail === 'object' ? JSON.stringify(detail) : (detail || fallback || 'An unexpected error occurred'));
  } else if (err instanceof Error) {
    showError(err.message || fallback || 'An unexpected error occurred');
  } else {
    showError(fallback || 'An unexpected error occurred');
  }
}

export { toast };
