import Select from '../ui/Select'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Icon from '../ui/Icon'
import './ScheduleFields.css'

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily, at set times' },
  { value: 'interval', label: 'Every few hours' },
  { value: 'as_needed', label: 'As needed' },
]

/**
 * The time-of-day / interval picker for a medication's schedule. Values
 * are the relevant scheduleType/scheduleTimes/etc. fields from the parent
 * form; onChange merges a partial patch back into that form's state.
 */
export default function ScheduleFields({ values, onChange }) {
  const { scheduleType, scheduleTimes, scheduleIntervalHours, scheduleStartTime, scheduleAsNeededGapHours } = values

  function updateTime(index, value) {
    const next = [...scheduleTimes]
    next[index] = value
    onChange({ scheduleTimes: next })
  }

  function addTime() {
    onChange({ scheduleTimes: [...scheduleTimes, ''] })
  }

  function removeTime(index) {
    onChange({ scheduleTimes: scheduleTimes.filter((_, i) => i !== index) })
  }

  return (
    <div className="schedule-fields">
      <Select
        label="Frequency"
        value={scheduleType}
        onChange={(e) => onChange({ scheduleType: e.target.value })}
        options={FREQUENCY_OPTIONS}
      />

      {scheduleType === 'daily' && (
        <div className="schedule-fields__group">
          <span className="field__label">Time{scheduleTimes.length > 1 ? 's' : ''} of day</span>
          {scheduleTimes.map((time, index) => (
            <div key={index} className="schedule-fields__time-row">
              <input
                type="time"
                className="field__input"
                value={time}
                onChange={(e) => updateTime(index, e.target.value)}
                aria-label={`Time ${index + 1} of day`}
                required
              />
              {scheduleTimes.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  iconOnly
                  onClick={() => removeTime(index)}
                  aria-label={`Remove time ${index + 1}`}
                >
                  <Icon name="close" size={18} />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={addTime}>
            <Icon name="plus" size={18} />
            Add another time
          </Button>
        </div>
      )}

      {scheduleType === 'interval' && (
        <div className="schedule-fields__row">
          <Input
            label="Every how many hours"
            type="number"
            min="1"
            max="24"
            value={scheduleIntervalHours}
            onChange={(e) => onChange({ scheduleIntervalHours: e.target.value })}
            required
          />
          <Input
            label="Start time"
            type="time"
            value={scheduleStartTime}
            onChange={(e) => onChange({ scheduleStartTime: e.target.value })}
            required
          />
        </div>
      )}

      {scheduleType === 'as_needed' && (
        <Input
          label="Minimum hours between doses"
          hint="Optional — leave blank if there's no minimum gap"
          type="number"
          min="1"
          max="24"
          value={scheduleAsNeededGapHours}
          onChange={(e) => onChange({ scheduleAsNeededGapHours: e.target.value })}
        />
      )}
    </div>
  )
}
