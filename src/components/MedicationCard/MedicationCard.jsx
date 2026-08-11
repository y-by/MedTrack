import Card from '../ui/Card'
import Button from '../ui/Button'
import Icon from '../ui/Icon'
import DoseStatusBadge from './DoseStatusBadge'
import './MedicationCard.css'

const TYPE_LABEL = {
  pill: 'Pill',
  drops: 'Drops',
  capsule: 'Capsule',
  other: 'Medication',
}

function formatTime(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

/**
 * The core content unit of both dashboards. Deliberately high-contrast
 * and generously spaced — this is often read by someone unwell, so
 * clarity beats density every time.
 *
 * @param {object} medication - { id, name, type, dosage, scheduleLabel, instructions }
 * @param {object} dose - { status, scheduledFor } — the next relevant dose
 * @param {string} [patientName] - shown in caretaker view to identify whose card this is
 * @param {(medicationId: string) => void} [onMarkTaken] - omit to render read-only (caretaker view)
 * @param {boolean} [isMarking] - shows loading state on the action button
 * @param {(medicationId: string) => void} [onUndoTaken] - omit to render read-only (caretaker view)
 * @param {boolean} [isUndoing]
 * @param {(medicationId: string) => void} [onEdit] - omit to render read-only (caretaker view)
 */
export default function MedicationCard({
  medication,
  dose,
  patientName,
  onMarkTaken,
  isMarking = false,
  onUndoTaken,
  isUndoing = false,
  onEdit,
}) {
  const { id, name, type, otherTypeLabel, dosage, scheduleLabel, instructions } = medication
  const typeLabel = type === 'other' && otherTypeLabel ? otherTypeLabel : TYPE_LABEL[type] || 'Medication'
  const nextTime = formatTime(dose?.scheduledFor)
  const headingId = `med-${id}-name`

  return (
    <Card as="article" className="med-card" aria-labelledby={headingId}>
      <div className="med-card__top">
        <div className="med-card__identity">
          {patientName && <p className="med-card__patient">{patientName}</p>}
          <h3 id={headingId} className="med-card__name">
            {name}
          </h3>
          <p className="med-card__type">
            {typeLabel}
            {dosage ? ` · ${dosage}` : ''}
          </p>
        </div>
        <div className="med-card__top-actions">
          {onEdit && (
            <Button variant="ghost" iconOnly onClick={() => onEdit(id)} aria-label={`Edit ${name}`}>
              <Icon name="edit" size={18} />
            </Button>
          )}
          {dose?.status && (
            <DoseStatusBadge
              status={dose.status}
              onUndoTaken={onUndoTaken ? () => onUndoTaken(id) : undefined}
              isUndoing={isUndoing}
            />
          )}
        </div>
      </div>

      <dl className="med-card__details">
        <div className="med-card__detail">
          <dt>Schedule</dt>
          <dd>{scheduleLabel}</dd>
        </div>
        {nextTime && (
          <div className="med-card__detail">
            <dt>Next dose</dt>
            <dd>{nextTime}</dd>
          </div>
        )}
        {instructions && (
          <div className="med-card__detail med-card__detail--full">
            <dt>Instructions</dt>
            <dd>{instructions}</dd>
          </div>
        )}
      </dl>

      {onMarkTaken && dose?.status !== 'taken' && (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={isMarking}
          onClick={() => onMarkTaken(id)}
          aria-describedby={headingId}
        >
          <Icon name="check" size={20} />
          Mark as taken
        </Button>
      )}

      {dose?.status === 'taken' && (
        <p className="med-card__confirmed">
          <Icon name="checkCircle" size={18} />
          Taken {dose.takenAt ? `at ${formatTime(dose.takenAt)}` : ''}
        </p>
      )}
    </Card>
  )
}
