// PWA.2 — Haptic feedback (navigator.vibrate wrapper, no-ops on unsupported browsers)
const v = (pattern: number | number[]) => {
  try {
    return navigator.vibrate?.(pattern);
  } catch {
    return false;
  }
};

export const haptic = {
  light: () => v(10),
  medium: () => v(25),
  heavy: () => v(50),
  success: () => v([10, 50, 10]),
  error: () => v([50, 30, 50]),
};
