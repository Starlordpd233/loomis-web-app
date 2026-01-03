const SANDBOX_PREFIX = 'sandbox:';

export const sandboxStorage = {
  getItem(key: string): string | null {
    return localStorage.getItem(`${SANDBOX_PREFIX}${key}`);
  },
  setItem(key: string, value: string): void {
    localStorage.setItem(`${SANDBOX_PREFIX}${key}`, value);
  },
  removeItem(key: string): void {
    localStorage.removeItem(`${SANDBOX_PREFIX}${key}`);
  },
  clearAll(): void {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(SANDBOX_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  },
};
