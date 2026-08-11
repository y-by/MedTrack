import { useId } from 'react'
import './Input.css'

/**
 * Labeled multi-line text field. Shares field styling with Input so
 * mixed forms stay visually consistent.
 */
export default function Textarea({ label, hint, error, id, rows = 3, ...rest }) {
  const autoId = useId()
  const inputId = id || autoId
  const hintId = hint ? `${inputId}-hint` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="field">
      <label htmlFor={inputId} className="field__label">
        {label}
      </label>
      {hint && (
        <span id={hintId} className="field__hint">
          {hint}
        </span>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={`field__input field__input--textarea${error ? ' field__input--error' : ''}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {error && (
        <span id={errorId} className="field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
