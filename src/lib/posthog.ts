import posthog from 'posthog-js';

function isValidPostHogKey(key: string | undefined): key is string {
  if (!key) return false;
  if (key.includes('placeholder') || key.includes('test')) return false;
  return key.startsWith('phc_') && key.length >= 30;
}

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

export const isEnabled = typeof window !== 'undefined' && isValidPostHogKey(POSTHOG_KEY);

if (isValidPostHogKey(POSTHOG_KEY)) {
  posthog.init(POSTHOG_KEY, {
    api_host: '/ingest',
    person_profiles: 'identified_only',
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: {
      dom_event_allowlist: ['click', 'change', 'submit'],
    },
    rageclick: true,
    session_recording: {
      maskTextSelector: '.ph-mask',
    },
    persistence: 'localStorage+cookie',
    property_denylist: [
      '$ip',
    ],
    loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') {
        ph.debug();
      }
    },
  });
}

export function identify(userId: string, properties?: Record<string, string | number | boolean>) {
  if (isEnabled) {
    posthog.identify(userId, properties);
  }
}

export function reset() {
  if (isEnabled) {
    posthog.reset();
  }
}

export function capture(event: string, properties?: Record<string, string | number | boolean>) {
  if (isEnabled) {
    posthog.capture(event, properties);
  }
}

export { posthog };
