import './Badge.css'

/**
 * Generic label badge. `tone` maps to token-driven color pairs defined
 * in Badge.css — never pass raw colors in.
 */
export default function Badge({ as: Tag = 'span', tone = 'neutral', icon, children, className = '', ...rest }) {
  return (
    <Tag className={`badge badge--${tone} ${className}`.trim()} {...rest}>
      {icon}
      <span>{children}</span>
    </Tag>
  )
}
