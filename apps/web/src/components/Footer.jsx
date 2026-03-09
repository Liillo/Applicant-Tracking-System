/**
 * HRMPEB ATS — Public Footer
 */
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  const col = (title, links) => (
    <div>
      <div style={{ fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.9)', marginBottom: 14 }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {links.map(({ label, to }) => (
          <Link key={label} to={to}
            style={{ fontSize: 13, color: 'rgba(255,255,255,0.48)', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.48)'}
          >{label}</Link>
        ))}
      </div>
    </div>
  );

  return (
    <footer style={{ background: '#0f1f4d', padding: '56px 40px 28px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: 48, marginBottom: 48, paddingBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.8vw, 14px)', marginBottom: 16 }}>
              <img src="/hrmpeb-logo.png" alt="HRMPEB logo" style={{ width: 'clamp(42px, 8vw, 64px)', height: 'clamp(42px, 8vw, 64px)', objectFit: 'contain', borderRadius: 12 }} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(16px, 2vw, 22px)', color: '#fff', lineHeight: 1.1 }}>
                HRMPEB <span style={{ color: 'var(--clr-gold)' }}>ATS</span>
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, maxWidth: 280 }}>
              Kenya's modern applicant tracking platform — connecting top talent with great opportunities through intelligent, data-driven hiring.
            </p>
            <div style={{ display: 'flex', gap: 6, marginTop: 20 }}>
              {['var(--clr-primary-light)', 'var(--clr-gold)', 'var(--clr-green)'].map((c, i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
              ))}
            </div>
          </div>
          {col('For Candidates', [
            { label: 'Browse Jobs', to: '/jobs' },
            { label: 'Create Account', to: '/register' },
            { label: 'Sign In', to: '/login' },
          ])}
{col('Company', [
            { label: 'About HRMPEB', to: '/' },
            { label: 'Privacy Policy', to: '/' },
            { label: 'Terms of Use', to: '/' },
          ])}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>© {year} HRMPEB ATS. All rights reserved.</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', background: 'rgba(255,255,255,0.06)', padding: '3px 10px', borderRadius: 4 }}>🇰🇪 Kenya</span>
        </div>
      </div>
    </footer>
  );
}
