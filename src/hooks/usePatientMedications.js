import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPatientMedications,
  markDoseTaken,
  markDoseNotTaken,
  createMedication,
  updateMedication,
  deleteMedication,
} from '../lib/api'

export function usePatientMedications(patientId) {
  return useQuery({
    queryKey: ['patientMedications', patientId],
    queryFn: () => getPatientMedications(patientId),
    enabled: Boolean(patientId),
  })
}

export function useMarkDoseNotTaken(patientId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (doseId) => markDoseNotTaken(doseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientMedications', patientId] })
      queryClient.invalidateQueries({ queryKey: ['caretakerOverview'] })
    },
  })
}

export function useCreateMedication(patientId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (medication) => createMedication({ patientId, ...medication }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientMedications', patientId] })
      queryClient.invalidateQueries({ queryKey: ['caretakerOverview'] })
    },
  })
}

export function useUpdateMedication(patientId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ medicationId, ...updates }) => updateMedication(medicationId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientMedications', patientId] })
      queryClient.invalidateQueries({ queryKey: ['caretakerOverview'] })
    },
  })
}

export function useDeleteMedication(patientId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (medicationId) => deleteMedication(medicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientMedications', patientId] })
      queryClient.invalidateQueries({ queryKey: ['caretakerOverview'] })
    },
  })
}

export function useMarkDoseTaken(patientId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (doseId) => markDoseTaken(doseId),
    onSuccess: () => {
      // Targeted invalidation, not a global refetch-everything.
      queryClient.invalidateQueries({ queryKey: ['patientMedications', patientId] })
      queryClient.invalidateQueries({ queryKey: ['caretakerOverview'] })
    },
  })
}
