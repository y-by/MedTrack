import { forwardRef } from 'react'
import './Button.css'

/**
 * Base button primitive. Every interactive control in the app should
 * route through this (or Button-based components) so focus states,
 * touch target size, and disabled/loading semantics stay consistent.
 */
const Button = forwardRef(function Button(
  {
    variant = 'primary', // primary | secondary | ghost | danger
    size = 'md', // md | lg
    fullWidth = false,
    loading = false,
    disabled = false,
    iconOnly = false,
    children,
    type = 'button',
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`btn btn--${variant} btn--${size}${fullWidth ? ' btn--full' : ''}${iconOnly ? ' btn--icon-only' : ''}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      <span className={`btn__label${loading ? ' btn__label--loading' : ''}`}>{children}</span>
    </button>
  )
})

export default Button
