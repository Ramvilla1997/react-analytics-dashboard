import type { Dashboard, RangeDays } from '../types.js';

/** The seam between the UI and data. The mock and a real HTTP client both implement it. */
export interface AnalyticsApi {
  getDashboard(days: RangeDays, signal?: AbortSignal): Promise<Dashboard>;
}

export class HttpAnalyticsApi implements AnalyticsApi {
  constructor(private readonly baseUrl: string) {}

  async getDashboard(days: RangeDays, signal?: AbortSignal): Promise<Dashboard> {
    const response = await fetch(`${this.baseUrl}/analytics/dashboard?days=${days}`, { signal });
    if (!response.ok) {
      throw new Error(`Dashboard request failed with status ${response.status}`);
    }
    return (await response.json()) as Dashboard;
  }
}
