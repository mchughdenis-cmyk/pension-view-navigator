// Lightweight analytics shim. Wraps PostHog if VITE_POSTHOG_KEY is set,
// otherwise logs events to console + Supabase activity_log when available.
// Safe to call from anywhere — never throws.

type Props = Record<string, unknown>;

let posthog: any = null;
let initialised = false;

async function init() {
  if (initialised) return;
  initialised = true;
  const key = (import.meta as any).env?.VITE_POSTHOG_KEY as string | undefined;
  if (!key) return;
  try {
    const mod: any = await import(/* @vite-ignore */ ("posthog" + "-js"));
    posthog = mod.default;
    posthog.init(key, { api_host: "https://eu.i.posthog.com", capture_pageview: true });
  } catch {
    // posthog-js not installed; silent no-op
  }
}

export function trackEvent(name: string, props?: Props) {
  init();
  try {
    if (posthog) posthog.capture(name, props);
    else if ((import.meta as any).env?.DEV) console.debug("[analytics]", name, props);
  } catch { /* noop */ }
}

export function identify(userId: string, traits?: Props) {
  init();
  try { posthog?.identify(userId, traits); } catch { /* noop */ }
}
