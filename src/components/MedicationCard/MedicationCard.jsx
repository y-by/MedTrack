import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import Icon from '../ui/Icon'
import DoseStatusBadge from './DoseStatusBadge'
import { formatTimeOfDay } from '../../lib/scheduleUtils'
import './MedicationCard.css'

const TYPE_LABEL = {
  pill: 'Pill',
  drops: 'Drops',
  capsule: 'Capsule',
  other: 'Medication',
}

function formatTime(iso) {
  if (!iso) return null
  return formatTimeOfDay(new Date(iso))
}

/**
 * The core content unit of both dashboards. Deliberately high-contrast
 * and generously spaced — this is often read by someone unwell, so
 * clarity beats density every time.
 *
 * @param {object} medication - { id, name, type, dosage, scheduleLabel, instructions }
 * @param {object} dose - { status, scheduledFor } — the current, not-yet-taken dose
 * @param {object} [lastTaken] - { id, takenAt } — most recently taken dose today
 * @param {object[]} [yesterday] - [{ id, takenAt }] — all of yesterday's taken doses
 * @param {string} [patientName] - shown in caretaker view to identify whose card this is
 * @param {(medicationId: string) => void} [onMarkTaken] - omit to render read-only (caretaker view)
 * @param {boolean} [isMarking] - shows loading state on the action button
 * @param {(doseId: string) => void} [onUndoLastTaken] - omit to render read-only (caretaker view)
 * @param {boolean} [isUndoingLastTaken]
 * @param {(medicationId: string) => void} [onEdit] - omit to render read-only (caretaker view)
 */
export default function MedicationCard({
  medication,
  dose,
  lastTaken,
  yesterday,
  patientName,
  onMarkTaken,
  isMarking = false,
  onUndoLastTaken,
  isUndoingLastTaken = false,
  onEdit,
}) {
  const { id, name, type, otherTypeLabel, dosage, scheduleLabel, instructions } = medication
  const typeLabel = type === 'other' && otherTypeLabel ? otherTypeLabel : TYPE_LABEL[type] || 'Medication'
  const nextTime = formatTime(dose?.scheduledFor)
  const headingId = `med-${id}-name`
  const hasHistory = Boolean(lastTaken) || Boolean(yesterday?.length)

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
          {dose?.status && <DoseStatusBadge status={dose.status} />}
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

      <div className="med-card__actions">
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

        {hasHistory && (
          <div className="med-card__history">
            {lastTaken && (
              <Badge
                as={onUndoLastTaken ? 'button' : 'span'}
                type={onUndoLastTaken ? 'button' : undefined}
                tone="taken"
                icon={<Icon name="checkCircle" size={16} />}
                className={onUndoLastTaken ? 'badge--interactive' : undefined}
                onClick={onUndoLastTaken ? () => onUndoLastTaken(lastTaken.id) : undefined}
                disabled={onUndoLastTaken ? isUndoingLastTaken : undefined}
                aria-pressed={onUndoLastTaken ? 'true' : undefined}
                aria-label={
                  onUndoLastTaken ? `Taken at ${formatTime(lastTaken.takenAt)} — mark as not taken` : undefined
                }
              >
                Last taken {formatTime(lastTaken.takenAt)}
              </Badge>
            )}
            {yesterday?.length > 0 && (
              <details className="med-card__yesterday">
                <summary>
                  Yesterday ({yesterday.length} {yesterday.length === 1 ? 'dose' : 'doses'})
                </summary>
                <ul>
                  {yesterday.map((d) => (
                    <li key={d.id}>{formatTime(d.takenAt)}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
