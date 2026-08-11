import { useState } from 'react'
import {
  usePatientMedications,
  useMarkDoseTaken,
  useMarkDoseNotTaken,
  useCreateMedication,
  useUpdateMedication,
  useDeleteMedication,
} from '../hooks/usePatientMedications'
import MedicationCard from '../components/MedicationCard/MedicationCard'
import MedicationForm from '../components/MedicationForm/MedicationForm'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'

export default function PatientDashboardView({ patientId }) {
  const { data, isLoading, isError } = usePatientMedications(patientId)
  const markTaken = useMarkDoseTaken(patientId)
  const markNotTaken = useMarkDoseNotTaken(patientId)
  const createMedication = useCreateMedication(patientId)
  const updateMedication = useUpdateMedication(patientId)
  const deleteMedication = useDeleteMedication(patientId)
  const [isAdding, setIsAdding] = useState(false)
  const [editingMedicationId, setEditingMedicationId] = useState(null)

  async function handleAddMedication(values) {
    await createMedication.mutateAsync(values)
    setIsAdding(false)
  }

  async function handleUpdateMedication(medicationId, values) {
    await updateMedication.mutateAsync({ medicationId, ...values })
    setEditingMedicationId(null)
  }

  async function handleDeleteMedication(medicationId) {
    await deleteMedication.mutateAsync(medicationId)
    setEditingMedicationId(null)
  }

  if (isLoading) return <Spinner label="Loading your medications" />
  if (isError) {
    return (
      <EmptyState
        icon="alert"
        title="Couldn't load your medications"
        description="Something went wrong. Try refreshing the page."
      />
    )
  }

  const hasMedications = data && data.length > 0

  return (
    <div>
      {isAdding ? (
        <MedicationForm
          onSubmit={handleAddMedication}
          onCancel={() => setIsAdding(false)}
          isSubmitting={createMedication.isPending}
        />
      ) : (
        <div className="patient-dashboard__actions">
          <Button variant="secondary" onClick={() => setIsAdding(true)} aria-expanded={isAdding}>
            <Icon name="plus" size={20} />
            Add medication
          </Button>
        </div>
      )}

      {hasMedications ? (
        <ul className="card-list" aria-label="Your medications">
          {data.map(({ medication, dose }) => (
            <li key={medication.id}>
              {editingMedicationId === medication.id ? (
                <MedicationForm
                  medication={medication}
                  onSubmit={(values) => handleUpdateMedication(medication.id, values)}
                  onCancel={() => setEditingMedicationId(null)}
                  isSubmitting={updateMedication.isPending}
                  onDelete={() => handleDeleteMedication(medication.id)}
                  isDeleting={deleteMedication.isPending && deleteMedication.variables === medication.id}
                />
              ) : (
                <MedicationCard
                  medication={medication}
                  dose={dose}
                  onMarkTaken={(medId) => dose && markTaken.mutate(dose.id)}
                  isMarking={markTaken.isPending && markTaken.variables === dose?.id}
                  onUndoTaken={(medId) => dose && markNotTaken.mutate(dose.id)}
                  isUndoing={markNotTaken.isPending && markNotTaken.variables === dose?.id}
                  onEdit={(medId) => setEditingMedicationId(medId)}
                />
              )}
            </li>
          ))}
        </ul>
      ) : (
        !isAdding && (
          <EmptyState
            icon="pill"
            title="No medications yet"
            description="Medications you're tracking will show up here as cards you can check off."
          />
        )
      )}
    </div>
  )
}
