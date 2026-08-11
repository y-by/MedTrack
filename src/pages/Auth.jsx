import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Icon from '../components/ui/Icon'
import Card from '../components/ui/Card'
import './Auth.css'

export default function Auth() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [pending, setPending] = useState(null) // 'google' | 'email' | null

  async function handleGoogle() {
    setPending('google')
    await login({ provider: 'google', asSeedUserId: 'user_patient_1' })
    navigate('/', { replace: true })
  }

  async function handleEmail(e) {
    e.preventDefault()
    setPending('email')
    await login({ provider: 'email', asSeedUserId: 'user_patient_1' })
    navigate('/', { replace: true })
  }

  return (
    <main id="main-content" className="app-shell auth-page">
      <div className="auth-page__intro">
        <h1>MedTrack</h1>
        <p>Keep track of medications, together with the people who care for you.</p>
      </div>

      <Card className="auth-card">
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          loading={pending === 'google'}
          disabled={pending !== null && pending !== 'google'}
          onClick={handleGoogle}
        >
          <Icon name="google" size={20} />
          Continue with Google
        </Button>

        <div className="auth-divider" role="separator" aria-label="or">
          <span>or</span>
        </div>

        <form onSubmit={handleEmail}>
          <Input
            label="Email address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={pending === 'email'}
            disabled={pending !== null && pending !== 'email'}
          >
            <Icon name="mail" size={20} />
            Continue with email
          </Button>
        </form>
      </Card>

      <p className="auth-page__note">
        Demo mode: any sign-in method logs you in as a sample patient account. Real Google and
        email authentication connect once the backend is wired up.
      </p>
    </main>
  )
}
