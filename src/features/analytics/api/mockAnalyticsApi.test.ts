import { describe, expect, it } from 'vitest';
import { MockAnalyticsApi } from './mockAnalyticsApi.js';

describe('MockAnalyticsApi', () => {
  const api = new MockAnalyticsApi(0);

  it('returns exactly the requested number of days', async () => {
    const dashboard = await api.getDashboard(7);
    expect(dashboard.daily).toHaveLength(7);
    expect(dashboard.daily.at(-1)?.date).toBe('2026-03-31');
  });

  it('keeps only orders inside the requested range', async () => {
    const dashboard = await api.getDashboard(7);
    const earliest = dashboard.daily[0]?.date ?? '';
    expect(dashboard.orders.every((order) => order.placedAt >= earliest)).toBe(true);
  });

  it('is deterministic, so every visitor sees the same numbers', async () => {
    const first = await api.getDashboard(30);
    const second = await api.getDashboard(30);
    expect(second).toEqual(first);
  });

  it('channel revenue equals the paid order total for the range', async () => {
    const dashboard = await api.getDashboard(90);
    const fromChannels = dashboard.channels.reduce((total, channel) => total + channel.revenue, 0);
    const fromOrders = dashboard.orders
      .filter((order) => order.status === 'paid')
      .reduce((total, order) => total + order.amount, 0);
    expect(fromChannels).toBeCloseTo(fromOrders, 1);
  });

  it('rejects when the request is aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(new MockAnalyticsApi(50).getDashboard(7, controller.signal)).rejects.toThrow(/Aborted/);
  });
});
