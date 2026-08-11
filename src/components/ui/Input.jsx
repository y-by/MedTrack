import { useId } from 'react'
import './Input.css'

/**
 * Labeled text input. Always renders a real <label>, never a
 * placeholder-only field, and wires up aria-describedby for hint/error
 * text automatically.
 */
export default function Input({ label, hint, error, id, ...rest }) {
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
      <input
        id={inputId}
        className={`field__input${error ? ' field__input--error' : ''}`}
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
