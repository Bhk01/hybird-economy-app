import '@testing-library/jest-dom'
import { beforeEach, afterEach } from 'vitest'

// Clear localStorage between tests
beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

// If running in a node environment without a global localStorage, provide a mock
if (typeof globalThis.localStorage === 'undefined') {
  // Simple in-memory mock sufficient for our tests
  const storage: Record<string, string> = {}
  // @ts-ignore
  globalThis.localStorage = {
    getItem(key: string) {
      return storage[key] ?? null
    },
    setItem(key: string, value: string) {
      storage[key] = String(value)
    },
    removeItem(key: string) {
      delete storage[key]
    },
    clear() {
      for (const k of Object.keys(storage)) delete storage[k]
    }
  }
}
