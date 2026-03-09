/**
 * HRMPEB ATS — Auth Context  (API version)
 * Replaces all localStorage/db.js calls with real API calls.
 * Token is stored in sessionStorage so each browser tab keeps its own session.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);  // { id, email, role }
  const [profile, setProfile] = useState(null);  // ApplicantProfile row
  const [loading, setLoading] = useState(true);  // true while restoring session

  // ── Boot: restore session from token ─────────────────────
  useEffect(() => {
    const restore = async () => {
      const token = sessionStorage.getItem('ats_token');
      if (!token) { setLoading(false); return; }
      try {
        const data = await api.me();          // GET /api/auth/me
        setUser({ id: data.id, email: data.email, role: data.role });
        if (data.role === 'applicant') setProfile(data.profile || null);
      } catch {
        // Token expired or invalid — clear it
        sessionStorage.removeItem('ats_token');
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  // ── Login ─────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { token, user: u } = await api.login({ email, password });
    sessionStorage.setItem('ats_token', token);
    setUser(u);

    // Fetch profile for applicants
    if (u.role === 'applicant') {
      try {
        const data = await api.me();
        setProfile(data.profile || null);
      } catch { setProfile(null); }
    } else {
      setProfile(null);
    }

    return u;
  }, []);

  // ── Register (applicant only) ─────────────────────────────
  const register = useCallback(async (email, password, firstName, lastName) => {
    const { token, user: u } = await api.register({ email, password, firstName, lastName });
    sessionStorage.setItem('ats_token', token);
    setUser(u);

    // Fetch fresh profile
    try {
      const data = await api.me();
      setProfile(data.profile || null);
    } catch { setProfile(null); }

    return u;
  }, []);

  // ── Logout ────────────────────────────────────────────────
  const logout = useCallback(() => {
    sessionStorage.removeItem('ats_token');
    setUser(null);
    setProfile(null);
  }, []);

  // ── Refresh profile (call after editing profile info) ────
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.me();
      setProfile(data.profile || null);
    } catch { /* silent */ }
  }, [user]);

  // ── Update profile optimistically ────────────────────────
  const updateProfile = useCallback((data) => {
    setProfile(prev => prev ? { ...prev, ...data } : data);
  }, []);

  // ── Helpers ───────────────────────────────────────────────
  const isAdmin     = user?.role === 'admin';
  const isApplicant = user?.role === 'applicant';
  const isLoggedIn  = !!user;

  const fullName = profile
    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
    : user?.email || '';

  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  const value = {
    user,
    profile,
    loading,
    isLoggedIn,
    isAdmin,
    isApplicant,
    fullName,
    initials,
    login,
    register,
    logout,
    refreshProfile,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
