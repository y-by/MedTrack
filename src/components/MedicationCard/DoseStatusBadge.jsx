import Badge from '../ui/Badge'
import Icon from '../ui/Icon'

const STATUS_CONFIG = {
  upcoming: { tone: 'neutral', icon: 'clock', label: 'Upcoming' },
  due: { tone: 'due', icon: 'clock', label: 'Due now' },
  overdue: { tone: 'overdue', icon: 'alert', label: 'Overdue' },
  taken: { tone: 'taken', icon: 'checkCircle', label: 'Taken' },
}

/**
 * @param {string} status
 * @param {() => void} [onUndoTaken] - when provided and status is 'taken',
 *   the badge becomes a button that reverts the dose to not-taken.
 * @param {boolean} [isUndoing]
 */
export default function DoseStatusBadge({ status, onUndoTaken, isUndoing = false }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.upcoming
  const icon = <Icon name={config.icon} size={16} />

  if (status === 'taken' && onUndoTaken) {
    return (
      <Badge
        as="button"
        type="button"
        tone={config.tone}
        icon={icon}
        className="badge--interactive"
        onClick={onUndoTaken}
        disabled={isUndoing}
        aria-pressed="true"
        aria-label="Taken — mark as not taken"
      >
        {config.label}
      </Badge>
    )
  }

  return (
    <Badge tone={config.tone} icon={icon}>
      {config.label}
    </Badge>
  )
}
