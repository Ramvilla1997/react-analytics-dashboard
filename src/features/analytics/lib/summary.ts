import type { Dashboard } from '../types.js';

export interface Summary {
  revenue: number;
  orders: number;
  averageOrderValue: number;
  refundRate: number;
}

/** Pure so the numbers on the page can be tested without rendering anything. */
export function summarize({ daily, orders }: Pick<Dashboard, 'daily' | 'orders'>): Summary {
  const revenue = roundToCents(daily.reduce((total, day) => total + day.revenue, 0));
  const orderCount = daily.reduce((total, day) => total + day.orders, 0);
  const paidOrders = orders.filter((order) => order.status === 'paid');
  const paidTotal = paidOrders.reduce((total, order) => total + order.amount, 0);
  const refunded = orders.filter((order) => order.status === 'refunded').length;

  return {
    revenue,
    orders: orderCount,
    averageOrderValue: paidOrders.length === 0 ? 0 : roundToCents(paidTotal / paidOrders.length),
    refundRate: orders.length === 0 ? 0 : refunded / orders.length,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 }).format(value);
}

function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}
