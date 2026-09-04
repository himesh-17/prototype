import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const colorThemes = {
  teal: {
    iconBg: 'rgba(45, 212, 191, 0.12)',
    iconColor: '#2dd4bf',
    trendBg: 'rgba(45, 212, 191, 0.1)',
    trendColor: '#2dd4bf',
    trendBorder: 'rgba(45, 212, 191, 0.25)',
  },
  sky: {
    iconBg: 'rgba(56, 189, 248, 0.12)',
    iconColor: '#38bdf8',
    trendBg: 'rgba(56, 189, 248, 0.1)',
    trendColor: '#38bdf8',
    trendBorder: 'rgba(56, 189, 248, 0.25)',
  },
  amber: {
    iconBg: 'rgba(245, 158, 11, 0.12)',
    iconColor: '#f59e0b',
    trendBg: 'rgba(245, 158, 11, 0.1)',
    trendColor: '#f59e0b',
    trendBorder: 'rgba(245, 158, 11, 0.25)',
  },
  purple: {
    iconBg: 'rgba(168, 85, 247, 0.12)',
    iconColor: '#c084fc',
    trendBg: 'rgba(168, 85, 247, 0.1)',
    trendColor: '#c084fc',
    trendBorder: 'rgba(168, 85, 247, 0.25)',
  },
  rose: {
    iconBg: 'rgba(244, 63, 94, 0.12)',
    iconColor: '#fb7185',
    trendBg: 'rgba(244, 63, 94, 0.1)',
    trendColor: '#fb7185',
    trendBorder: 'rgba(244, 63, 94, 0.25)',
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
      className="flex flex-col gap-4 rounded-lg bg-[var(--bg-overlay)] p-5 border border-[var(--border-subtle)]"
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
