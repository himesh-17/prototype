import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const colorThemes = {
  teal: { // Success
    iconBg: '#DCFCE7',
    iconColor: '#15803D',
    trendBg: '#DCFCE7',
    trendColor: '#15803D',
    trendBorder: '#BBF7D0',
  },
  sky: { // Primary
    iconBg: '#E0F2FE',
    iconColor: '#0369A1',
    trendBg: '#E0F2FE',
    trendColor: '#0369A1',
    trendBorder: '#BAE6FD',
  },
  amber: { // Warning
    iconBg: '#FEF3C7',
    iconColor: '#B45309',
    trendBg: '#FEF3C7',
    trendColor: '#B45309',
    trendBorder: '#FDE68A',
  },
  purple: { // Neutral
    iconBg: '#F1F5F9',
    iconColor: '#475569',
    trendBg: '#F1F5F9',
    trendColor: '#475569',
    trendBorder: '#E2E8F0',
  },
  rose: { // Danger
    iconBg: '#FEE2E2',
    iconColor: '#B91C1C',
    trendBg: '#FEE2E2',
    trendColor: '#B91C1C',
    trendBorder: '#FECACA',
  },
};

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendDirection = 'up',
  color = 'teal',
  onClick,
}) => {
  const theme = colorThemes[color] || colorThemes.teal;

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : 'region'}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`${title}: ${value}`}
      className="stat-card flex flex-col gap-4 rounded-lg bg-[var(--bg-overlay)] p-5 border border-[var(--border-subtle)]"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-[var(--text-secondary)] leading-snug">{title}</span>
        {Icon && (
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: theme.iconBg, color: theme.iconColor }}
          >
            <Icon size={18} strokeWidth={1.8} />
          </div>
        )}
      </div>

      <div>
        <div className="text-[1.85rem] font-semibold tracking-tight text-[var(--text-primary)] tabular-nums leading-none">
          {value}
        </div>
        {subtitle && (
          <p className="mt-2 text-sm text-[var(--text-secondary)] leading-snug">{subtitle}</p>
        )}
      </div>

      {trend && (
        <span
          className="inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border"
          style={{
            backgroundColor: theme.trendBg,
            color: theme.trendColor,
            borderColor: theme.trendBorder,
          }}
        >
          {trendDirection === 'up' && <ArrowUpRight size={12} strokeWidth={2.5} />}
          {trendDirection === 'down' && <ArrowDownRight size={12} strokeWidth={2.5} />}
          {trendDirection === 'neutral' && <Minus size={12} strokeWidth={2.5} />}
          {trend}
        </span>
      )}
    </div>
  );
};

export default StatCard;
