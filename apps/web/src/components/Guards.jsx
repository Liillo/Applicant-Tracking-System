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
          width: 48,
          height: 48,
          background: 'var(--clr-primary)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 22,
          color: 'var(--clr-gold)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      >
        H
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
