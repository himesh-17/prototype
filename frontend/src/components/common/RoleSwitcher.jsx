
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  Briefcase,
  Scale,
  Microscope,
  ChevronDown,
  Check,
} from 'lucide-react';

const roleMeta = {
  ADMIN: {
    label: 'Administrator',
    officer: 'Vikramaditya Sharma',
    agency: 'NCRB HQ',
    icon: Shield,
    color: '#0f766e',
  },

  IO: {
    label: 'Investigator',
    officer: 'Rajesh Deshmukh',
    agency: 'Cyber Crime Branch',
    icon: Briefcase,
    color: '#0369a1',
  },

  JUDGE: {
    label: 'Court',
    officer: 'Justice Sundaram',
    agency: 'Patiala House',
    icon: Scale,
    color: '#b45309',
  },

  FORENSIC_EXPERT: {
    label: 'Forensics',
    officer: 'Dr. Aarav Nambiar',
    agency: 'CFSL CBI',
    icon: Microscope,
    color: '#7e22ce',
  },
};

export const RoleSwitcher = () => {
  const { activeRole, logout } = useAuth();

  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const currentRole =
    roleMeta[activeRole] || roleMeta.ADMIN;

  const CurrentIcon = currentRole.icon;

  /*
   * Close dropdown when clicking outside.
   */
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );
    };
  }, []);

  /*
   * Current application behaviour:
   * selecting another role returns the user to login.
   *
   * If your AuthContext supports actual role switching,
   * replace this with your switchRole() function.
   */
  const handleSelect = (roleKey) => {
    if (roleKey === activeRole) {
      setOpen(false);
      return;
    }

    logout();
    setOpen(false);
    navigate('/login');
  };

  return (
    <>
      <style>{`
        /* =====================================================
           ROLE SWITCHER
        ===================================================== */

        .role-switcher {
          position: relative;
          width: 100%;
          font-family: inherit;
        }

        /* =====================================================
           MAIN BUTTON
        ===================================================== */

        .role-switcher-trigger {
          width: 100%;
          min-height: 58px;

          display: flex;
          align-items: center;
          gap: 12px;

          padding: 9px 11px;

          border: 1px solid var(--border-subtle);
          border-radius: 10px;

          background: var(--bg-overlay);

          color: var(--text-primary);

          cursor: pointer;

          text-align: left;

          transition:
            background 160ms ease,
            border-color 160ms ease,
            box-shadow 160ms ease,
            transform 160ms ease;
        }

        .role-switcher-trigger:hover {
          background: var(--bg-card);
          border-color: var(--border-default);

          box-shadow:
            0 4px 14px rgba(0, 0, 0, 0.05);
        }

        .role-switcher-trigger:active {
          transform: scale(0.99);
        }

        .role-switcher-trigger.is-open {
          border-color: var(--accent-soft);

          box-shadow:
            0 0 0 3px var(--accent-faint);
        }

        /* =====================================================
           ICON
        ===================================================== */

        .role-switcher-icon {
          width: 36px;
          height: 36px;

          flex: 0 0 36px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          transition:
            transform 160ms ease,
            background 160ms ease;
        }

        .role-switcher-trigger:hover
        .role-switcher-icon {
          transform: translateY(-1px);
        }

        /* =====================================================
           TEXT
        ===================================================== */

        .role-switcher-info {
          min-width: 0;
          flex: 1;
        }

        .role-switcher-label {
          display: block;

          font-size: 13px;
          line-height: 18px;

          font-weight: 650;

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .role-switcher-officer {
          display: block;

          margin-top: 1px;

          color: var(--text-tertiary);

          font-size: 11px;
          line-height: 16px;

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* =====================================================
           CHEVRON
        ===================================================== */

        .role-switcher-chevron {
          flex: 0 0 auto;

          color: var(--text-tertiary);

          transition:
            transform 180ms ease,
            color 180ms ease;
        }

        .role-switcher-trigger:hover
        .role-switcher-chevron {
          color: var(--text-secondary);
        }

        .role-switcher-trigger.is-open
        .role-switcher-chevron {
          transform: rotate(180deg);
          color: var(--text-secondary);
        }

        /* =====================================================
           DROPDOWN
        ===================================================== */

        .role-switcher-menu {
          position: absolute;

          left: 0;
          right: 0;
          top: calc(100% + 7px);

          z-index: 1000;

          padding: 6px;

          background: var(--bg-raised);

          border: 1px solid var(--border-default);

          border-radius: 11px;

          box-shadow:
            0 12px 30px rgba(0, 0, 0, 0.12),
            0 3px 8px rgba(0, 0, 0, 0.06);

          animation: roleMenuIn 140ms ease-out;
          transform-origin: top center;
        }

        @keyframes roleMenuIn {
          from {
            opacity: 0;
            transform: translateY(-4px) scale(0.985);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* =====================================================
           DROPDOWN HEADER
        ===================================================== */

        .role-switcher-menu-header {
          padding: 7px 9px 8px;

          color: var(--text-tertiary);

          font-size: 10px;
          font-weight: 650;

          text-transform: uppercase;
          letter-spacing: 0.07em;
        }

        /* =====================================================
           ROLE OPTION
        ===================================================== */

        .role-switcher-option {
          width: 100%;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 10px;

          padding: 9px;

          border: 1px solid transparent;
          border-radius: 8px;

          background: transparent;

          color: var(--text-primary);

          cursor: pointer;

          text-align: left;

          transition:
            background 140ms ease,
            border-color 140ms ease,
            transform 140ms ease;
        }

        .role-switcher-option:hover {
          background: var(--bg-card);
          border-color: var(--border-subtle);
        }

        .role-switcher-option:active {
          transform: scale(0.99);
        }

        .role-switcher-option.selected {
          background: var(--bg-inset);
          border-color: var(--border-subtle);
        }

        /* =====================================================
           OPTION LEFT
        ===================================================== */

        .role-switcher-option-main {
          min-width: 0;

          display: flex;
          align-items: center;

          gap: 10px;
        }

        .role-switcher-option-icon {
          width: 34px;
          height: 34px;

          flex: 0 0 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 8px;
        }

        .role-switcher-option-text {
          min-width: 0;
        }

        .role-switcher-option-label {
          display: block;

          font-size: 12px;
          line-height: 17px;

          font-weight: 600;

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .role-switcher-option-agency {
          display: block;

          margin-top: 1px;

          color: var(--text-tertiary);

          font-size: 10.5px;
          line-height: 15px;

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* =====================================================
           CHECK
        ===================================================== */

        .role-switcher-check {
          width: 25px;
          height: 25px;

          flex: 0 0 25px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 7px;

          background: var(--accent-faint);
          color: var(--accent-strong);
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 640px) {
          .role-switcher-trigger {
            min-height: 54px;
          }

          .role-switcher-menu {
            position: fixed;

            left: 12px;
            right: 12px;

            top: auto;
            bottom: 12px;

            width: auto;

            border-radius: 13px;

            box-shadow:
              0 20px 50px rgba(0, 0, 0, 0.18);

            animation: roleMenuMobileIn 160ms ease-out;
          }

          @keyframes roleMenuMobileIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        }
      `}</style>

      <div
        className="role-switcher"
        ref={dropdownRef}
      >

        {/* ===================================================
            CURRENT ROLE
        =================================================== */}

        <button
          type="button"
          className={`role-switcher-trigger ${
            open ? 'is-open' : ''
          }`}
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Switch active role"
          aria-expanded={open}
        >

          <div
            className="role-switcher-icon"
            style={{
              backgroundColor: `${currentRole.color}12`,
              color: currentRole.color,
            }}
          >
            <CurrentIcon size={17} strokeWidth={2} />
          </div>

          <div className="role-switcher-info">

            <span
              className="role-switcher-label"
              style={{
                color: currentRole.color,
              }}
            >
              {currentRole.label}
            </span>

            <span className="role-switcher-officer">
              {currentRole.officer}
            </span>

          </div>

          <ChevronDown
            size={16}
            className="role-switcher-chevron"
          />

        </button>


        {/* ===================================================
            DROPDOWN
        =================================================== */}

        {open && (
          <div className="role-switcher-menu">

            <div className="role-switcher-menu-header">
              Switch workspace
            </div>

            {Object.entries(roleMeta).map(
              ([roleKey, meta]) => {

                const Icon = meta.icon;

                const isSelected =
                  activeRole === roleKey;

                return (
                  <button
                    key={roleKey}
                    type="button"
                    className={`role-switcher-option ${
                      isSelected
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() =>
                      handleSelect(roleKey)
                    }
                  >

                    <div className="role-switcher-option-main">

                      <div
                        className="role-switcher-option-icon"
                        style={{
                          backgroundColor:
                            `${meta.color}12`,
                          color: meta.color,
                        }}
                      >
                        <Icon
                          size={16}
                          strokeWidth={2}
                        />
                      </div>

                      <div className="role-switcher-option-text">

                        <span className="role-switcher-option-label">
                          {meta.label}
                        </span>

                        <span className="role-switcher-option-agency">
                          {meta.agency}
                        </span>

                      </div>

                    </div>

                    {isSelected && (
                      <div className="role-switcher-check">
                        <Check
                          size={14}
                          strokeWidth={2.5}
                        />
                      </div>
                    )}

                  </button>
                );
              }
            )}

          </div>
        )}

      </div>
    </>
  );
};

export default RoleSwitcher;
