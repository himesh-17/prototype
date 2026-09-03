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
    <div className={`empty-state ${className}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
        <Icon size={22} strokeWidth={1.6} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {(actionLabel || secondaryLabel) && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          {secondaryLabel && (
            <button type="button" onClick={onSecondaryAction} className="btn btn-secondary">
              <RefreshCw size={15} />
              {secondaryLabel}
            </button>
          )}
          {actionLabel && (
            <button type="button" onClick={onAction} className="btn btn-primary">
              <ActionIcon size={15} />
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
