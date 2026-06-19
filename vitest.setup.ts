import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { TextEncoder, TextDecoder } from 'util';
Object.assign(global, { TextDecoder, TextEncoder });

const mockIntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};
Object.assign(global, { IntersectionObserver: mockIntersectionObserver });

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.assign(global, { ResizeObserver: ResizeObserverMock });

if (typeof window !== 'undefined' && window.HTMLElement) {
  window.HTMLElement.prototype.scrollIntoView = function() {};
}
class LocalStorageMock {
  store: Record<string, string> = {};
  getItem(key: string) { return this.store[key] || null; }
  setItem(key: string, value: string) { this.store[key] = value.toString(); }
  removeItem(key: string) { delete this.store[key]; }
  clear() { this.store = {}; }
}
Object.defineProperty(globalThis, 'localStorage', { value: new LocalStorageMock() });
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', { value: new LocalStorageMock() });
}
