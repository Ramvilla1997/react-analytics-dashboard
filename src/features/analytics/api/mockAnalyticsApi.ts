import { dashboardSchema, type Dashboard, type OrderStatus, type RangeDays } from '../types.js';
import type { AnalyticsApi } from './analyticsApi.js';

const CHANNELS = ['Organic search', 'Paid social', 'Email', 'Partners', 'Direct'] as const;
const CUSTOMERS = ['Ada Labs', 'Brightline', 'Cobalt Works', 'Delta Foods', 'Evergreen', 'Fjord Analytics'];
const END_DATE = Date.UTC(2026, 2, 31);
const DAY_MS = 86_400_000;

/** Small seeded PRNG so every visitor sees the same numbers. */
function createRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function isoDate(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function buildDataset(): Dashboard {
  const random = createRandom(20260331);
  const daily: Dashboard['daily'] = [];
  const orders: Dashboard['orders'] = [];

  for (let offset = 89; offset >= 0; offset -= 1) {
    const timestamp = END_DATE - offset * DAY_MS;
    const weekday = new Date(timestamp).getUTCDay();
    const weekendFactor = weekday === 0 || weekday === 6 ? 0.6 : 1;
    const orderCount = Math.round((8 + random() * 10) * weekendFactor);
    let revenue = 0;

    for (let index = 0; index < orderCount; index += 1) {
      const channel = CHANNELS[Math.floor(random() * CHANNELS.length)] ?? 'Direct';
      const amount = Math.round((40 + random() * 460) * 100) / 100;
      const roll = random();
      const status: OrderStatus = roll < 0.08 ? 'refunded' : roll < 0.14 ? 'pending' : 'paid';

      revenue += status === 'paid' ? amount : 0;
      orders.push({
        id: `ord_${timestamp}_${index}`,
        placedAt: isoDate(timestamp),
        customer: CUSTOMERS[Math.floor(random() * CUSTOMERS.length)] ?? 'Unknown',
        channel,
        amount,
        status,
      });
    }

    daily.push({ date: isoDate(timestamp), revenue: Math.round(revenue * 100) / 100, orders: orderCount });
  }

  return dashboardSchema.parse({ daily, channels: [], orders });
}

const DATASET = buildDataset();

function channelRevenue(orders: Dashboard['orders']): Dashboard['channels'] {
  const totals = new Map<string, number>(CHANNELS.map((channel) => [channel, 0]));
  for (const order of orders) {
    if (order.status === 'paid') {
      totals.set(order.channel, (totals.get(order.channel) ?? 0) + order.amount);
    }
  }
  return [...totals.entries()]
    .map(([channel, revenue]) => ({ channel, revenue: Math.round(revenue * 100) / 100 }))
    .sort((a, b) => b.revenue - a.revenue);
}

export class MockAnalyticsApi implements AnalyticsApi {
  constructor(private readonly latencyMs = 350) {}

  async getDashboard(days: RangeDays, signal?: AbortSignal): Promise<Dashboard> {
    await delay(this.latencyMs, signal);

    const daily = DATASET.daily.slice(-days);
    const firstDate = daily[0]?.date ?? '';
    const orders = DATASET.orders.filter((order) => order.placedAt >= firstDate);

    return dashboardSchema.parse({ daily, channels: channelRevenue(orders), orders });
  }
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}
