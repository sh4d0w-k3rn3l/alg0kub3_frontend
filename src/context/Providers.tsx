'use client';

import { type ReactNode, useEffect } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from './ThemeContext';
import { AuthProvider } from './AuthContext';
import { LanguagePrefProvider } from './LanguagePrefContext';
import { PostHogProvider } from '@/components/PostHogProvider';
import { Toaster } from 'sonner';
import { useSettingsStore } from '@/store/settings';
import ErrorBoundary from '@/components/ErrorBoundary';

function HydrateStores({ children }: { children: ReactNode }) {
  useEffect(() => {
    useSettingsStore.getState().hydrate();
  }, []);
  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PostHogProvider>
      <ErrorBoundary fallbackMessage="Authentication service unavailable. Please try refreshing.">
        <ClerkProvider>
          <AuthProvider>
            <HydrateStores>
              <ThemeProvider>
                <LanguagePrefProvider>
                  <div id="clerk-captcha" style={{ display: 'none' }} />
                  {children}
                  <Toaster
                    position="bottom-right"
                    richColors
                    closeButton
                    toastOptions={{
                      duration: 4000,
                    }}
                  />
                </LanguagePrefProvider>
              </ThemeProvider>
            </HydrateStores>
          </AuthProvider>
        </ClerkProvider>
      </ErrorBoundary>
    </PostHogProvider>
  );
}
