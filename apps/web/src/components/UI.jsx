/**
 * HRMPEB ATS — Shared UI Components
 * ────────────────────────────────────
 * All reusable building blocks used across every module.
 */
import React, { useState, useRef, useEffect } from 'react';

// ─── Button ───────────────────────────────────────────────────────────────────

const BUTTON_VARIANTS = {
  primary:   { bg: 'var(--clr-primary)',   color: '#fff',                  border: 'none' },
  gold:      { bg: 'var(--clr-gold)',      color: 'var(--clr-primary)',    border: 'none' },
  success:   { bg: 'var(--clr-green)',     color: '#fff',                  border: 'none' },
  danger:    { bg: 'var(--clr-red)',       color: '#fff',                  border: 'none' },
  ghost:     { bg: 'transparent',          color: 'var(--clr-primary)',    border: '1.5px solid var(--clr-border)' },
  outline:   { bg: 'transparent',          color: 'var(--clr-primary)',    border: '1.5px solid var(--clr-primary)' },
  soft:      { bg: 'var(--clr-primary-pale)', color: 'var(--clr-primary)', border: 'none' },
};

const BUTTON_SIZES = {
  xs:  { padding: '5px 12px', fontSize: 12, borderRadius: 'var(--radius-sm)' },
  sm:  { padding: '8px 16px', fontSize: 13, borderRadius: 'var(--radius-md)' },
  md:  { padding: '10px 22px', fontSize: 14, borderRadius: 'var(--radius-md)' },
  lg:  { padding: '13px 30px', fontSize: 15, borderRadius: 'var(--radius-lg)' },
  xl:  { padding: '15px 40px', fontSize: 16, borderRadius: 'var(--radius-lg)' },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon = null,
  iconRight = null,
  style = {},
  onClick,
  type = 'button',
  ...rest
}) {
  const v = BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary;
  const s = BUTTON_SIZES[size] || BUTTON_SIZES.md;
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        fontWeight: 700,
        fontFamily: 'inherit',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        width: fullWidth ? '100%' : 'auto',
        transition: 'all var(--transition-fast)',
        outline: 'none',
        ...v,
        ...s,
        ...style,
      }}
      {...rest}
    >
      {loading ? (
        <span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
      ) : icon ? (
        <span style={{ display: 'flex', alignItems: 'center', fontSize: '1.1em' }}>{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && (
        <span style={{ display: 'flex', alignItems: 'center', fontSize: '1.1em' }}>{iconRight}</span>
      )}
    </button>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

const STATUS_BADGE_MAP = {
  'Submitted':           { bg: '#f3f4f6',  color: '#6b7280' },
  'Under Review':        { bg: '#fffbea',  color: '#d97706' },
  'Shortlisted':         { bg: '#ecfdf5',  color: '#059669' },
  'Interview Scheduled': { bg: '#eff6ff',  color: '#1F3C88' },
  'Interviewed':         { bg: '#f5f3ff',  color: '#7c3aed' },
  'Offer Extended':      { bg: '#fef9c3',  color: '#ca8a04' },
  'Hired':               { bg: '#dcfce7',  color: '#15803d' },
  'Rejected':            { bg: '#fee2e2',  color: '#dc2626' },
  'Withdrawn':           { bg: '#f3f4f6',  color: '#9ca3af' },
  // Job statuses
  'Open':                { bg: '#dcfce7',  color: '#15803d' },
  'Closed':              { bg: '#fee2e2',  color: '#dc2626' },
  'Draft':               { bg: '#f3f4f6',  color: '#6b7280' },
  'Paused':              { bg: '#fef9c3',  color: '#ca8a04' },
  // Types
  'Full-Time':           { bg: '#eff6ff',  color: '#1F3C88' },
  'Part-Time':           { bg: '#f5f3ff',  color: '#7c3aed' },
  'Contract':            { bg: '#fff7ed',  color: '#ea580c' },
  'Internship':          { bg: '#ecfdf5',  color: '#059669' },
  'Remote':              { bg: '#f0fdf4',  color: '#16a34a' },
  'Hybrid':              { bg: '#fef3c7',  color: '#d97706' },
  // Levels
  'Entry':               { bg: '#ecfdf5',  color: '#059669' },
  'Junior':              { bg: '#eff6ff',  color: '#3b82f6' },
  'Mid':                 { bg: '#fffbea',  color: '#d97706' },
  'Senior':              { bg: '#fdf4ff',  color: '#9333ea' },
  'Executive':           { bg: '#fef2f2',  color: '#dc2626' },
};

export function Badge({ label, color, bg, size = 'sm', dot = false, style = {} }) {
  const map = STATUS_BADGE_MAP[label] || {};
  const finalBg    = bg    || map.bg    || 'var(--clr-border-soft)';
  const finalColor = color || map.color || 'var(--clr-muted)';
  const fontSize   = size === 'xs' ? 11 : size === 'sm' ? 12 : 13;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      background: finalBg,
      color: finalColor,
      padding: '3px 10px',
      borderRadius: 'var(--radius-full)',
      fontSize,
      fontWeight: 600,
      whiteSpace: 'nowrap',
      ...style,
    }}>
      {dot && (
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: finalColor }} />
      )}
      {label}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function Card({ children, style = {}, padding = 24, hover = false, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setIsHovered(true)}
      onMouseLeave={() => hover && setIsHovered(false)}
      style={{
        background: 'var(--clr-surface)',
        borderRadius: 'var(--radius-lg)',
        padding,
        boxShadow: isHovered ? 'var(--shadow-lg)' : 'var(--shadow-md)',
        border: '1px solid var(--clr-border-soft)',
        transform: hover && isHovered ? 'translateY(-2px)' : 'none',
        transition: 'all var(--transition-base)',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────

export function Input({
  label,
  error,
  hint,
  icon,
  required,
  style = {},
  containerStyle = {},
  ...props
}) {
  return (
    <div style={{ ...containerStyle }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 600,
          color: error ? 'var(--clr-red)' : 'var(--clr-text-soft)',
          marginBottom: 6,
        }}>
          {label}{required && <span style={{ color: 'var(--clr-red)', marginLeft: 3 }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--clr-muted)',
            fontSize: 16,
            pointerEvents: 'none',
          }}>
            {icon}
          </span>
        )}
        <input
          {...props}
          style={{
            width: '100%',
            padding: icon ? '11px 14px 11px 38px' : '11px 14px',
            border: `1.5px solid ${error ? 'var(--clr-red)' : 'var(--clr-border)'}`,
            borderRadius: 'var(--radius-md)',
            fontSize: 14,
            fontFamily: 'inherit',
            color: 'var(--clr-text)',
            background: 'var(--clr-surface)',
            outline: 'none',
            transition: 'border-color var(--transition-fast)',
            boxSizing: 'border-box',
            ...style,
          }}
          onFocus={e => { e.target.style.borderColor = error ? 'var(--clr-red)' : 'var(--clr-primary)'; }}
          onBlur={e  => { e.target.style.borderColor = error ? 'var(--clr-red)' : 'var(--clr-border)'; }}
        />
      </div>
      {(error || hint) && (
        <p style={{
          marginTop: 5,
          fontSize: 12,
          color: error ? 'var(--clr-red)' : 'var(--clr-muted)',
        }}>
          {error || hint}
        </p>
      )}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────

export function Select({ label, error, required, options = [], placeholder, containerStyle = {}, style = {}, ...props }) {
  return (
    <div style={containerStyle}>
      {label && (
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: error ? 'var(--clr-red)' : 'var(--clr-text-soft)', marginBottom: 6 }}>
          {label}{required && <span style={{ color: 'var(--clr-red)', marginLeft: 3 }}>*</span>}
        </label>
      )}
      <select
        {...props}
        style={{
          width: '100%',
          padding: '11px 14px',
          border: `1.5px solid ${error ? 'var(--clr-red)' : 'var(--clr-border)'}`,
          borderRadius: 'var(--radius-md)',
          fontSize: 14,
          fontFamily: 'inherit',
          color: 'var(--clr-text)',
          background: 'var(--clr-surface)',
          outline: 'none',
          cursor: 'pointer',
          boxSizing: 'border-box',
          ...style,
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt =>
          typeof opt === 'string'
            ? <option key={opt} value={opt}>{opt}</option>
            : <option key={opt.value} value={opt.value}>{opt.label}</option>
        )}
      </select>
      {error && <p style={{ marginTop: 5, fontSize: 12, color: 'var(--clr-red)' }}>{error}</p>}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────

export function Textarea({ label, error, required, hint, rows = 4, containerStyle = {}, style = {}, ...props }) {
  return (
    <div style={containerStyle}>
      {label && (
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: error ? 'var(--clr-red)' : 'var(--clr-text-soft)', marginBottom: 6 }}>
          {label}{required && <span style={{ color: 'var(--clr-red)', marginLeft: 3 }}>*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        {...props}
        style={{
          width: '100%',
          padding: '11px 14px',
          border: `1.5px solid ${error ? 'var(--clr-red)' : 'var(--clr-border)'}`,
          borderRadius: 'var(--radius-md)',
          fontSize: 14,
          fontFamily: 'inherit',
          color: 'var(--clr-text)',
          background: 'var(--clr-surface)',
          outline: 'none',
          resize: 'vertical',
          lineHeight: 1.6,
          boxSizing: 'border-box',
          ...style,
        }}
      />
      {(error || hint) && <p style={{ marginTop: 5, fontSize: 12, color: error ? 'var(--clr-red)' : 'var(--clr-muted)' }}>{error || hint}</p>}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function Modal({ open, onClose, title, children, width = 560, style = {} }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else       document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose?.()}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,20,40,0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        className="animate-scale-in"
        style={{
          background: 'var(--clr-surface)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: width,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-xl)',
          ...style,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--clr-border-soft)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--clr-primary)' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{ background: 'var(--clr-bg)', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 18, color: 'var(--clr-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ×
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: 24 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

export function Spinner({ size = 32, color = 'var(--clr-primary)' }) {
  return (
    <span style={{
      display: 'inline-block',
      width: size,
      height: size,
      border: `3px solid ${color}30`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
  );
}

export function PageLoader({ text = 'Loading…' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: 16 }}>
      <Spinner size={40} />
      <p style={{ color: 'var(--clr-muted)', fontSize: 14 }}>{text}</p>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.8 }}>{icon}</div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--clr-primary)', marginBottom: 8 }}>{title}</h3>
      {description && <p style={{ color: 'var(--clr-muted)', fontSize: 15, maxWidth: 340, lineHeight: 1.6 }}>{description}</p>}
      {action && <div style={{ marginTop: 24 }}>{action}</div>}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

export function StatCard({ icon, label, value, sub, color = 'var(--clr-primary)', accentBg }) {
  return (
    <Card style={{ animation: 'fadeIn 0.4s ease forwards', opacity: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 52, height: 52,
          background: accentBg || `${color}18`,
          borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, flexShrink: 0,
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color, lineHeight: 1 }}>
            {value}
          </div>
          <div style={{ fontWeight: 600, color: 'var(--clr-text)', fontSize: 13, marginTop: 3 }}>{label}</div>
          {sub && <div style={{ color: 'var(--clr-muted)', fontSize: 12, marginTop: 1 }}>{sub}</div>}
        </div>
      </div>
    </Card>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--clr-primary)', marginBottom: 3 }}>{title}</h2>
        {subtitle && <p style={{ color: 'var(--clr-muted)', fontSize: 14 }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

export function Divider({ label, style = {} }) {
  if (!label) return <hr style={{ border: 'none', borderTop: '1px solid var(--clr-border-soft)', margin: '24px 0', ...style }} />;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0', ...style }}>
      <div style={{ flex: 1, height: 1, background: 'var(--clr-border-soft)' }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--clr-muted)', textTransform: 'uppercase', letterSpacing: 0.8, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--clr-border-soft)' }} />
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

export function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger = false }) {
  return (
    <Modal open={open} onClose={onCancel} title={title} width={420}>
      <p style={{ color: 'var(--clr-text-soft)', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>{message}</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} size="sm" onClick={onConfirm}>Confirm</Button>
      </div>
    </Modal>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

export function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{
      display: 'flex',
      gap: 4,
      background: 'var(--clr-surface)',
      borderRadius: 'var(--radius-lg)',
      padding: 4,
      boxShadow: 'var(--shadow-sm)',
      width: 'fit-content',
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            padding: '9px 20px',
            borderRadius: 10,
            border: 'none',
            fontFamily: 'inherit',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            background: active === tab.id ? 'var(--clr-primary)' : 'transparent',
            color: active === tab.id ? '#fff' : 'var(--clr-muted)',
            transition: 'all var(--transition-fast)',
            whiteSpace: 'nowrap',
          }}
        >
          {tab.icon && <span style={{ marginRight: 6 }}>{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && (
            <span style={{
              marginLeft: 6,
              background: active === tab.id ? 'rgba(255,255,255,0.25)' : 'var(--clr-border)',
              color: active === tab.id ? '#fff' : 'var(--clr-muted)',
              padding: '1px 7px',
              borderRadius: 'var(--radius-full)',
              fontSize: 11,
              fontWeight: 700,
            }}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Form Row ─────────────────────────────────────────────────────────────────

export function FormRow({ children, cols = 2 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 16,
    }}>
      {children}
    </div>
  );
}

// ─── Alert / Info Box ─────────────────────────────────────────────────────────

export function Alert({ type = 'info', message, style = {} }) {
  const types = {
    info:    { bg: '#eff6ff', color: '#1F3C88',  border: '#bfdbfe', icon: 'ℹ️' },
    success: { bg: '#f0fdf4', color: '#15803d',  border: '#bbf7d0', icon: '✅' },
    warning: { bg: '#fffbea', color: '#d97706',  border: '#fde68a', icon: '⚠️' },
    error:   { bg: '#fef2f2', color: '#dc2626',  border: '#fecaca', icon: '❌' },
  };
  const t = types[type] || types.info;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      background: t.bg,
      border: `1px solid ${t.border}`,
      borderRadius: 'var(--radius-md)',
      padding: '12px 16px',
      fontSize: 13,
      color: t.color,
      lineHeight: 1.6,
      ...style,
    }}>
      <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{t.icon}</span>
      <span>{message}</span>
    </div>
  );
}
