import { useCaretakerOverview } from '../hooks/useCaretakerOverview'
import MedicationCard from '../components/MedicationCard/MedicationCard'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'

export default function CaretakerDashboardView({ caretakerId }) {
  const { data, isLoading, isError } = useCaretakerOverview(caretakerId)

  if (isLoading) return <Spinner label="Loading the people you care for" />
  if (isError) {
    return (
      <EmptyState
        icon="alert"
        title="Couldn't load this view"
        description="Something went wrong. Try refreshing the page."
      />
    )
  }
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon="users"
        title="No one linked yet"
        description="Once someone shares an invite code or link with you, their medications will show up here."
      />
    )
  }

  return (
    <div className="caretaker-groups">
      {data.map(({ patient, medications }) => (
        <section key={patient.id} aria-labelledby={`patient-${patient.id}-heading`}>
          <h2 id={`patient-${patient.id}-heading`} className="caretaker-groups__heading">
            {patient.displayName}
          </h2>
          {medications.length === 0 ? (
            <p className="caretaker-groups__empty">No active medications.</p>
          ) : (
            <ul className="card-list" aria-label={`${patient.displayName}'s medications`}>
              {medications.map(({ medication, dose }) => (
                <li key={medication.id}>
                  <MedicationCard medication={medication} dose={dose} patientName={patient.displayName} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}
