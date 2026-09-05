import React from 'react';
import {
  Plus,
  FolderSearch,
  RefreshCw,
} from 'lucide-react';

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
    <>
      <style>{`
        /* =====================================================
           EMPTY STATE
        ===================================================== */

        .modern-empty-state {
          width: 100%;
          min-height: 280px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          padding: 48px 24px;

          text-align: center;

          color: var(--text-primary);

          animation: emptyStateIn 180ms ease-out;
        }

        @keyframes emptyStateIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* =====================================================
           ICON CONTAINER
        ===================================================== */

        .modern-empty-icon {
          width: 58px;
          height: 58px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 18px;

          border-radius: 14px;

          background: var(--bg-inset);

          border: 1px solid var(--border-subtle);

          color: var(--text-secondary);

          box-shadow:
            0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .modern-empty-icon svg {
          width: 25px;
          height: 25px;
        }

        /* =====================================================
           TITLE
        ===================================================== */

        .modern-empty-title {
          margin: 0;

          color: var(--text-primary);

          font-size: 16px;
          line-height: 23px;

          font-weight: 650;

          letter-spacing: -0.01em;
        }

        /* =====================================================
           DESCRIPTION
        ===================================================== */

        .modern-empty-description {
          max-width: 430px;

          margin: 7px auto 0;

          color: var(--text-secondary);

          font-size: 13px;
          line-height: 20px;
        }

        /* =====================================================
           ACTIONS
        ===================================================== */

        .modern-empty-actions {
          display: flex;
          align-items: center;
          justify-content: center;

          gap: 9px;

          flex-wrap: wrap;

          margin-top: 22px;
        }

        .modern-empty-action {
          min-height: 36px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          padding: 0 14px;

          border-radius: 8px;

          font-size: 12px;
          font-weight: 600;

          cursor: pointer;

          transition:
            background 140ms ease,
            border-color 140ms ease,
            color 140ms ease,
            transform 140ms ease,
            box-shadow 140ms ease;
        }

        .modern-empty-action svg {
          flex: 0 0 auto;
        }

        .modern-empty-action:active {
          transform: scale(0.98);
        }

        /* =====================================================
           PRIMARY
        ===================================================== */

        .modern-empty-primary {
          border: 1px solid var(--accent-base);

          background: var(--accent-base);

          color: white;

          box-shadow:
            0 2px 6px rgba(0, 0, 0, 0.08);
        }

        .modern-empty-primary:hover {
          background: var(--accent-strong);
          border-color: var(--accent-strong);

          box-shadow:
            0 4px 10px rgba(0, 0, 0, 0.10);
        }

        /* =====================================================
           SECONDARY
        ===================================================== */

        .modern-empty-secondary {
          border: 1px solid var(--border-default);

          background: var(--bg-raised);

          color: var(--text-secondary);
        }

        .modern-empty-secondary:hover {
          background: var(--bg-card);

          border-color: var(--border-default);

          color: var(--text-primary);
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 640px) {
          .modern-empty-state {
            min-height: 240px;
            padding: 38px 18px;
          }

          .modern-empty-icon {
            width: 54px;
            height: 54px;
            margin-bottom: 15px;
          }

          .modern-empty-title {
            font-size: 15px;
          }

          .modern-empty-description {
            font-size: 12px;
            line-height: 18px;
          }

          .modern-empty-actions {
            width: 100%;
            flex-direction: column;
          }

          .modern-empty-action {
            width: 100%;
            max-width: 220px;
          }
        }
      `}</style>

      <div className={`modern-empty-state ${className}`}>

        {/* Icon */}

        <div className="modern-empty-icon">
          <Icon
            strokeWidth={1.7}
          />
        </div>


        {/* Title */}

        <h3 className="modern-empty-title">
          {title}
        </h3>


        {/* Description */}

        <p className="modern-empty-description">
          {description}
        </p>


        {/* Actions */}

        {(actionLabel || secondaryLabel) && (
          <div className="modern-empty-actions">

            {secondaryLabel && (
              <button
                type="button"
                onClick={onSecondaryAction}
                className="modern-empty-action modern-empty-secondary"
              >
                <RefreshCw size={14} />
                {secondaryLabel}
              </button>
            )}

            {actionLabel && (
              <button
                type="button"
                onClick={onAction}
                className="modern-empty-action modern-empty-primary"
              >
                <ActionIcon size={14} />
                {actionLabel}
              </button>
            )}

          </div>
        )}

      </div>
    </>
  );
};

export default EmptyState;
