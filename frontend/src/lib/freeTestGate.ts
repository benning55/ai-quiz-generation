// lib/freeTestGate.ts
export const FREE_TEST_LIMIT = 5;
const KEY = 'freeTestsUsed';

export function getFreeTestsUsed(): number {
  if (typeof window === 'undefined') return 0;
  const v = window.localStorage.getItem(KEY);
  return v ? Math.max(0, parseInt(v, 10)) : 0;
}

export function canStartFreeTest(): boolean {
  return getFreeTestsUsed() < FREE_TEST_LIMIT;
}

export function incrementFreeTestsUsed(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, String(getFreeTestsUsed() + 1));
}

export function remainingFreeTests(): number {
  return Math.max(0, FREE_TEST_LIMIT - getFreeTestsUsed());
}