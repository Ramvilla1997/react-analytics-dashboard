import { describe, expect, it } from 'vitest';
import { formatCurrency, summarize } from './summary.js';

describe('summarize', () => {
  it('totals revenue and orders from the daily series', () => {
    const summary = summarize({
      daily: [
        { date: '2026-03-01', revenue: 100, orders: 2 },
        { date: '2026-03-02', revenue: 50.5, orders: 3 },
      ],
      orders: [],
    });
    expect(summary.revenue).toBe(150.5);
    expect(summary.orders).toBe(5);
  });

  it('computes average order value over paid orders only', () => {
    const summary = summarize({
      daily: [{ date: '2026-03-01', revenue: 300, orders: 3 }],
      orders: [
        { id: '1', placedAt: '2026-03-01', customer: 'A', channel: 'Email', amount: 100, status: 'paid' },
        { id: '2', placedAt: '2026-03-01', customer: 'B', channel: 'Email', amount: 200, status: 'paid' },
        { id: '3', placedAt: '2026-03-01', customer: 'C', channel: 'Email', amount: 999, status: 'refunded' },
      ],
    });
    expect(summary.averageOrderValue).toBe(150);
  });

  it('computes the refund rate across all orders', () => {
    const summary = summarize({
      daily: [],
      orders: [
        { id: '1', placedAt: '2026-03-01', customer: 'A', channel: 'Email', amount: 10, status: 'refunded' },
        { id: '2', placedAt: '2026-03-01', customer: 'B', channel: 'Email', amount: 10, status: 'paid' },
        { id: '3', placedAt: '2026-03-01', customer: 'C', channel: 'Email', amount: 10, status: 'paid' },
        { id: '4', placedAt: '2026-03-01', customer: 'D', channel: 'Email', amount: 10, status: 'paid' },
      ],
    });
    expect(summary.refundRate).toBe(0.25);
  });

  it('returns zeros instead of NaN when there is no data', () => {
    expect(summarize({ daily: [], orders: [] })).toEqual({
      revenue: 0,
      orders: 0,
      averageOrderValue: 0,
      refundRate: 0,
    });
  });
});

describe('formatCurrency', () => {
  it('formats whole US dollars', () => {
    expect(formatCurrency(12345.6)).toBe('$12,346');
  });
});
