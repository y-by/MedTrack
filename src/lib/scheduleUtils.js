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

const DUE_WINDOW_MINUTES = 30

function atTime(date, hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(date)
  d.setHours(h, m, 0, 0)
  return d
}

function statusForTime(scheduledFor, from) {
  const diffMinutes = (scheduledFor - from) / 60000
  if (diffMinutes < 0) return 'overdue'
  if (diffMinutes <= DUE_WINDOW_MINUTES) return 'due'
  return 'upcoming'
}

function nextDailyOccurrence(times, from) {
  const valid = (times || []).filter(Boolean)
  if (!valid.length) return null
  const todayCandidates = valid.map((t) => atTime(from, t)).sort((a, b) => a - b)
  const upcoming = todayCandidates.find((d) => d >= from)
  if (upcoming) return upcoming
  const tomorrow = new Date(todayCandidates[0])
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow
}

function nextIntervalOccurrence(intervalHours, startTime, from) {
  const hours = Number(intervalHours)
  if (!hours || hours <= 0 || !startTime) return null
  const intervalMs = hours * 60 * 60 * 1000
  const anchorMs = atTime(from, startTime).getTime()
  const steps = Math.ceil((from.getTime() - anchorMs) / intervalMs)
  return new Date(anchorMs + steps * intervalMs)
}

/**
 * Computes the next dose's scheduledFor/status from a medication's
 * structured schedule fields, so "Next dose" always reflects "Schedule"
 * instead of drifting independently of it. Returns { scheduledFor, status }
 * — scheduledFor is null for 'as_needed' (no fixed time to show).
 */
export function computeNextDose(
  { scheduleType, scheduleTimes, scheduleIntervalHours, scheduleStartTime },
  from = new Date()
) {
  let next = null
  if (scheduleType === 'interval') {
    next = nextIntervalOccurrence(scheduleIntervalHours, scheduleStartTime, from)
  } else if (scheduleType === 'daily') {
    next = nextDailyOccurrence(scheduleTimes, from)
  }

  return next ? { scheduledFor: next.toISOString(), status: statusForTime(next, from) } : { scheduledFor: null, status: 'upcoming' }
}
