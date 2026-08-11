import { Link } from 'react-router-dom'
import Icon from './ui/Icon'
import './AppHeader.css'

export default function AppHeader() {
  return (
    <header className="app-header">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="app-header__bar">
        <Link to="/" className="app-header__brand">
          <span className="app-header__logo" aria-hidden="true">
            <Icon name="pill" size={18} />
          </span>
          MedTrack
        </Link>
        <Link to="/settings" className="app-header__settings" aria-label="Settings">
          <Icon name="settings" size={22} />
        </Link>
      </div>
    </header>
  )
}
