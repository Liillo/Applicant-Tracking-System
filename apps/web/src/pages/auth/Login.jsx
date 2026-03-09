/**
 * HRMPEB ATS - Applicant Login
 */
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const next = new URLSearchParams(location.search).get('next') || '/dashboard';

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
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) nextErrors.email = 'Enter a valid email';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'admin') {
        toast.success('Welcome back, Admin!');
        navigate('/admin');
      } else {
        toast.success('Welcome back!');
        navigate(next);
      }
    } catch (err) {
      toast.error(err.message || 'Login failed');
      setErrors({ password: err.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <div
        style={{
          background: 'linear-gradient(145deg, var(--clr-primary) 0%, var(--clr-primary-dark) 60%, #0a1535 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px 56px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {[{ w: 320, h: 320, t: -80, r: -80, op: 0.06 }, { w: 200, h: 200, b: 40, l: 40, op: 0.04 }, { w: 140, h: 140, t: '45%', r: 20, op: 0.03 }].map((orb, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              width: orb.w,
              height: orb.h,
              borderRadius: '50%',
              background: 'var(--clr-gold)',
              opacity: orb.op,
              top: orb.t,
              right: orb.r,
              bottom: orb.b,
              left: orb.l,
              pointerEvents: 'none',
            }}
          />
        ))}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, var(--clr-gold), transparent)' }} />

        <div style={{ marginBottom: 40, animation: 'fadeIn 0.5s ease' }}>
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
                boxShadow: '0 4px 16px rgba(244,180,0,0.35)',
              }}
            >
              H
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: '#fff', letterSpacing: '-0.5px' }}>
              HRMPEB <span style={{ color: 'var(--clr-gold)' }}>ATS</span>
            </span>
          </Link>
        </div>

        <div style={{ maxWidth: 360, animation: 'fadeIn 0.5s ease 0.1s both' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-1px', marginBottom: 18 }}>
            Your Career
            <br />
            Journey <span style={{ color: 'var(--clr-gold)' }}>Starts Here.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.75, marginBottom: 36 }}>
            Sign in to track your applications, discover new roles, and connect with top employers across Kenya.
          </p>

          {[
            { icon: '📊', text: 'Real-time application tracking' },
            { icon: '🔔', text: 'Instant status notifications' },
            { icon: '📄', text: 'CV auto-parsing and profile builder' },
          ].map((feature) => (
            <div key={feature.text} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, animation: 'fadeIn 0.5s ease 0.2s both' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 17,
                  flexShrink: 0,
                }}
              >
                {feature.icon}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14 }}>{feature.text}</span>
            </div>
          ))}
        </div>

        <div style={{ position: 'absolute', bottom: 32, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,0.42)', fontSize: 12, fontWeight: 500 }}>
          Applicant authentication portal
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px 56px', background: 'var(--clr-bg)' }}>
        <div style={{ width: '100%', maxWidth: 420, animation: 'fadeIn 0.4s ease' }}>
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: 'var(--clr-primary)', marginBottom: 6, letterSpacing: '-0.5px' }}>Welcome back</h1>
            <p style={{ color: 'var(--clr-muted)', fontSize: 15 }}>Sign in to your applicant account</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--clr-text-soft)', marginBottom: 6 }}>
                Email Address <span style={{ color: 'var(--clr-red)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>✉️</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => set('email', event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    border: `1.5px solid ${errors.email ? 'var(--clr-red)' : 'var(--clr-border)'}`,
                    borderRadius: 10,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    color: 'var(--clr-text)',
                    background: '#fff',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.18s',
                  }}
                />
              </div>
              {errors.email && <p style={{ marginTop: 5, fontSize: 12, color: 'var(--clr-red)' }}>{errors.email}</p>}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--clr-text-soft)' }}>
                  Password <span style={{ color: 'var(--clr-red)' }}>*</span>
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🔒</span>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(event) => set('password', event.target.value)}
                  placeholder="Your password"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: '12px 44px 12px 42px',
                    border: `1.5px solid ${errors.password ? 'var(--clr-red)' : 'var(--clr-border)'}`,
                    borderRadius: 10,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    color: 'var(--clr-text)',
                    background: '#fff',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.18s',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((prev) => !prev)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
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
                background: loading ? 'var(--clr-muted)' : 'var(--clr-primary)',
                color: '#fff',
                fontWeight: 800,
                fontSize: 15,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                boxShadow: '0 6px 20px rgba(31,60,136,0.25)',
                transition: 'all 0.18s',
                marginTop: 4,
              }}
            >
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Signing in...
                </>
              ) : (
                'Sign In ->'
              )}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--clr-border-soft)' }} />
            <span style={{ fontSize: 12, color: 'var(--clr-muted)', fontWeight: 600 }}>Don't have an account?</span>
            <div style={{ flex: 1, height: 1, background: 'var(--clr-border-soft)' }} />
          </div>

          <Link
            to="/register"
            style={{
              display: 'block',
              textAlign: 'center',
              width: '100%',
              padding: '13px 20px',
              borderRadius: 10,
              border: '1.5px solid var(--clr-primary)',
              color: 'var(--clr-primary)',
              fontWeight: 700,
              fontSize: 15,
              transition: 'all 0.18s',
              boxSizing: 'border-box',
            }}
          >
            Create Free Account
          </Link>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--clr-muted)', lineHeight: 1.7 }}>
            By signing in you agree to our <Link to="/" style={{ color: 'var(--clr-primary)', fontWeight: 600 }}>Terms of Service</Link> and <Link to="/" style={{ color: 'var(--clr-primary)', fontWeight: 600 }}>Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
