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
import { delay, nextId, hoursFromNow, users, links, medications, doseLogs, invites } from './mockData'

// ---- Medications ----

/** Returns [{ medication, dose }] for a patient, dose = the next relevant dose log. */
export async function getPatientMedications(patientId) {
  await delay()
  return medications
    .filter((m) => m.patientId === patientId && m.active)
    .map((medication) => ({
      medication,
      dose: doseLogs.find((d) => d.medicationId === medication.id) || null,
    }))
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

  const dose = {
    id: nextId('dose'),
    medicationId: medication.id,
    scheduledFor: hoursFromNow(1),
    status: 'upcoming',
    takenAt: null,
  }
  doseLogs.push(dose)

  return { medication, dose }
}

/** Updates an existing medication's editable fields in place. Returns the updated medication. */
export async function updateMedication(medicationId, updates) {
  await delay(150)
  const medication = medications.find((m) => m.id === medicationId)
  if (medication) Object.assign(medication, updates)
  return medication
}

/** Soft-deletes a medication (excluded from active lists, dose history preserved). */
export async function deleteMedication(medicationId) {
  await delay(150)
  const medication = medications.find((m) => m.id === medicationId)
  if (medication) medication.active = false
  return medication
}

/** Returns [{ patient, medications: [{medication, dose}] }] for everyone linked to a caretaker. */
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

export async function markDoseTaken(doseId) {
  await delay(150)
  const dose = doseLogs.find((d) => d.id === doseId)
  if (dose) {
    dose.previousStatus = dose.status
    dose.status = 'taken'
    dose.takenAt = new Date().toISOString()
  }
  return dose
}

/** Reverts a dose from 'taken' back to its status beforehand (undo). */
export async function markDoseNotTaken(doseId) {
  await delay(150)
  const dose = doseLogs.find((d) => d.id === doseId)
  if (dose) {
    dose.status = dose.previousStatus || 'upcoming'
    dose.previousStatus = undefined
    dose.takenAt = null
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
