// Global polyfills for browser APIs in Next.js
// This ensures localStorage is available and properly implemented

// Create a safe storage implementation
const createStorage = () => {
  const storage: { [key: string]: string } = {};
  
  return {
    getItem: (key: string): string | null => {
      try {
        return storage[key] || null;
      } catch (e) {
        return null;
      }
    },
    setItem: (key: string, value: string): void => {
      try {
        storage[key] = String(value);
      } catch (e) {
        // Silently fail in case of quota exceeded or other errors
      }
    },
    removeItem: (key: string): void => {
      try {
        delete storage[key];
      } catch (e) {
        // Silently fail
      }
    },
    clear: (): void => {
      try {
        Object.keys(storage).forEach(key => delete storage[key]);
      } catch (e) {
        // Silently fail
      }
    },
    get length(): number {
      return Object.keys(storage).length;
    },
    key: (index: number): string | null => {
      const keys = Object.keys(storage);
      return keys[index] || null;
    },
  };
};

// Polyfill for browser environment
if (typeof window !== 'undefined') {
  // Check if localStorage exists and is properly implemented
  try {
    if (!window.localStorage || typeof window.localStorage.getItem !== 'function') {
      // Replace with proper implementation
      Object.defineProperty(window, 'localStorage', {
        value: createStorage(),
        writable: true,
        configurable: true,
      });
    } else {
      // Test if it actually works
      try {
        window.localStorage.getItem('test');
      } catch (e) {
        // If it fails, replace it
        Object.defineProperty(window, 'localStorage', {
          value: createStorage(),
          writable: true,
          configurable: true,
        });
      }
    }
  } catch (e) {
    // If we can't define it, try to assign it
    try {
      (window as any).localStorage = createStorage();
    } catch (e2) {
      // Last resort: do nothing
    }
  }
}

// Also provide a global localStorage for cases where it's accessed directly
if (typeof global !== 'undefined' && typeof window === 'undefined') {
  // Server-side: provide a no-op localStorage
  (global as any).localStorage = createStorage();
}

