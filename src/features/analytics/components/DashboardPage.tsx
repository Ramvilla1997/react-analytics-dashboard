import { useState } from 'react';
import { useDashboard } from '../hooks/useDashboard.js';
import { formatCurrency, formatPercent, summarize } from '../lib/summary.js';
import { RANGE_OPTIONS, type RangeDays } from '../types.js';
import { ChannelBars } from './ChannelBars.js';
import { KpiCard } from './KpiCard.js';
import { OrdersTable } from './OrdersTable.js';
import { RevenueChart } from './RevenueChart.js';

export function DashboardPage() {
  const [days, setDays] = useState<RangeDays>(30);
  const query = useDashboard(days);

  return (
    <main className="page">
      <header className="page__header">
        <div>
          <h1>Analytics</h1>
          <p className="muted">Sample data, generated in the browser. No server is involved.</p>
        </div>
        <label>
          Range{' '}
          <select value={days} onChange={(event) => setDays(Number(event.target.value) as RangeDays)}>
            {RANGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                Last {option} days
              </option>
            ))}
          </select>
        </label>
      </header>

      {query.isPending ? <p role="status" className="state">Loading dashboard…</p> : null}

      {query.isError ? (
        <div role="alert" className="state state--error">
          <p>The dashboard could not be loaded.</p>
          <button type="button" className="button" onClick={() => void query.refetch()}>
            Try again
          </button>
        </div>
      ) : null}

      {query.data ? <DashboardContent data={query.data} days={days} /> : null}
    </main>
  );
}

function DashboardContent({ data, days }: { data: NonNullable<ReturnType<typeof useDashboard>['data']>; days: RangeDays }) {
  const summary = summarize(data);

  return (
    <>
      <section className="kpis" aria-label="Key metrics">
        <KpiCard label="Revenue" value={formatCurrency(summary.revenue)} hint={`Last ${days} days`} />
        <KpiCard label="Orders" value={summary.orders.toLocaleString('en-US')} hint="Placed in range" />
        <KpiCard label="Average order" value={formatCurrency(summary.averageOrderValue)} hint="Paid orders" />
        <KpiCard label="Refund rate" value={formatPercent(summary.refundRate)} hint="Of all orders in range" />
      </section>

      <div className="panels">
        <section className="panel panel--wide" aria-labelledby="revenue-heading">
          <h2 id="revenue-heading">Daily revenue</h2>
          <RevenueChart points={data.daily} />
        </section>
        <section className="panel" aria-labelledby="channel-heading">
          <h2 id="channel-heading">Revenue by channel</h2>
          <ChannelBars channels={data.channels} />
        </section>
      </div>

      <section className="panel" aria-labelledby="orders-heading">
        <h2 id="orders-heading">Recent orders</h2>
        <OrdersTable orders={data.orders} />
      </section>
    </>
  );
}
