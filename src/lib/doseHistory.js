function isSameLocalDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/**
 * Splits a medication's taken doses into "most recent taken today" and
 * "all of yesterday's taken doses", by LOCAL calendar day (not UTC —
 * matters near local midnight). Computed at query time, so the
 * yesterday rollover takes effect on next fetch/refetch rather than
 * live — consistent with this app's low-polling React Query setup.
 */
export function summarizeDoseHistory(takenDoses, now = new Date()) {
  const yesterdayRef = new Date(now)
  yesterdayRef.setDate(yesterdayRef.getDate() - 1)

  const today = []
  const yesterday = []
  for (const dose of takenDoses) {
    const takenAt = new Date(dose.takenAt)
    if (isSameLocalDay(takenAt, now)) today.push(dose)
    else if (isSameLocalDay(takenAt, yesterdayRef)) yesterday.push(dose)
  }
  today.sort((a, b) => new Date(a.takenAt) - new Date(b.takenAt))
  yesterday.sort((a, b) => new Date(a.takenAt) - new Date(b.takenAt))

  return { lastTaken: today.at(-1) || null, yesterday }
}
