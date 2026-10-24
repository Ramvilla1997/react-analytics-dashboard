import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AnalyticsApiProvider } from './features/analytics/api/AnalyticsApiContext.js';
import { HttpAnalyticsApi, type AnalyticsApi } from './features/analytics/api/analyticsApi.js';
import { MockAnalyticsApi } from './features/analytics/api/mockAnalyticsApi.js';
import { DashboardPage } from './features/analytics/components/DashboardPage.js';

function createDefaultApi(): AnalyticsApi {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  return baseUrl ? new HttpAnalyticsApi(baseUrl) : new MockAnalyticsApi();
}

export function App() {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } }),
  );
  const [api] = useState<AnalyticsApi>(createDefaultApi);

  return (
    <QueryClientProvider client={queryClient}>
      <AnalyticsApiProvider api={api}>
        <DashboardPage />
      </AnalyticsApiProvider>
    </QueryClientProvider>
  );
}
