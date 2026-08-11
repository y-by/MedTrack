import { useMutation } from '@tanstack/react-query'
import { updateUserRoles } from '../lib/api'

export function useUpdateRoles() {
  return useMutation({
    mutationFn: ({ userId, roles }) => updateUserRoles(userId, roles),
  })
}
