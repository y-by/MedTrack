import { useState } from 'react'
import Card from '../ui/Card'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'
import Icon from '../ui/Icon'
import ScheduleFields from './ScheduleFields'
import { formatScheduleLabel } from '../../lib/scheduleUtils'
import './MedicationForm.css'

const TYPE_OPTIONS = [
  { value: 'pill', label: 'Pill' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'drops', label: 'Drops' },
  { value: 'other', label: 'Other' },
]

function valuesFromMedication(medication) {
  if (!medication) {
    return {
      name: '',
      type: 'pill',
      otherTypeLabel: '',
      dosage: '',
      instructions: '',
      scheduleType: 'daily',
      scheduleTimes: ['08:00'],
      scheduleIntervalHours: '8',
      scheduleStartTime: '08:00',
      scheduleAsNeededGapHours: '',
    }
  }
  return {
    name: medication.name || '',
    type: medication.type || 'pill',
    otherTypeLabel: medication.otherTypeLabel || '',
    dosage: medication.dosage || '',
    instructions: medication.instructions || '',
    scheduleType: medication.scheduleType || 'daily',
    scheduleTimes: medication.scheduleTimes?.length ? medication.scheduleTimes : ['08:00'],
    scheduleIntervalHours: medication.scheduleIntervalHours ? String(medication.scheduleIntervalHours) : '8',
    scheduleStartTime: medication.scheduleStartTime || '08:00',
    scheduleAsNeededGapHours: medication.scheduleAsNeededGapHours ? String(medication.scheduleAsNeededGapHours) : '',
  }
}

/**
 * Inline form for adding or editing a medication (pass `medication` to
 * edit), matching the app's existing pattern of forms rendered inside a
 * Card rather than an overlay.
 */
export default function MedicationForm({
  medication,
  onSubmit,
  onCancel,
  isSubmitting = false,
  onDelete,
  isDeleting = false,
}) {
  const [values, setValues] = useState(() => valuesFromMedication(medication))
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const isEditing = Boolean(medication)

  function patch(update) {
    setValues((current) => ({ ...current, ...update }))
  }

  function handleChange(field) {
    return (e) => patch({ [field]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      name: values.name.trim(),
      type: values.type,
      otherTypeLabel: values.type === 'other' ? values.otherTypeLabel.trim() || null : null,
      dosage: values.dosage.trim() || null,
      instructions: values.instructions.trim() || null,
      scheduleType: values.scheduleType,
      scheduleTimes: values.scheduleType === 'daily' ? values.scheduleTimes.filter(Boolean) : null,
      scheduleIntervalHours: values.scheduleType === 'interval' ? Number(values.scheduleIntervalHours) || null : null,
      scheduleStartTime: values.scheduleType === 'interval' ? values.scheduleStartTime : null,
      scheduleAsNeededGapHours:
        values.scheduleType === 'as_needed' ? Number(values.scheduleAsNeededGapHours) || null : null,
      scheduleLabel: formatScheduleLabel(values),
    })
  }

  return (
    <Card
      as="form"
      className="med-form"
      onSubmit={handleSubmit}
      aria-label={isEditing ? `Edit ${medication.name}` : 'Add a medication'}
    >
      <Input label="Medication name" value={values.name} onChange={handleChange('name')} autoFocus required />
      <Select label="Type" value={values.type} onChange={handleChange('type')} options={TYPE_OPTIONS} />
      {values.type === 'other' && (
        <Input
          label="What kind of medication is it?"
          hint="Optional — e.g. Inhaler, Injection, Patch"
          value={values.otherTypeLabel}
          onChange={handleChange('otherTypeLabel')}
        />
      )}
      <Input
        label="Dosage"
        hint="e.g. 500mg, 1 capsule"
        value={values.dosage}
        onChange={handleChange('dosage')}
      />

      <ScheduleFields values={values} onChange={patch} />

      <Textarea
        label="Instructions"
        hint="Optional"
        value={values.instructions}
        onChange={handleChange('instructions')}
      />
      <div className="med-form__actions">
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {isEditing ? 'Save changes' : 'Save medication'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>

      {isEditing && onDelete && (
        <div className="med-form__delete">
          {confirmingDelete ? (
            <div className="med-form__actions">
              <Button
                type="button"
                variant="danger"
                onClick={onDelete}
                loading={isDeleting}
                aria-label={`Confirm delete ${medication.name}`}
              >
                Confirm delete
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setConfirmingDelete(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="danger"
              onClick={() => setConfirmingDelete(true)}
              aria-label={`Delete ${medication.name}`}
            >
              <Icon name="trash" size={18} />
              Delete medication
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}
