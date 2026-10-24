import { createContext, useContext, type ReactNode } from 'react';
import type { AnalyticsApi } from './analyticsApi.js';
import { MockAnalyticsApi } from './mockAnalyticsApi.js';

const AnalyticsApiContext = createContext<AnalyticsApi>(new MockAnalyticsApi());

export function AnalyticsApiProvider({ api, children }: { api: AnalyticsApi; children: ReactNode }) {
  return <AnalyticsApiContext.Provider value={api}>{children}</AnalyticsApiContext.Provider>;
}

export function useAnalyticsApi(): AnalyticsApi {
  return useContext(AnalyticsApiContext);
}
