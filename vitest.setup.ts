class LocalStorageMock {
  store: Record<string, string> = {};
  getItem(key: string) { return this.store[key] || null; }
  setItem(key: string, value: string) { this.store[key] = value.toString(); }
  removeItem(key: string) { delete this.store[key]; }
  clear() { this.store = {}; }
}
Object.defineProperty(globalThis, 'localStorage', { value: new LocalStorageMock() });
Object.defineProperty(window, 'localStorage', { value: new LocalStorageMock() });
