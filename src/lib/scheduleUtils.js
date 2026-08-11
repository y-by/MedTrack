/**
 * Turns structured schedule fields into the human-readable `scheduleLabel`
 * stored on the medication, so display never has to reformat structured
 * fields client-side (see db/schema.sql).
 */

function formatTimeLabel(hhmm) {
  if (!hhmm) return ''
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function formatScheduleLabel({
  scheduleType,
  scheduleTimes,
  scheduleIntervalHours,
  scheduleStartTime,
  scheduleAsNeededGapHours,
}) {
  if (scheduleType === 'interval') {
    const hours = Number(scheduleIntervalHours) || 0
    const start = scheduleStartTime ? `, starting ${formatTimeLabel(scheduleStartTime)}` : ''
    return `Every ${hours} hour${hours === 1 ? '' : 's'}${start}`
  }

  if (scheduleType === 'as_needed') {
    const gap = Number(scheduleAsNeededGapHours) || 0
    return gap > 0 ? `As needed, no more than every ${gap} hour${gap === 1 ? '' : 's'}` : 'As needed'
  }

  const times = (scheduleTimes || []).filter(Boolean).map(formatTimeLabel)
  if (times.length === 0) return 'Daily'
  if (times.length === 1) return `Daily at ${times[0]}`
  return `Daily at ${times.slice(0, -1).join(', ')} and ${times[times.length - 1]}`
}
