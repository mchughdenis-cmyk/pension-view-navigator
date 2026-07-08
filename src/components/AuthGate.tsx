/**
 * Auth gating disabled — the app is freely accessible without a password.
 * The /auth page remains available for users who want to sign in for
 * personalisation, but no route is blocked.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

