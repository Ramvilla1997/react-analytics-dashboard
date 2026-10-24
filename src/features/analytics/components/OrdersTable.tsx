import { useMemo, useState } from 'react';
import { formatCurrency } from '../lib/summary.js';
import { ORDER_STATUSES, type Order, type OrderStatus } from '../types.js';

const PAGE_SIZE = 12;

interface OrdersTableProps {
  orders: Order[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(
    () =>
      orders
        .filter((order) => statusFilter === 'all' || order.status === statusFilter)
        .sort((a, b) => b.placedAt.localeCompare(a.placedAt)),
    [orders, statusFilter],
  );
  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="orders">
      <div className="orders__controls">
        <label>
          Status{' '}
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as OrderStatus | 'all');
              setVisibleCount(PAGE_SIZE);
            }}
          >
            <option value="all">All</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <span className="muted">{filtered.length} orders</span>
      </div>

      <div className="table-wrap">
        <table>
          <caption className="sr-only">Recent orders</caption>
          <thead>
            <tr>
              <th scope="col">Placed</th>
              <th scope="col">Customer</th>
              <th scope="col">Channel</th>
              <th scope="col" className="num">Amount</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((order) => (
              <tr key={order.id}>
                <td>{order.placedAt}</td>
                <td>{order.customer}</td>
                <td>{order.channel}</td>
                <td className="num">{formatCurrency(order.amount)}</td>
                <td>
                  <span className={`badge badge--${order.status}`}>{order.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visibleCount < filtered.length ? (
        <button type="button" className="button button--ghost" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
          Show more
        </button>
      ) : null}
    </div>
  );
}
