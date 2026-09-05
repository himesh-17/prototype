import React from 'react';
import {
  Plus,
  FolderSearch,
  RefreshCw,
} from 'lucide-react';

const EmptyState = ({
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
  const hasActions = actionLabel || secondaryLabel;

  return (
    <div className={`empty-state ${className}`.trim()}>

      <div className="empty-state-icon">
        <Icon
          size={22}
          strokeWidth={1.6}
        />
      </div>

      <div className="empty-state-content">

        <h3 className="empty-state-title">
          {title}
        </h3>

        <p className="empty-state-description">
          {description}
        </p>

      </div>

      {hasActions && (
        <div className="empty-state-actions">

          {secondaryLabel && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="btn btn-secondary"
            >
              <RefreshCw
                size={15}
                strokeWidth={1.8}
              />

              {secondaryLabel}
            </button>
          )}

          {actionLabel && (
            <button
              type="button"
              onClick={onAction}
              className="btn btn-primary"
            >
              <ActionIcon
                size={15}
                strokeWidth={1.8}
              />

              {actionLabel}
            </button>
          )}

        </div>
      )}

    </div>
  );
};

export default EmptyState;