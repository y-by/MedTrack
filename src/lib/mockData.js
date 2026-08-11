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

const now = () => new Date()
export const hoursFromNow = (h) => new Date(Date.now() + h * 60 * 60 * 1000).toISOString()

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
export const medications = [
  {
    id: 'med_1',
    patientId: 'user_patient_1',
    name: 'Amoxicillin',
    type: 'capsule',
    dosage: '500mg, 1 capsule',
    instructions: 'Take with food. Finish the full course.',
    scheduleLabel: 'Every 8 hours',
    scheduleType: 'interval',
    scheduleIntervalHours: 8,
    scheduleStartTime: '08:00',
    active: true,
  },
  {
    id: 'med_2',
    patientId: 'user_patient_1',
    name: 'Saline nasal drops',
    type: 'drops',
    dosage: '2 drops per nostril',
    instructions: null,
    scheduleLabel: 'Daily at 8:00 AM and 8:00 PM',
    scheduleType: 'daily',
    scheduleTimes: ['08:00', '20:00'],
    active: true,
  },
  {
    id: 'med_3',
    patientId: 'user_patient_1',
    name: 'Ibuprofen',
    type: 'pill',
    dosage: '200mg, 1 tablet',
    instructions: 'Do not exceed 3 doses in 24 hours.',
    scheduleLabel: 'As needed, every 6 hours',
    scheduleType: 'as_needed',
    scheduleAsNeededGapHours: 6,
    active: true,
  },
]

// ---- Seed dose logs (one "next relevant dose" per medication for MVP) ----
export const doseLogs = [
  { id: 'dose_1', medicationId: 'med_1', scheduledFor: hoursFromNow(-1), status: 'overdue', takenAt: null },
  { id: 'dose_2', medicationId: 'med_2', scheduledFor: hoursFromNow(0.2), status: 'due', takenAt: null },
  { id: 'dose_3', medicationId: 'med_3', scheduledFor: hoursFromNow(5), status: 'upcoming', takenAt: null },
]

// ---- Pending invites (for onboarding link flow) ----
export const invites = []
