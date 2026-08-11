import { QueryClient } from '@tanstack/react-query'

/**
 * No live push/polling in MVP, so we deliberately don't refetch
 * aggressively — every refetch will eventually cost a Netlify Function
 * invocation + DB read. Data refreshes on navigation/mount or an
 * explicit user action (pull-to-refresh, mark-as-taken), not on a timer.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 60s — dashboard data doesn't need to be second-fresh
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
})
