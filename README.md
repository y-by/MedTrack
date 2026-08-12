# MedTrack

A React PWA for medication monitoring, for patients and the caretakers who
support them. Built accessibility-first (WCAG 2.2 AAA target) and structured
for reuse as features get layered on.

## Current status: running in mock mode

There's no live backend connected yet, on purpose — we're validating the UI
and flows first, then wiring up Netlify (Identity + DB + Functions) once
this is pushed to GitHub. Right now:

- **Auth** (`src/context/AuthContext.jsx`) — any sign-in method logs you in
  instantly as a seed patient account. No real credentials are checked.
- **Data** (`src/lib/api.js` + `src/lib/mockData.js`) — an in-memory store
  seeded with one patient (Yanay) and one caretaker (Noa), both starting
  with no medications or links so the first run shows the real empty
  states. Resets on every page reload.

Everything above those two files — components, pages, hooks, routing — is
written against the real target shapes, so this isn't throwaway scaffolding.

## Running it

```bash
npm install
npm run dev
```

Open the printed local URL. Sign in with either button on the auth screen —
you'll land as **Yanay**, a patient with no medications yet. Use **Add
medication** on the dashboard to add some and exercise the card states
(upcoming/due/overdue/taken).

To see the caretaker view: go to **Settings → Roles** and turn on "Care for
someone else," or edit `src/lib/mockData.js` to seed a caretaker session.
"Linked people" starts empty — generate a code under **Settings → Link a
caretaker** to test the invite flow. Caretakers linked to you show up under
**Settings → Linked people**, where you can also remove one.

**Settings → Appearance** has a Light / Dark / System theme picker
(defaults to System, following the OS setting live).

```bash
npm run build     # production build — verified passing
npm run preview   # serve the production build locally
```

## How this connects to Netlify later

1. **Push to GitHub**, connect the repo in Netlify.
2. **Enable Netlify Identity** on the site, turn on Google as an external
   provider. Swap `AuthContext.jsx`'s internals to wrap
   `netlify-identity-widget` (`init`, `open`, the `login`/`logout` events) —
   the exported `{ user, loading, login, logout }` shape stays the same, so
   no page or component changes.
3. **Add Netlify DB** (`netlify init db` or one click in the dashboard). Run
   `db/schema.sql` against it — the table shapes already match
   `mockData.js` exactly.
4. **Fill in `netlify/functions/*.js`** — each stub has the real
   `@netlify/neon` query commented in already, matching the function it
   replaces in `src/lib/api.js`.
5. **Swap `src/lib/api.js`** — each exported function's body changes from
   reading `mockData.js` to `fetch('/.netlify/functions/...')`. Signatures
   and return shapes don't change, so `src/hooks/*` and everything above
   them needs no edits.

That's the whole migration — the mock/real boundary was kept deliberately
narrow to make this swap mechanical rather than a rewrite.

## Project structure

```
src/
  components/
    ui/              Button, Card, Badge, Icon, Input — base primitives
    MedicationCard/   the core content unit of both dashboards
  pages/              route-level views
  hooks/              React Query hooks — the only thing components call
  lib/
    api.js            API boundary — swap this file to go live
    mockData.js        seed data, mock-mode only
    queryClient.js     React Query config (tuned for low request volume)
  context/
    AuthContext.jsx    auth boundary — swap internals to go live
  styles/
    tokens.css          design tokens (colors, type, spacing) — single source of truth
    global.css          resets, focus states, reduced-motion handling

netlify/functions/     stubbed serverless functions, not yet wired in
db/schema.sql          Postgres schema for Netlify DB
netlify.toml            deploy config (SPA redirect, functions dir)
```

## Accessibility notes

- Color is never the only signal — every status has an icon + text label
- All interactive targets are at least 48×48px
- Full keyboard navigation with visible focus rings (`:focus-visible`)
- `prefers-reduced-motion` respected globally
- Skip-to-content link on every authenticated page
- Palette chosen for 7:1 (AAA) contrast against its paired surface —
  re-check with a contrast tool if colors change in the design pass

## Deferred to later phases

Push notifications/reminders, adherence history, caretaker missed-dose
alerts, refill tracking, multi-language support, offline write queueing.
The data model (`dose_logs.status`) already anticipates most of these.
