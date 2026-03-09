/**
 * HRMPEB ATS - Route Guards
 * Wraps protected routes and redirects if auth fails.
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthLoading() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--clr-bg)',
        gap: 16,
      }}
    >
      <div
        style={{
          width: 'clamp(52px, 12vw, 80px)',
          height: 'clamp(52px, 12vw, 80px)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.12)',
          overflow: 'hidden',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      >
        <img src="/hrmpeb-logo.png" alt="HRMPEB logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
      <p style={{ color: 'var(--clr-muted)', fontSize: 14, fontWeight: 500 }}>
        Loading HRMPEB ATS...
      </p>
    </div>
  );
}

export function ApplicantGuard({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoading />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user.role !== 'applicant') return <Navigate to="/admin" replace />;
  return children;
}

export function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoading />;
  if (!user) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

/**
 * Auth pages stay reachable so each tab can sign into a different account.
 */
export function GuestGuard({ children }) {
  const { loading } = useAuth();

  if (loading) return <AuthLoading />;
  return children;
}
