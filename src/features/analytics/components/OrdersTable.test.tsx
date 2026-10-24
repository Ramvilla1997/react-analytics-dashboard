import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { OrdersTable } from './OrdersTable.js';
import type { Order } from '../types.js';

const orders: Order[] = [
  { id: '1', placedAt: '2026-03-01', customer: 'Ada Labs', channel: 'Email', amount: 120, status: 'paid' },
  { id: '2', placedAt: '2026-03-03', customer: 'Brightline', channel: 'Direct', amount: 80, status: 'refunded' },
  { id: '3', placedAt: '2026-03-02', customer: 'Cobalt', channel: 'Partners', amount: 45, status: 'pending' },
];

describe('OrdersTable', () => {
  it('lists the newest orders first', () => {
    render(<OrdersTable orders={orders} />);
    const rows = screen.getAllByRole('row').slice(1);
    expect(within(rows[0]!).getByText('Brightline')).toBeInTheDocument();
    expect(within(rows[2]!).getByText('Ada Labs')).toBeInTheDocument();
  });

  it('filters by status and updates the count', async () => {
    render(<OrdersTable orders={orders} />);
    await userEvent.selectOptions(screen.getByLabelText(/status/i), 'refunded');

    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getByText('1 orders')).toBeInTheDocument();
    expect(screen.queryByText('Ada Labs')).not.toBeInTheDocument();
  });
});
