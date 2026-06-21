'use client';

import { createRoot } from 'react-dom/client';

export function showConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999';
    document.body.appendChild(container);
    const root = createRoot(container);

    const close = (result: boolean) => {
      root.unmount();
      if (container.parentNode) document.body.removeChild(container);
      resolve(result);
    };

    root.render(
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        }}
        onClick={() => close(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'var(--theme-bg-card, #1c2333)',
            border: '1px solid var(--theme-border, #2d3748)',
            borderRadius: '16px', padding: '28px', width: '420px', maxWidth: '90vw',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          }}
        >
          <h3
            style={{
              margin: '0 0 8px', fontSize: '16px', fontWeight: 600,
              color: 'var(--theme-text, #e2e8f0)',
            }}
          >
            Confirm Action
          </h3>
          <p
            style={{
              margin: '0 0 24px', fontSize: '14px', lineHeight: '1.6',
              color: 'var(--theme-text-secondary, #8b949e)',
            }}
          >
            {message}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => close(false)}
              style={{
                padding: '8px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 500,
                border: '1px solid var(--theme-border, #2d3748)',
                background: 'var(--theme-bg, #0d1117)',
                color: 'var(--theme-text-secondary, #8b949e)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => close(true)}
              style={{
                padding: '8px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                border: 'none',
                background: 'var(--theme-green, #22c55e)',
                color: '#052e16',
                cursor: 'pointer',
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>,
    );
  });
}
