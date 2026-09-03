import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const colorThemes = {
  teal: {
    iconBg: 'rgba(45, 212, 191, 0.12)',
    iconColor: '#2dd4bf',
    borderGlow: 'rgba(45, 212, 191, 0.25)',
    trendBg: 'rgba(45, 212, 191, 0.1)',
    trendColor: '#2dd4bf',
    trendBorder: 'rgba(45, 212, 191, 0.25)',
  },
  sky: {
    iconBg: 'rgba(56, 189, 248, 0.12)',
    iconColor: '#38bdf8',
    borderGlow: 'rgba(56, 189, 248, 0.25)',
    trendBg: 'rgba(56, 189, 248, 0.1)',
    trendColor: '#38bdf8',
    trendBorder: 'rgba(56, 189, 248, 0.25)',
  },
  amber: {
    iconBg: 'rgba(245, 158, 11, 0.12)',
    iconColor: '#f59e0b',
    borderGlow: 'rgba(245, 158, 11, 0.25)',
    trendBg: 'rgba(245, 158, 11, 0.1)',
    trendColor: '#f59e0b',
    trendBorder: 'rgba(245, 158, 11, 0.25)',
  },
  purple: {
    iconBg: 'rgba(168, 85, 247, 0.12)',
    iconColor: '#c084fc',
    borderGlow: 'rgba(168, 85, 247, 0.25)',
    trendBg: 'rgba(168, 85, 247, 0.1)',
    trendColor: '#c084fc',
    trendBorder: 'rgba(168, 85, 247, 0.25)',
  },
  rose: {
    iconBg: 'rgba(244, 63, 94, 0.12)',
    iconColor: '#fb7185',
    borderGlow: 'rgba(244, 63, 94, 0.25)',
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
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-slate-800/50 p-5 sm:p-6 border border-slate-700/50 shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-slate-600/70 hover:shadow-black/40"
    >
      {/* Top Accent Line on hover */}
      <div
        className="absolute inset-x-0 top-0 h-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${theme.iconColor} 50%, transparent 100%)`,
        }}
      />

      {/* Header & Icon Row */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-400 font-sans tracking-wide">
          {title}
        </span>
        {Icon && (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-700/50 transition-transform duration-200 group-hover:scale-105"
            style={{
              backgroundColor: theme.iconBg,
              color: theme.iconColor,
            }}
          >
            <Icon size={19} strokeWidth={1.8} />
          </div>
        )}
      </div>

      {/* Primary Metric Counter */}
      <div className="my-2.5">
        <span className="text-3xl font-semibold tracking-tight text-slate-100 font-sans tabular-nums">
          {value}
        </span>
      </div>

      {/* Dedicated Bottom Trend & Subtitle Row */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-700/40 text-xs">
        {trend ? (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium font-sans border"
            style={{
              backgroundColor: theme.trendBg,
              color: theme.trendColor,
              borderColor: theme.trendBorder,
            }}
          >
            {trendDirection === 'up' && <ArrowUpRight size={11} strokeWidth={2.5} />}
            {trendDirection === 'down' && <ArrowDownRight size={11} strokeWidth={2.5} />}
            {trendDirection === 'neutral' && <Minus size={11} strokeWidth={2.5} />}
            {trend}
          </span>
        ) : (
          <span />
        )}

        {subtitle && (
          <span className="text-xs text-slate-400 font-sans truncate text-right">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
