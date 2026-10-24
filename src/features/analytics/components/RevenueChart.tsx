import type { DailyPoint } from '../types.js';
import { formatCurrency } from '../lib/summary.js';

const WIDTH = 640;
const HEIGHT = 220;
const PADDING = 16;

interface RevenueChartProps {
  points: DailyPoint[];
}

export function RevenueChart({ points }: RevenueChartProps) {
  if (points.length === 0) {
    return <p className="muted">No revenue recorded in this range.</p>;
  }

  const maxRevenue = Math.max(...points.map((point) => point.revenue), 1);
  const xStep = points.length > 1 ? (WIDTH - PADDING * 2) / (points.length - 1) : 0;
  const coordinates = points.map((point, index) => {
    const x = PADDING + index * xStep;
    const y = HEIGHT - PADDING - (point.revenue / maxRevenue) * (HEIGHT - PADDING * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const first = points[0];
  const last = points[points.length - 1];
  const total = points.reduce((sum, point) => sum + point.revenue, 0);

  return (
    <figure className="chart">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Daily revenue from ${first?.date} to ${last?.date}, total ${formatCurrency(total)}`}
        preserveAspectRatio="none"
      >
        <polyline className="chart__line" points={coordinates.join(' ')} fill="none" />
      </svg>
      <figcaption className="chart__axis">
        <span>{first?.date}</span>
        <span>Peak {formatCurrency(maxRevenue)}</span>
        <span>{last?.date}</span>
      </figcaption>
    </figure>
  );
}
