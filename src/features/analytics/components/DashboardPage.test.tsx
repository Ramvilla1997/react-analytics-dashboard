import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AnalyticsApiProvider } from '../api/AnalyticsApiContext.js';
import type { AnalyticsApi } from '../api/analyticsApi.js';
import type { Dashboard, RangeDays } from '../types.js';
import { DashboardPage } from './DashboardPage.js';

const dashboard: Dashboard = {
  daily: [
    { date: '2026-03-01', revenue: 1000, orders: 4 },
    { date: '2026-03-02', revenue: 500, orders: 2 },
  ],
  channels: [{ channel: 'Email', revenue: 1500 }],
  orders: [{ id: '1', placedAt: '2026-03-02', customer: 'Ada Labs', channel: 'Email', amount: 500, status: 'paid' }],
};

function renderPage(api: AnalyticsApi) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AnalyticsApiProvider api={api}>
        <DashboardPage />
      </AnalyticsApiProvider>
    </QueryClientProvider>,
  );
}

describe('DashboardPage', () => {
  it('shows metrics computed from the API response', async () => {
    const api: AnalyticsApi = { getDashboard: vi.fn().mockResolvedValue(dashboard) };
    renderPage(api);

    expect(await screen.findByRole('region', { name: 'Revenue' })).toHaveTextContent('$1,500');
    expect(screen.getByRole('region', { name: 'Orders' })).toHaveTextContent('6');
    expect(screen.getByRole('region', { name: 'Average order' })).toHaveTextContent('$500');
  });

  it('requests the new range when the user changes it', async () => {
    const getDashboard = vi.fn<(days: RangeDays, signal?: AbortSignal) => Promise<Dashboard>>().mockResolvedValue(dashboard);
    renderPage({ getDashboard });
    await screen.findByRole('region', { name: 'Revenue' });

    await userEvent.selectOptions(screen.getByLabelText(/range/i), '90');

    await waitFor(() => expect(getDashboard).toHaveBeenLastCalledWith(90, expect.anything()));
  });

  it('shows an error with a retry action that recovers', async () => {
    const getDashboard = vi
      .fn<(days: RangeDays, signal?: AbortSignal) => Promise<Dashboard>>()
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(dashboard);
    renderPage({ getDashboard });

    expect(await screen.findByRole('alert')).toHaveTextContent('could not be loaded');
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(await screen.findByRole('region', { name: 'Revenue' })).toBeInTheDocument();
    expect(getDashboard).toHaveBeenCalledTimes(2);
  });
});
