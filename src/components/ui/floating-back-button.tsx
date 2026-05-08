// Floating back button is intentionally disabled to avoid covering page sections.
// Navigation is provided by the AppShell sidebar + breadcrumbs and per-page <BackButton/>.
// Kept as an exported no-op so existing imports continue to compile.
export function FloatingBackButton() {
  return null;
}
