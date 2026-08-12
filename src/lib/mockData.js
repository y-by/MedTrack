/**
 * MOCK DATA LAYER
 * ----------------
 * Stands in for Netlify DB + Functions while we build the frontend
 * without a live backend. Shapes here match `db/schema.sql` exactly,
 * so swapping `src/lib/api.js` to real `fetch()` calls later is a
 * contained change — nothing above this file should need to know
 * the data is mocked.
 *
 * State lives in memory (reset on page reload) except for the current
 * user, which persists to localStorage so refreshing doesn't log you out.
 */

const DELAY_MS = 250 // simulate network latency so loading states are real

export const delay = (ms = DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms))

let idCounter = 1000
export const nextId = (prefix) => `${prefix}_${idCounter++}`

// ---- Seed users ----
export const users = [
  {
    id: 'user_patient_1',
    displayName: 'Yanay',
    email: 'yanay@example.com',
    isPatient: true,
    isCaretaker: false,
  },
  {
    id: 'user_caretaker_1',
    displayName: 'Noa Cohen',
    email: 'noa@example.com',
    isPatient: false,
    isCaretaker: true,
  },
]

// ---- Seed links (many-to-many) ----
// Empty by default — Noa exists as a seed caretaker account to link to,
// but "Linked people" starts empty so the invite/accept flow is testable
// from a clean slate rather than pre-wired.
export const links = []

// ---- Seed medications ----
// Empty by default — a fresh first start shows the real empty state and
// "Add medication" flow, rather than pre-populated sample cards.
export const medications = []

// ---- Seed dose logs ----
// Each medication has one "current" row (status !== 'taken', the next
// actionable occurrence) plus any number of historical 'taken' rows —
// see src/lib/api.js and src/lib/doseHistory.js.
export const doseLogs = []

// ---- Pending invites (for onboarding link flow) ----
export const invites = []
