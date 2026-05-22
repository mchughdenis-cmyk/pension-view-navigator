// PWA.1 — iOS & EU PWA compatibility utilities

export const isIOS = () =>
  typeof navigator !== "undefined" &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !(window as any).MSStream;

export const isAndroid = () =>
  typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);

export const isInStandaloneMode = () => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
};

export const isEU = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    return tz.startsWith("Europe/");
  } catch {
    return false;
  }
};

export const supportsPushNotifications = () => {
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator)) return false;
  if (!("PushManager" in window)) return false;
  if (isIOS() && !isInStandaloneMode()) return false;
  return true;
};

const KEY_DISMISS = "airgead.iosInstall.dismissedUntil";
const KEY_SHOWN = "airgead.iosInstall.shownCount";

export const shouldShowIOSInstallSheet = () => {
  if (!isIOS() || isInStandaloneMode()) return false;
  const until = Number(localStorage.getItem(KEY_DISMISS) || 0);
  if (Date.now() < until) return false;
  const shown = Number(localStorage.getItem(KEY_SHOWN) || 0);
  if (shown >= 3) return false;
  return true;
};

export const recordIOSInstallShown = () => {
  const shown = Number(localStorage.getItem(KEY_SHOWN) || 0);
  localStorage.setItem(KEY_SHOWN, String(shown + 1));
};

export const dismissIOSInstallSheet = (days = 7) => {
  localStorage.setItem(
    KEY_DISMISS,
    String(Date.now() + days * 24 * 60 * 60 * 1000),
  );
};

export const setAppBadge = (count: number) => {
  try {
    (navigator as any).setAppBadge?.(count);
  } catch {
    /* no-op */
  }
};

export const clearAppBadge = () => {
  try {
    (navigator as any).clearAppBadge?.();
  } catch {
    /* no-op */
  }
};
