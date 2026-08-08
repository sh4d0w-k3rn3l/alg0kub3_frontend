'use client';

import React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';

export interface AnimationBundle {
  type: string;
  premium?: boolean;
  entry: string;
  modules: Record<string, string>;
  sigs: Record<string, string[]>;
}

const nextNavStub = {
  usePathname: () => '/',
  useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {}, forward: () => {} }),
  useSearchParams: () => new URLSearchParams(),
};

function makeProvided() {
  return {
    '261426': React,
    '786897': jsxRuntime,
    '553965': { env: {}, cwd: () => '', process: { env: {} } },
    '537099': {},
    '581099': {},
    '212845': nextNavStub,
    '465360': {},
    '826381': {},
    '324553': {},
  };
}

export function evalBundle(bundle: AnimationBundle) {
  const { modules, sigs, entry } = bundle;
  const cache: Record<string, { exports: unknown }> = {};
  const provided = makeProvided() as Record<string, unknown>;
  const g: unknown =
    typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : {};

  const webpackRequire = (id: unknown) => {
    const key = String(id);
    if (cache[key]) return cache[key].exports;
    if (provided[key]) return provided[key];
    if (!modules[key]) throw new Error(`module ${key} not found`);
    const mod = { exports: {} as Record<string, unknown> };
    cache[key] = mod;
    const body = modules[key];
    const fnRequire = (mid: unknown) => webpackRequire(mid);
    fnRequire.d = (exports: Record<string, unknown>, defs: Record<string, () => unknown>) => {
      for (const k of Object.keys(defs)) {
        Object.defineProperty(exports, k, { enumerable: true, get: defs[k] });
      }
    };
    fnRequire.r = (exports: Record<string, unknown>) => {
      Object.defineProperty(exports, '__esModule', { value: true });
    };
    fnRequire.o = (obj: object, prop: string) => Object.prototype.hasOwnProperty.call(obj, prop);
    fnRequire.n = (m: { __esModule?: boolean; default?: unknown }) => {
      const getter: (() => unknown) & { a?: unknown } = m && m.__esModule ? () => m.default : () => m;
      getter.a = m;
      return getter;
    };
    fnRequire.g = g;
    fnRequire.u = () => '';
    fnRequire.f = {};
    fnRequire.j = () => '';
    fnRequire.e = () => Promise.resolve();
    fnRequire.bind = () => webpackRequire;
    fnRequire.t = (value: { default?: unknown; __esModule?: boolean }, mode: number) => {
      let v: { default?: unknown; __esModule?: boolean } & Record<string, unknown> = value as never;
      if (mode & 1) v = value ? ((value.default as never) ?? {}) : {};
      const ns: Record<string, unknown> = {};
      for (const k in v) ns[k] = v[k];
      if (v && v.__esModule) ns.default = v.default;
      return ns;
    };
    fnRequire.p = '';
    const [p1, p2, p3] = sigs[key] || ['m', 'exports', 'require'];
    const params = [p1, p2, p3].filter((p) => p && p.length > 0).join(',');
    const fn = new Function(
      'mod',
      'exports',
      'fnRequire',
      '"use strict";\n(function(' + params + '){' + body + '}).call(exports, mod, exports, fnRequire);',
    );
    fn.call(mod.exports, mod, mod.exports, fnRequire);
    return mod.exports;
  };

  return webpackRequire(entry);
}
