import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PatientDashboardView from './PatientDashboardView'
import CaretakerDashboardView from './CaretakerDashboardView'
import './Dashboard.css'

export default function Dashboard() {
  const { user } = useAuth()

  if (!user.isPatient && !user.isCaretaker) {
    return <Navigate to="/onboarding" replace />
  }

  const hasBothRoles = user.isPatient && user.isCaretaker
  const [activeTab, setActiveTab] = useState(user.isPatient ? 'patient' : 'caretaker')

  return (
    <main id="main-content" className="app-shell">
      <h1 className="dashboard__heading">Hi, {user.displayName.split(' ')[0]}</h1>

      {hasBothRoles && (
        <div className="tabs" role="tablist" aria-label="Dashboard view">
          <button
            role="tab"
            id="tab-patient"
            aria-selected={activeTab === 'patient'}
            aria-controls="panel-patient"
            className={`tabs__tab${activeTab === 'patient' ? ' tabs__tab--active' : ''}`}
            onClick={() => setActiveTab('patient')}
          >
            My medications
          </button>
          <button
            role="tab"
            id="tab-caretaker"
            aria-selected={activeTab === 'caretaker'}
            aria-controls="panel-caretaker"
            className={`tabs__tab${activeTab === 'caretaker' ? ' tabs__tab--active' : ''}`}
            onClick={() => setActiveTab('caretaker')}
          >
            People I care for
          </button>
        </div>
      )}

      {(!hasBothRoles || activeTab === 'patient') && user.isPatient && (
        <div id="panel-patient" role={hasBothRoles ? 'tabpanel' : undefined} aria-labelledby={hasBothRoles ? 'tab-patient' : undefined}>
          <PatientDashboardView patientId={user.id} />
        </div>
      )}

      {(!hasBothRoles || activeTab === 'caretaker') && user.isCaretaker && (
        <div id="panel-caretaker" role={hasBothRoles ? 'tabpanel' : undefined} aria-labelledby={hasBothRoles ? 'tab-caretaker' : undefined}>
          <CaretakerDashboardView caretakerId={user.id} />
        </div>
      )}
    </main>
  )
}
