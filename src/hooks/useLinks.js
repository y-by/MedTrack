import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLinksForUser, createInvite, acceptInvite, removeLink } from '../lib/api'

export function useLinks(userId) {
  return useQuery({
    queryKey: ['links', userId],
    queryFn: () => getLinksForUser(userId),
    enabled: Boolean(userId),
  })
}

export function useRemoveLink(userId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (linkId) => removeLink(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links', userId] })
      queryClient.invalidateQueries({ queryKey: ['caretakerOverview'] })
    },
  })
}

export function useCreateInvite() {
  return useMutation({
    mutationFn: createInvite,
  })
}

export function useAcceptInvite(userId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (code) => acceptInvite({ code, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links', userId] })
      queryClient.invalidateQueries({ queryKey: ['caretakerOverview', userId] })
    },
  })
}
