import type { ChannelRevenue } from '../types.js';
import { formatCurrency } from '../lib/summary.js';

interface ChannelBarsProps {
  channels: ChannelRevenue[];
}

export function ChannelBars({ channels }: ChannelBarsProps) {
  const top = channels[0]?.revenue ?? 0;

  return (
    <ul className="bars" aria-label="Revenue by channel">
      {channels.map((channel) => {
        const share = top === 0 ? 0 : (channel.revenue / top) * 100;
        return (
          <li key={channel.channel} className="bars__row">
            <span className="bars__label">{channel.channel}</span>
            <span className="bars__track" aria-hidden="true">
              <span className="bars__fill" style={{ width: `${share}%` }} />
            </span>
            <span className="bars__value">{formatCurrency(channel.revenue)}</span>
          </li>
        );
      })}
    </ul>
  );
}
