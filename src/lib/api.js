/**
 * API BOUNDARY
 * ------------
 * Every data hook in src/hooks/ calls through here, never through
 * mockData.js directly. When we connect Netlify Functions + Netlify DB,
 * this is the only file that changes — each function below gets its
 * body swapped for a `fetch('/.netlify/functions/...')` call, but the
 * function signatures and return shapes stay the same so the hooks and
 * components above don't need to change at all.
 */
import { delay, nextId, users, links, medications, doseLogs, invites } from './mockData'
import { computeNextDose } from './scheduleUtils'
import { summarizeDoseHistory } from './doseHistory'

// ---- Medications ----

/** Builds a fresh "current" dose log row for a medication from its schedule. */
function buildDoseLog(medication) {
  return {
    id: nextId('dose'),
    medicationId: medication.id,
    ...computeNextDose(medication),
    takenAt: null,
  }
}

/**
 * Returns [{ medication, dose, lastTaken, yesterday }] for a patient.
 * `dose` is the current (not yet taken) dose log — the next actionable
 * occurrence, drives the badge/"Mark as taken" as before. `lastTaken` is
 * the most recently taken dose today (or null). `yesterday` is all of
 * yesterday's taken doses. Older history isn't discarded — it just stays
 * in doseLogs, unsurfaced here (see CLAUDE.md "Deferred to later phases").
 */
export async function getPatientMedications(patientId) {
  await delay()
  return medications
    .filter((m) => m.patientId === patientId && m.active)
    .map((medication) => {
      const dose = doseLogs.find((d) => d.medicationId === medication.id && d.status !== 'taken') || null
      const takenDoses = doseLogs.filter((d) => d.medicationId === medication.id && d.status === 'taken')
      const { lastTaken, yesterday } = summarizeDoseHistory(takenDoses)
      return { medication, dose, lastTaken, yesterday }
    })
}

/** Creates a medication for a patient and an initial upcoming dose log. Returns { medication, dose }. */
export async function createMedication({
  patientId,
  name,
  type,
  otherTypeLabel,
  dosage,
  instructions,
  scheduleLabel,
  scheduleType,
  scheduleTimes,
  scheduleIntervalHours,
  scheduleStartTime,
  scheduleAsNeededGapHours,
}) {
  await delay(150)
  const medication = {
    id: nextId('med'),
    patientId,
    name,
    type,
    otherTypeLabel: otherTypeLabel || null,
    dosage: dosage || null,
    instructions: instructions || null,
    scheduleLabel,
    scheduleType,
    scheduleTimes,
    scheduleIntervalHours,
    scheduleStartTime,
    scheduleAsNeededGapHours,
    active: true,
  }
  medications.push(medication)

  const dose = buildDoseLog(medication)
  doseLogs.push(dose)

  return { medication, dose }
}

/**
 * Updates an existing medication's editable fields in place, and
 * recomputes its current dose's scheduledFor/status to match the
 * (possibly new) schedule — unless it's already been taken, which an
 * edit shouldn't silently undo. Returns the updated medication.
 */
export async function updateMedication(medicationId, updates) {
  await delay(150)
  const medication = medications.find((m) => m.id === medicationId)
  if (medication) {
    Object.assign(medication, updates)

    const dose = doseLogs.find((d) => d.medicationId === medicationId && d.status !== 'taken')
    if (dose) {
      Object.assign(dose, computeNextDose(medication))
    }
  }
  return medication
}

/** Soft-deletes a medication (excluded from active lists, dose history preserved). */
export async function deleteMedication(medicationId) {
  await delay(150)
  const medication = medications.find((m) => m.id === medicationId)
  if (medication) medication.active = false
  return medication
}

/** Returns [{ patient, medications: [{medication, dose, lastTaken, yesterday}] }] for everyone linked to a caretaker. */
export async function getCaretakerOverview(caretakerId) {
  await delay()
  const patientIds = links
    .filter((l) => l.caretakerId === caretakerId && l.status === 'active')
    .map((l) => l.patientId)

  return Promise.all(
    patientIds.map(async (patientId) => ({
      patient: users.find((u) => u.id === patientId),
      medications: await getPatientMedications(patientId),
    }))
  )
}

/**
 * Marks a dose taken, then immediately generates the next occurrence as
 * a new "current" dose log row (linked back via nextDoseId), so "Mark as
 * taken" comes back once that next occurrence's time arrives instead of
 * disappearing forever.
 */
export async function markDoseTaken(doseId) {
  await delay(150)
  const dose = doseLogs.find((d) => d.id === doseId)
  if (dose) {
    dose.previousStatus = dose.status
    dose.status = 'taken'
    dose.takenAt = new Date().toISOString()

    const medication = medications.find((m) => m.id === dose.medicationId)
    if (medication) {
      const nextDose = buildDoseLog(medication)
      doseLogs.push(nextDose)
      dose.nextDoseId = nextDose.id
    }
  }
  return dose
}

/**
 * Reverts a taken dose back to its status beforehand (undo), removing
 * the "next" dose log row it generated so we don't leave an orphaned
 * current dose behind.
 */
export async function markDoseNotTaken(doseId) {
  await delay(150)
  const dose = doseLogs.find((d) => d.id === doseId)
  if (dose) {
    if (dose.nextDoseId) {
      const generatedIndex = doseLogs.findIndex((d) => d.id === dose.nextDoseId)
      if (generatedIndex !== -1) doseLogs.splice(generatedIndex, 1)
    }
    dose.status = dose.previousStatus || 'upcoming'
    dose.previousStatus = undefined
    dose.takenAt = null
    dose.nextDoseId = undefined
  }
  return dose
}

// ---- Links (patient <-> caretaker) ----

/** Creates a pending invite. `method` is 'email' | 'code'. Returns the invite record. */
export async function createInvite({ fromUserId, method, targetEmail }) {
  await delay(150)
  const invite = {
    id: nextId('inv'),
    fromUserId,
    method,
    targetEmail: targetEmail || null,
    code: method === 'code' ? Math.random().toString(36).slice(2, 8).toUpperCase() : null,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  invites.push(invite)
  return invite
}

export async function acceptInvite({ code, userId }) {
  await delay(150)
  const invite = invites.find((i) => i.code === code && i.status === 'pending')
  if (!invite) {
    throw new Error('That code doesn\u2019t match an active invite. Double check and try again.')
  }
  invite.status = 'accepted'
  links.push({
    id: nextId('link'),
    patientId: invite.fromUserId,
    caretakerId: userId,
    status: 'active',
  })
  return invite
}

/** Removes a patient<->caretaker link (e.g. patient removing a caretaker). */
export async function removeLink(linkId) {
  await delay(150)
  const index = links.findIndex((l) => l.id === linkId)
  if (index !== -1) links.splice(index, 1)
}

/**
 * Returns links resolved with the other party's display info, shaped
 * the way a SQL join would return it from the real backend:
 *   asPatient:   caretakers watching this user
 *   asCaretaker: patients this user watches
 */
export async function getLinksForUser(userId) {
  await delay()
  const asPatient = links
    .filter((l) => l.patientId === userId)
    .map((l) => ({ ...l, otherUser: users.find((u) => u.id === l.caretakerId) }))
  const asCaretaker = links
    .filter((l) => l.caretakerId === userId)
    .map((l) => ({ ...l, otherUser: users.find((u) => u.id === l.patientId) }))
  return { asPatient, asCaretaker }
}

// ---- Users / roles ----

export async function updateUserRoles(userId, { isPatient, isCaretaker }) {
  await delay(150)
  const user = users.find((u) => u.id === userId)
  if (user) {
    if (isPatient !== undefined) user.isPatient = isPatient
    if (isCaretaker !== undefined) user.isCaretaker = isCaretaker
  }
  return user
}
