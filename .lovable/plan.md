# Reposition as an Administration-First Platform

Goal: Without touching functionality, restructure the marketing surface, landing route, and shell chrome so a visitor immediately reads this as a **pension administration system** — with Client and Adviser portals presented as complementary modules rather than co-equal apps. Also surface a candid "Roadmap / Known gaps" panel so shortcomings are visible, not hidden.

## 1. Public marketing site (`/`) — reframe the story

Rework `src/components/marketing/MarketingSite.tsx` and `SystemOverview.tsx` around one thesis: *"The administration engine behind modern SIPP, ISA and GIA books — with member and adviser portals included."*

- **New hero**: headline "Pension Administration, End-to-End" + subline naming the daily desk (bank recon, contributions, transfers, drawdown, payroll, PAYE/RAS, CASS). Two CTAs: *Launch Admin Desk* (primary → `/admin`) and *See Client & Adviser Portals* (secondary → anchor).
- **"What the admin does today" band**: 4 columns mirroring the Admin Desk groups — Book-of-business daily desk / Client-level daily desk / Member management / Compliance & regulation. Each lists the real routes so it reads as a spec sheet, not marketing fluff.
- **Portals as modules**: demote the current three-equal-cards layout (`SystemOverview` roleCards). Replace with an "Admin core + two portals" diagram: a large Admin card, and two smaller *Client portal* / *Adviser portal* cards beneath, captioned "included".
- **Scoreboard strip**: reuse `MarketScoreboard` but relabel to admin-centric metrics (edge functions, tables, daily-desk workflows, E2E tests, seeded clients) instead of generic feature counts.
- **Trust row**: CASS 7/8, HMRC RAS/RTI, TPR contribution monitoring, Origo, Bacs — as labelled chips.

## 2. Landing / redirect behaviour

- Keep auth intact. For unauthenticated `/`, default the marketing hero CTA to the Admin Desk demo (`/admin`) rather than `/dashboard`, so first impression = administration.
- After sign-in, keep the role-based landing already fixed (admin → `/admin`, adviser → `/workbench`, client → `/client-services`).

## 3. App shell chrome — signal "administration platform"

`src/components/nav/AppShell.tsx` + `AppSidebar.tsx`:
- Brand block: keep "Pension Navigator by Airgead" but add a small pill under it — `Administration Platform` — visible in all three views. Reinforces framing even inside Client/Adviser views.
- Header: add a subtle "Environment" chip (Demo / Live) next to `FirmSwitcher` so it reads as an operations console.
- Sidebar footer: rename the role selector label from a bare dropdown to "Viewing as:" so switching views feels like an admin capability, not a mode toggle.

## 4. Admin Desk landing (`/admin`) — hero it

`PensionAdminDashboard` currently drops straight into tabs. Add a compact top band:
- Left: "Daily admin desk" title + today's date + operator name.
- Right: 4 KPI tiles pulled from existing data (unallocated cash count, cases awaiting four-eyes, contributions due this week, transfers in-flight). Reuses queries already in child components — no new logic, just surface them.
- Below: the existing tabbed content unchanged.

This makes screenshots of `/admin` self-evidently an admin console.

## 5. Portal framing pages

- **Client portal** (`ClientServicesHub`): add a one-line banner "Member self-service portal — part of Pension Navigator administration".
- **Adviser portal** (`AdviserWorkbench`): same treatment — "Adviser workbench — part of Pension Navigator administration".

Small change, but every screenshot now anchors back to the admin story.

## 6. Design tokens — subtle "operations console" polish

`src/index.css` only (no component colour edits):
- Tighten the primary to a deeper navy (institutional feel) and introduce a `--surface-muted` for KPI tiles.
- Add a `--brand-accent` amber for status/alert chips used by the new KPI band.
- Keep dark mode working; no hardcoded colours in components.

## 7. "Roadmap & known gaps" — surface shortcomings honestly

Add a new marketing section **and** an in-app `/admin/roadmap` page listing what's partial or missing, so this is transparent rather than buried. Content drawn from the existing conversation history:

| Area | Status | Note |
|---|---|---|
| Unit tests for `src/lib/` | Missing | Only 4 Playwright E2E specs today |
| Four-eyes queue | Partial | Present in Payroll only; not cross-module |
| Corporate actions processor | Stub | Edge function exists, no UI workflow |
| RAS monthly reclaim submission | Partial | Calculation yes, HMRC submission stub |
| Death benefits end-to-end | Partial | Claims page exists; payout workflow light |
| Origo transfer state machine | Partial | Happy path only; exception handling thin |
| Pensions Dashboards Programme (PDP) | Not connected | Integration surface only |
| Accessibility (WCAG 2.2 AA) audit | Not done | No formal audit recorded |
| SSO / SCIM for enterprise tenants | Missing | Supabase auth only |
| Full audit export (immutable, signed) | Partial | Audit trail present, no signed export |
| Performance at 100k+ members | Unverified | No load testing |
| DR / RPO/RTO documentation | Missing | Not published |

Rendered as a candid two-column table on marketing + as an in-app card list at `/admin/roadmap` linked from the sidebar footer.

## 8. SEO & head metadata

`index.html`: update `<title>` and `<meta description>` to lead with "Pension administration platform" + "Client and adviser portals included". Update OG/Twitter tags to match. Single H1 on marketing = the new hero headline.

## Out of scope (explicit)
- No changes to business logic, calculations, RLS, edge functions, or database schema.
- No changes to existing routes' functionality — only chrome, copy, layout, tokens, and one new read-only `/admin/roadmap` page.
- No new dependencies.

## Files touched (approx.)
- `src/components/marketing/MarketingSite.tsx`, `MarketScoreboard.tsx`
- `src/components/SystemOverview.tsx`
- `src/components/nav/AppShell.tsx`, `AppSidebar.tsx`
- `src/components/PensionAdminDashboard.tsx` (add KPI band wrapper only)
- `src/components/ClientServicesHub.tsx`, `AdviserWorkbench.tsx` (one banner each)
- `src/index.css` (tokens only)
- `index.html` (meta)
- New: `src/pages/admin/Roadmap.tsx` + route in `App.tsx` + nav entry in `navConfig.ts`

## Open question before I build
Do you want the **Roadmap / Known gaps** panel visible on the **public marketing site** (fully transparent to prospects), or **in-app only** at `/admin/roadmap` (transparent to operators, not prospects)?
