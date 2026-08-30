export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem: (key: string, value: unknown): void => {
    try {
      localStorage.setItem(
        key,
        typeof value === "string" ? value : String(value),
      );
    } catch (e) {
      void e;
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      void e;
    }
  },

  getBool: (key: string, fallback = false): boolean => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? item === "true" : fallback;
    } catch {
      return fallback;
    }
  },
};

export default safeStorage;
