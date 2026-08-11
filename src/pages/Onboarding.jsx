import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUpdateRoles } from '../hooks/useUpdateRoles'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import './Onboarding.css'

const ROLE_OPTIONS = [
  {
    key: 'isPatient',
    icon: 'user',
    title: "I'm tracking my own medications",
    description: 'See your own dashboard and mark doses as taken.',
  },
  {
    key: 'isCaretaker',
    icon: 'users',
    title: "I'm caring for someone else",
    description: 'Monitor medication schedules for one or more people you support.',
  },
]

export default function Onboarding() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const updateRoles = useUpdateRoles()
  const [selected, setSelected] = useState({
    isPatient: user?.isPatient ?? false,
    isCaretaker: user?.isCaretaker ?? false,
  })

  function toggle(key) {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  async function handleContinue() {
    await updateRoles.mutateAsync({ userId: user.id, roles: selected })
    refreshUser()
    navigate('/', { replace: true })
  }

  const canContinue = selected.isPatient || selected.isCaretaker

  return (
    <main id="main-content" className="app-shell onboarding-page">
      <h1>Welcome to MedTrack</h1>
      <p className="onboarding-page__intro">
        Choose how you'll use MedTrack to start. You can add the other role later from Settings.
      </p>

      <fieldset className="onboarding-page__options">
        <legend className="sr-only">Select your role</legend>
        {ROLE_OPTIONS.map((option) => {
          const isChecked = selected[option.key]
          return (
            <Card
              as="label"
              key={option.key}
              className={`role-option${isChecked ? ' role-option--selected' : ''}`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggle(option.key)}
                className="role-option__checkbox"
              />
              <span className="role-option__icon" aria-hidden="true">
                <Icon name={option.icon} size={22} />
              </span>
              <span>
                <span className="role-option__title">{option.title}</span>
                <span className="role-option__description">{option.description}</span>
              </span>
              {isChecked && (
                <span className="role-option__check" aria-hidden="true">
                  <Icon name="check" size={18} />
                </span>
              )}
            </Card>
          )
        })}
      </fieldset>

      <Button
        size="lg"
        fullWidth
        disabled={!canContinue}
        loading={updateRoles.isPending}
        onClick={handleContinue}
      >
        Continue
      </Button>
    </main>
  )
}
