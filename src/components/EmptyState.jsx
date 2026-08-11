import Icon from './ui/Icon'
import './EmptyState.css'

export default function EmptyState({ icon = 'pill', title, description, action }) {
  return (
    <div className="empty-state" role="status">
      <span className="empty-state__icon" aria-hidden="true">
        <Icon name={icon} size={28} />
      </span>
      <h2 className="empty-state__title">{title}</h2>
      {description && <p className="empty-state__description">{description}</p>}
      {action}
    </div>
  )
}
