export const safeStorage = {
  getBool: (key: string, fallback = false): boolean => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? item === "true" : fallback;
    } catch {
      return fallback;
    }
  },

  set: (key: string, value: unknown): void => {
    try {
      localStorage.setItem(key, String(value));
    } catch {
      // Safe fallback for restricted storage environments
    }
  },
};

export default safeStorage;
