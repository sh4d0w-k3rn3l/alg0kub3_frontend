import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { renderToString } from 'react-dom/server';

import fs from 'fs';
const slugArg = process.argv[2] || 'test_bundle';
const data = JSON.parse(fs.readFileSync(new URL('./'+slugArg+'.json', import.meta.url), 'utf8'));
const modules = data.modules;
const sigs = data.sigs || {};
const entry = data.entry;

// ---- mini webpack runtime ----
// module body format: {r.d(t,{...});var a=r(...)...}
// We need r.d, r.o, r.n, r.g helpers. The module bodies use webpack helper `a` (require) which
// has properties .d .r .o .n .g .u etc. Let's build a require with those helpers.

function buildRuntime(provided) {
  const cache = {};
  const g = globalThis;

  function getExport(mod) { return cache[mod] ? cache[mod].exports : undefined; }

  const webpackRequire = (id) => {
    const key = String(id);
    if (cache[key]) return cache[key].exports;
    if (provided[key]) return provided[key];
    if (!modules[key]) {
      throw new Error(`module ${key} not found`);
    }
    const module = { exports: {} };
    cache[key] = module;
    const body = modules[key];
    // provide helpers on the require fn
    const fnRequire = (mid) => webpackRequire(mid);
    fnRequire.d = (exports, defs) => {
      for (const k of Object.keys(defs)) {
        Object.defineProperty(exports, k, { enumerable: true, get: defs[k] });
      }
    };
    fnRequire.r = (exports) => {
      Object.defineProperty(exports, '__esModule', { value: true });
    };
    fnRequire.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
    fnRequire.n = (m) => {
      const getter = m && m.__esModule ? () => m.default : () => m;
      getter.a = m;
      return getter;
    };
    fnRequire.g = g;
    fnRequire.u = () => '';
    fnRequire.f = {};
    fnRequire.j = () => '';
    fnRequire.e = () => Promise.resolve();
    fnRequire.bind = () => webpackRequire;
    fnRequire.t = (value, mode) => {
      if (mode & 1) value = value ? value.default : value;
      const ns = {};
      for (const k in value) ns[k] = value[k];
      if (value && value.__esModule) ns.default = value.default;
      return ns;
    };
    fnRequire.p = '';
    const [p1, p2, p3] = sigs[key] || ['m', 'exports', 'require'];
    const params = [p1, p2, p3].filter(p => p && p.length > 0).join(',');
    const fn = new Function('module', 'exports', 'fnRequire', '"use strict";\n(function(' + params + '){' + body + '}).call(exports, module, exports, fnRequire);');
    try {
      
      fn.call(module.exports, module, module.exports, fnRequire);
    } catch (err) {
      delete cache[key];
      err.message = `module ${key} [${p1},${p2},${p3}]: ${err.message}`;
      throw err;
    }
    return module.exports;
  };
  return webpackRequire;
}

// provided externals
const provided = {
  '261426': React,             // the bundled React -> use host React instance
  '786897': jsxRuntime,        // react/jsx-runtime
  '553965': { env: {}, cwd: () => '', get process() { return process.env; } },
  '537099': {},                 // next error helpers (not used by ad-click render path)
  '581099': {},
  '212845': { usePathname: () => '/', useRouter: () => ({ push: () => {}, replace: () => {} }), useSearchParams: () => new URLSearchParams() },
  '465360': {},
  '826381': {},
  '324553': {},
};

const r = buildRuntime(provided);
try {
  const mod = r(entry);
  const Comp = mod.default || mod;
  console.log('typeof Comp:', typeof Comp);
  if (typeof Comp === 'function') {
    const html = renderToString(React.createElement(Comp));
    console.log('HTML length:', html.length);
    console.log(html.slice(0, 300));
  } else {
    console.log('exports keys:', Object.keys(mod));
  }
} catch (err) {
  console.error('RENDER ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
}
