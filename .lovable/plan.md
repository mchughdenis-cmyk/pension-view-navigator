# Capability showcase sub-site

A public, client-facing sub-site at `/capabilities` that walks a prospect through the twelve administration domains, one narrative page each, with an honest maturity label per area. Live screens stay behind sign-in.

## Structure

```text
/capabilities                      Hub: 12 capability cards, maturity legend
/capabilities/:slug                Narrative page per capability area
```

The twelve areas (slugs):

1. Scheme & member lifecycle — `lifecycle`
2. Contributions — `contributions`
3. Transfers in & out — `transfers`
4. Investment dealing & custody — `dealing`
5. Benefit crystallisation — `crystallisation`
6. Drawdown administration — `drawdown`
7. Death benefits — `death-benefits`
8. Tax reporting — `tax-reporting`
9. Illustrations — `illustrations`
10. Reconciliation & CASS — `cass`
11. Regulatory reporting — `regulatory`
12. Fee & charging engine — `fees`

## What each capability page contains

- Title, one-line positioning, maturity badge.
- **What it does** — plain-English summary of the workflow end to end.
- **Rules covered** — the specific UK rules the area implements (e.g. relief at source, tapered AA and MPAA, carry forward, LSA £268,275 / LSDBA £1,073,100, COBS 13 KFI, COBS 19.4, COBS 19.9 wake-up, SMPI, CASS 7/8, DISP).
- **In the system** — bullet list of the actual screens/processes that deliver it, each with an "Open live screen" link.
- **Where we're going** — roadmap notes for anything not yet complete.

Only rules and screens that exist in this build are described; no invented metrics, client names or performance claims.

## Maturity labels

Three states, shown as badges on both hub and detail pages, with a legend explaining them:

- **Live** — working end to end in the product today.
- **Partial** — core workflow present, some steps manual or simplified (for example custodian reconciliation recorded as a note rather than a live custodian feed; Origo integration demonstrated via the state machine rather than a production Origo link).
- **Roadmap** — designed but not built (for example RegData/GABRIEL return submission, DISP complaints register).

Exact per-area labelling is set from a read of each corresponding screen during the build so the labels are accurate rather than assumed.

## Access behaviour

- `/capabilities` and all detail pages are public — reachable without a session, listed alongside the existing marketing routes.
- Every "Open live screen" link points at the real in-app route. Because the auth gate protects those routes, an unauthenticated visitor is sent to sign-in and returned to the screen after login. Links are visually marked as sign-in required so the client isn't surprised.
- A single "Book a walkthrough" call to action per page routes to the existing contact form.

## Navigation

- Add "Capabilities" to the marketing site navigation.
- Hub links back to the marketing home; detail pages have previous/next links so the whole set can be presented in sequence.

## Technical notes

- New public route branch in `src/App.tsx` alongside `/site`, outside `AuthGate`.
- Content lives in one typed data file (`src/data/capabilities.ts`): slug, title, summary, maturity, rules covered, linked screens with route + label, roadmap notes. Two components render it — a hub and a detail page — so adding or re-labelling an area is a data edit.
- Styling reuses the existing marketing design tokens and shadcn primitives; no new colour values.
- SEO: unique title and meta description per capability page, single H1, semantic sections.
- No database changes, no changes to existing app screens or business logic.
