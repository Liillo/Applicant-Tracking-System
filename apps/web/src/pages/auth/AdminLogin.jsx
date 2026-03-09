/**
 * HRMPEB ATS - Admin Login
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.email) nextErrors.email = 'Email is required';
    if (!form.password) nextErrors.password = 'Password is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role !== 'admin') {
        throw new Error('This portal is for administrators only. Please use the applicant login.');
      }
      toast.success('Welcome to the Admin Panel!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.message || 'Login failed');
      setErrors({ password: err.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  const stats = (() => {
    try {
      return 0;
    } catch {
      return null;
    }
  })();

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#0a0f1e' }}>
      <div
        style={{
          background: 'linear-gradient(160deg,#0a0f1e 0%,#111827 40%,#0f1f4d 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '64px 56px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(31,60,136,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(31,60,136,0.06) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,var(--clr-gold),transparent)' }} />
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(31,60,136,0.3) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ marginBottom: 48, animation: 'fadeIn 0.5s ease', position: 'relative' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div
              style={{
                width: 52,
                height: 52,
                background: 'var(--clr-gold)',
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 24,
                color: 'var(--clr-primary)',
                boxShadow: '0 4px 20px rgba(244,180,0,0.4)',
              }}
            >
              H
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: '#fff', letterSpacing: '-0.5px' }}>
                HRMPEB <span style={{ color: 'var(--clr-gold)' }}>ATS</span>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginTop: 1 }}>
                Administration Portal
              </div>
            </div>
          </Link>
        </div>

        <div style={{ maxWidth: 360, position: 'relative', animation: 'fadeIn 0.5s ease 0.1s both' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(244,180,0,0.1)', border: '1px solid rgba(244,180,0,0.2)', borderRadius: 'var(--radius-full)', padding: '5px 14px', marginBottom: 20 }}>
            <span style={{ fontSize: 12 }}>⚙️</span>
            <span style={{ color: 'var(--clr-gold)', fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>Restricted Access</span>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-1px', marginBottom: 16 }}>
            Admin Control
            <br />
            <span style={{ color: 'var(--clr-gold)' }}>Centre.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.75, marginBottom: 32 }}>
            Manage job postings, review applications, schedule interviews, and track hiring metrics from one secure portal.
          </p>

          {stats && (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Live System Stats</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Open Jobs', value: stats.openJobs, color: 'var(--clr-gold)' },
                  { label: 'Total Apps', value: stats.totalApps, color: '#60a5fa' },
                  { label: 'Hired', value: stats.hired, color: 'var(--clr-green-light)' },
                  { label: 'This Month', value: stats.thisMonthApps, color: '#a78bfa' },
                ].map((item) => (
                  <div key={item.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: item.color, lineHeight: 1 }}>{item.value}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4, fontWeight: 500 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ position: 'absolute', bottom: 28, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,0.32)', fontSize: 12 }}>
          Restricted admin authentication portal
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '64px 56px', background: '#111827' }}>
        <div style={{ width: '100%', maxWidth: 400, animation: 'fadeIn 0.4s ease' }}>
          <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: '11px 16px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>🔐</span>
            <span style={{ fontSize: 13, color: '#f87171', fontWeight: 600 }}>Authorized personnel only. All access is logged.</span>
          </div>

          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: '-0.5px' }}>Admin Sign In</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Enter your administrator credentials</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
                Admin Email <span style={{ color: 'var(--clr-red)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>✉️</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => set('email', event.target.value)}
                  placeholder="admin@company.com"
                  autoComplete="email"
                  style={{
                    width: '100%',
                    padding: '13px 14px 13px 42px',
                    border: `1.5px solid ${errors.email ? 'var(--clr-red)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 10,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    color: '#fff',
                    background: 'rgba(255,255,255,0.06)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              {errors.email && <p style={{ marginTop: 5, fontSize: 12, color: 'var(--clr-red)' }}>{errors.email}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
                Password <span style={{ color: 'var(--clr-red)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🔑</span>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(event) => set('password', event.target.value)}
                  placeholder="Admin password"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: '13px 44px 13px 42px',
                    border: `1.5px solid ${errors.password ? 'var(--clr-red)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 10,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    color: '#fff',
                    background: 'rgba(255,255,255,0.06)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((prev) => !prev)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p style={{ marginTop: 5, fontSize: 12, color: 'var(--clr-red)' }}>{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: 10,
                background: loading ? 'rgba(244,180,0,0.5)' : 'var(--clr-gold)',
                color: 'var(--clr-primary)',
                fontWeight: 800,
                fontSize: 15,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                boxShadow: '0 6px 24px rgba(244,180,0,0.3)',
                transition: 'all 0.18s',
                marginTop: 4,
              }}
            >
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(31,60,136,0.3)', borderTopColor: 'var(--clr-primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Authenticating...
                </>
              ) : (
                'Access Admin Panel ->'
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'rgba(255,255,255,0.2)', lineHeight: 1.7 }}>
            Unauthorized access attempts are monitored and logged.
            <br />
            Admin credentials are set up by your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
