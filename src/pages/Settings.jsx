import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useLinks, useCreateInvite, useAcceptInvite, useRemoveLink } from '../hooks/useLinks'
import { useUpdateRoles } from '../hooks/useUpdateRoles'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Icon from '../components/ui/Icon'
import Spinner from '../components/Spinner'
import './Settings.css'

const THEME_OPTIONS = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

export default function Settings() {
  const { user, logout, refreshUser } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const { data: links, isLoading: linksLoading } = useLinks(user.id)
  const createInvite = useCreateInvite()
  const updateRoles = useUpdateRoles()
  const acceptInvite = useAcceptInvite(user.id)
  const removeLink = useRemoveLink(user.id)

  const [inviteResult, setInviteResult] = useState(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState(null)
  const [confirmingRemoveId, setConfirmingRemoveId] = useState(null)

  async function handleToggleRole(key) {
    await updateRoles.mutateAsync({ userId: user.id, roles: { [key]: !user[key] } })
    refreshUser()
  }

  async function handleInviteByCode() {
    const invite = await createInvite.mutateAsync({ fromUserId: user.id, method: 'code' })
    setInviteResult(invite)
  }

  async function handleInviteByEmail(e) {
    e.preventDefault()
    const invite = await createInvite.mutateAsync({
      fromUserId: user.id,
      method: 'email',
      targetEmail: inviteEmail,
    })
    setInviteResult(invite)
  }

  async function handleJoinWithCode(e) {
    e.preventDefault()
    setJoinError(null)
    try {
      await acceptInvite.mutateAsync(joinCode.trim().toUpperCase())
      setJoinCode('')
    } catch (err) {
      setJoinError(err.message)
    }
  }

  async function handleRemoveCaretaker(linkId) {
    await removeLink.mutateAsync(linkId)
    setConfirmingRemoveId(null)
  }

  async function handleLogout() {
    await logout()
    navigate('/auth', { replace: true })
  }

  return (
    <main id="main-content" className="app-shell">
      <h1>Settings</h1>

      <section aria-labelledby="account-heading" className="settings-section">
        <h2 id="account-heading">Account</h2>
        <Card className="settings-account">
          <p className="settings-account__name">{user.displayName}</p>
          <p className="settings-account__email">{user.email}</p>
          <Button variant="ghost" onClick={handleLogout}>
            <Icon name="logout" size={18} />
            Log out
          </Button>
        </Card>
      </section>

      <section aria-labelledby="appearance-heading" className="settings-section">
        <h2 id="appearance-heading">Appearance</h2>
        <Card>
          <Select
            label="Theme"
            hint="System matches your device's setting, and updates automatically if it changes."
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            options={THEME_OPTIONS}
          />
        </Card>
      </section>

      <section aria-labelledby="roles-heading" className="settings-section">
        <h2 id="roles-heading">Roles</h2>
        <Card className="settings-roles">
          <label className="settings-toggle">
            <span>
              <span className="settings-toggle__title">Track my own medications</span>
              <span className="settings-toggle__description">Show a patient dashboard for you.</span>
            </span>
            <input
              type="checkbox"
              checked={user.isPatient}
              onChange={() => handleToggleRole('isPatient')}
              aria-describedby="patient-role-desc"
            />
          </label>
          <label className="settings-toggle">
            <span>
              <span className="settings-toggle__title">Care for someone else</span>
              <span className="settings-toggle__description">Show a caretaker view for people linked to you.</span>
            </span>
            <input
              type="checkbox"
              checked={user.isCaretaker}
              onChange={() => handleToggleRole('isCaretaker')}
            />
          </label>
        </Card>
      </section>

      {user.isPatient && (
        <section aria-labelledby="invite-heading" className="settings-section">
          <h2 id="invite-heading">Link a caretaker</h2>
          <Card>
            <p className="settings-section__hint">
              Share a code or send an email invite so someone can follow your medications.
            </p>
            <Button variant="secondary" onClick={handleInviteByCode} loading={createInvite.isPending}>
              Generate a code
            </Button>
            <form onSubmit={handleInviteByEmail} className="settings-inline-form">
              <Input
                label="Or invite by email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
              <Button type="submit" variant="secondary" loading={createInvite.isPending}>
                Send invite
              </Button>
            </form>
            {inviteResult && (
              <p className="settings-invite-result" role="status">
                {inviteResult.code
                  ? `Share this code: ${inviteResult.code}`
                  : `Invite sent to ${inviteResult.targetEmail}.`}
              </p>
            )}
          </Card>
        </section>
      )}

      {user.isCaretaker && (
        <section aria-labelledby="join-heading" className="settings-section">
          <h2 id="join-heading">Link to a patient</h2>
          <Card>
            <form onSubmit={handleJoinWithCode} className="settings-inline-form">
              <Input
                label="Enter their code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                error={joinError}
                required
              />
              <Button type="submit" variant="secondary" loading={acceptInvite.isPending}>
                Link
              </Button>
            </form>
          </Card>
        </section>
      )}

      <section aria-labelledby="links-heading" className="settings-section">
        <h2 id="links-heading">Linked people</h2>
        {linksLoading ? (
          <Spinner label="Loading linked people" />
        ) : (
          <>
            {user.isPatient && (
              <Card className="settings-link-list">
                <h3>Your caretakers</h3>
                {links?.asPatient?.length ? (
                  <ul className="settings-link-list__ul--removable">
                    {links.asPatient.map((l) => (
                      <li key={l.id} className="settings-link-list__item">
                        <span>{l.otherUser?.displayName}</span>
                        {confirmingRemoveId === l.id ? (
                          <span className="settings-link-list__confirm">
                            <Button
                              variant="danger"
                              onClick={() => handleRemoveCaretaker(l.id)}
                              loading={removeLink.isPending && removeLink.variables === l.id}
                              aria-label={`Confirm remove ${l.otherUser?.displayName}`}
                            >
                              Confirm
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => setConfirmingRemoveId(null)}
                              disabled={removeLink.isPending}
                            >
                              Cancel
                            </Button>
                          </span>
                        ) : (
                          <Button
                            variant="danger"
                            onClick={() => setConfirmingRemoveId(l.id)}
                            aria-label={`Remove ${l.otherUser?.displayName} as your caretaker`}
                          >
                            Remove
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="settings-section__hint">No caretakers linked yet.</p>
                )}
              </Card>
            )}
            {user.isCaretaker && (
              <Card className="settings-link-list">
                <h3>People you care for</h3>
                {links?.asCaretaker?.length ? (
                  <ul>
                    {links.asCaretaker.map((l) => (
                      <li key={l.id}>{l.otherUser?.displayName}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="settings-section__hint">No one linked yet.</p>
                )}
              </Card>
            )}
          </>
        )}
      </section>
    </main>
  )
}
