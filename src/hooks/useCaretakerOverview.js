import { useQuery } from '@tanstack/react-query'
import { getCaretakerOverview } from '../lib/api'

export function useCaretakerOverview(caretakerId) {
  return useQuery({
    queryKey: ['caretakerOverview', caretakerId],
    queryFn: () => getCaretakerOverview(caretakerId),
    enabled: Boolean(caretakerId),
  })
}
