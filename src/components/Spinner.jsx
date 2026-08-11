import './Spinner.css'

/**
 * `label` is announced to screen readers via aria-live; the spinner
 * graphic itself is decorative (aria-hidden).
 */
export default function Spinner({ label = 'Loading' }) {
  return (
    <div className="spinner-block" role="status" aria-live="polite">
      <span className="spinner-block__graphic" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}
