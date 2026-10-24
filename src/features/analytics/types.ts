import { z } from 'zod';

export const RANGE_OPTIONS = [7, 30, 90] as const;
export type RangeDays = (typeof RANGE_OPTIONS)[number];

export const ORDER_STATUSES = ['paid', 'pending', 'refunded'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

const dailyPointSchema = z.object({
  date: z.iso.date(),
  revenue: z.number().nonnegative(),
  orders: z.number().int().nonnegative(),
});

const channelSchema = z.object({
  channel: z.string().min(1),
  revenue: z.number().nonnegative(),
});

const orderSchema = z.object({
  id: z.string().min(1),
  placedAt: z.iso.date(),
  customer: z.string().min(1),
  channel: z.string().min(1),
  amount: z.number().nonnegative(),
  status: z.enum(ORDER_STATUSES),
});

/** Validated at the API boundary, so components can trust the shape they receive. */
export const dashboardSchema = z.object({
  daily: z.array(dailyPointSchema),
  channels: z.array(channelSchema),
  orders: z.array(orderSchema),
});

export type DailyPoint = z.infer<typeof dailyPointSchema>;
export type ChannelRevenue = z.infer<typeof channelSchema>;
export type Order = z.infer<typeof orderSchema>;
export type Dashboard = z.infer<typeof dashboardSchema>;
