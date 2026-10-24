import { useQuery } from '@tanstack/react-query';
import { useAnalyticsApi } from '../api/AnalyticsApiContext.js';
import type { RangeDays } from '../types.js';

export function useDashboard(days: RangeDays) {
  const api = useAnalyticsApi();
  return useQuery({
    queryKey: ['analytics', 'dashboard', days],
    queryFn: ({ signal }) => api.getDashboard(days, signal),
    staleTime: 60_000,
  });
}
