// Ensure Window.prototype.fetch has a setter so browser extensions (e.g. Katalon, interceptors) can assign to window.fetch without TypeError
(function ensureFetchSetter() {
  try {
    const win = typeof window !== 'undefined' ? window : null;
    if (!win) return;

    const nativeFetch = win.fetch;
    let currentFetch = nativeFetch;

    const proto = win.Window ? win.Window.prototype : Object.getPrototypeOf(win);
    if (proto) {
      try {
        const desc = Object.getOwnPropertyDescriptor(proto, 'fetch');
        if (!desc || !desc.set) {
          Object.defineProperty(proto, 'fetch', {
            get() {
              return (this && (this as unknown as { _customFetch?: typeof fetch })._customFetch) || (currentFetch === nativeFetch && typeof nativeFetch === 'function' ? nativeFetch.bind(win) : currentFetch);
            },
            set(fn) {
              if (this === win || !this) {
                currentFetch = fn;
              } else {
                (this as unknown as { _customFetch?: typeof fetch })._customFetch = fn;
              }
            },
            configurable: true,
            enumerable: true,
          });
        }
      } catch {
        // Ignore if restricted
      }
    }
  } catch {
    // Ignore if not supported
  }
})();

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
