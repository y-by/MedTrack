import Badge from '../ui/Badge'
import Icon from '../ui/Icon'

const STATUS_CONFIG = {
  upcoming: { tone: 'neutral', icon: 'clock', label: 'Upcoming' },
  due: { tone: 'due', icon: 'clock', label: 'Due now' },
  overdue: { tone: 'overdue', icon: 'alert', label: 'Overdue' },
  taken: { tone: 'taken', icon: 'checkCircle', label: 'Taken' },
}

/** @param {string} status */
export default function DoseStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.upcoming
  return (
    <Badge tone={config.tone} icon={<Icon name={config.icon} size={16} />}>
      {config.label}
    </Badge>
  )
}
