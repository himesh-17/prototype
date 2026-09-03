import React from 'react';
import { Plus, FolderSearch, RefreshCw } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = FolderSearch,
  title = 'No records found',
  description = 'There are currently no items in this section.',
  actionLabel,
  onAction,
  actionIcon: ActionIcon = Plus,
  secondaryLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#101015]/60 px-6 py-14 text-center ${className}`}
    >
      <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10 border border-teal-500/20 text-[#00d4aa] shadow-inner shadow-teal-500/10">
        <Icon size={30} strokeWidth={1.6} />
        {/* Glow halo */}
        <div className="absolute -inset-1 rounded-2xl bg-teal-500/10 blur-sm -z-10" />
      </div>

      <h3 className="text-base font-medium text-zinc-100">
        {title}
      </h3>

      <p className="mt-1.5 max-w-md text-sm text-zinc-400 leading-relaxed">
        {description}
      </p>

      {(actionLabel || secondaryLabel) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {secondaryLabel && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="btn btn-secondary text-xs px-3.5 py-2 inline-flex items-center gap-1.5"
            >
              <RefreshCw size={14} />
              <span>{secondaryLabel}</span>
            </button>
          )}

          {actionLabel && (
            <button
              type="button"
              onClick={onAction}
              className="btn btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5 shadow-md shadow-teal-500/20 hover:shadow-teal-500/30"
            >
              <ActionIcon size={15} strokeWidth={2} />
              <span className="font-medium">{actionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
