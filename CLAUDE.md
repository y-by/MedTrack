# CLAUDE.md

MedTrack — a React PWA for medication monitoring, built for patients and
the caretakers who support them. Accessibility-first (WCAG 2.2 AAA target),
structured for reuse as features get layered on.

See [README.md](README.md) for full architecture, project structure, and
the mock → Netlify migration plan. This file covers house rules and
decisions that aren't written down elsewhere.

## Commands

```bash
npm install
npm run dev       # local dev server
npm run build     # production build
npm run preview   # serve the production build locally
```

## Current phase: MVP, mock mode, design not final

- Netlify (Identity + DB + Functions) is deliberately **not connected yet**.
  The priority right now is validating UI and flows first, then wiring up
  the real backend once this is pushed to GitHub. Don't jump ahead and
  wire Netlify unless explicitly asked.
- Visual design is intentionally plain (calm teal/off-white, system fonts)
  — the owner is a designer/developer who wants mechanics solid first, then
  a real design pass together. Everything is token-driven
  (`src/styles/tokens.css`) specifically so that pass is a palette/type
  swap, not a rebuild. Don't over-invest in visual polish beyond what's
  there; don't hardcode colors/spacing outside the tokens.

## House rules

- **Mock/real boundary stays narrow.** `src/lib/api.js` is the only file
  that should change when swapping mock data for live Netlify Functions.
  Function signatures and return shapes must stay stable so
  `src/hooks/*` and everything above it needs no edits.
- **Never touch `src/lib/mockData.js` shapes without updating
  `db/schema.sql` to match**, and vice versa — they're kept in lockstep
  intentionally.
- **Auth boundary is `src/context/AuthContext.jsx`.** Its exported
  `{ user, loading, login, logout }` shape must stay stable when swapping
  in real `netlify-identity-widget` internals later.
- **Accessibility is not optional, even in mock mode**: WCAG 2.2 AAA
  target, color never the only signal, 48×48px minimum touch targets,
  full keyboard nav with visible focus rings, `prefers-reduced-motion`
  respected, skip-to-content link, 7:1 contrast palette. Re-check contrast
  with a tool if colors change.
- **Efficiency and reuse first.** Base primitives live in
  `src/components/ui/` (Button, Card, Badge, Icon, Input) — build new UI
  from these rather than one-off markup.
- React Query (`src/lib/queryClient.js`) is deliberately tuned for low
  request volume / non-aggressive polling — this is a medication app, not
  a live feed.

## Deferred to later phases

Push notifications/reminders, adherence history, caretaker missed-dose
alerts, refill tracking, multi-language support, offline write queueing.
The data model (`dose_logs.status`) already anticipates most of these —
don't redesign it to add them, extend it.
