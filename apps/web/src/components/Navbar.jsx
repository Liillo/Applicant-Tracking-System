/**
 * HRMPEB ATS — Public Navbar
 */
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isLoggedIn, isApplicant, isAdmin, fullName, initials, logout } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [scrolled, setScrolled]       = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const close = () => setProfileOpen(false);
    if (profileOpen) document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [profileOpen]);

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    padding: '8px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
    color: isActive(path) ? '#fff' : 'rgba(255,255,255,0.78)',
    background: isActive(path) ? 'rgba(255,255,255,0.13)' : 'transparent',
    transition: 'all 0.18s', textDecoration: 'none',
  });

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 1000,
      background: 'var(--clr-primary)',
      height: 'var(--navbar-h)',
      display: 'flex', alignItems: 'center',
      padding: '0 40px',
      boxShadow: scrolled
        ? '0 4px 28px rgba(31,60,136,0.38)'
        : '0 2px 12px rgba(31,60,136,0.18)',
      transition: 'box-shadow 0.3s',
    }}>

      {/* Logo */}
      <Link to="/" style={{ display:'flex', alignItems:'center', gap:'clamp(8px, 1.6vw, 14px)', textDecoration:'none', flexShrink:0, marginRight: 'clamp(16px, 3vw, 32px)' }}>
        <img
          src="/hrmpeb-logo.png"
          alt="HRMPEB logo"
          style={{ width:'clamp(38px, 6vw, 54px)', height:'clamp(38px, 6vw, 54px)', objectFit:'contain', borderRadius:12, boxShadow:'0 2px 10px rgba(244,180,0,0.35)' }}
        />
        <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'clamp(15px, 2vw, 19px)', color:'#fff', letterSpacing:'-0.4px', lineHeight:1.1 }}>
          HRMPEB <span style={{ color:'var(--clr-gold)' }}>ATS</span>
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display:'flex', alignItems:'center', gap:4, flex:1 }}>
        <Link to="/"     style={linkStyle('/')}>Home</Link>
        <Link to="/jobs" style={linkStyle('/jobs')}>Browse Jobs</Link>
      </div>

      {/* Right */}
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        {!isLoggedIn ? (
          <>
            <Link to="/login" style={{
              padding:'8px 18px', borderRadius:8, fontSize:14, fontWeight:600,
              border:'1.5px solid rgba(255,255,255,0.35)', color:'#fff', transition:'all 0.18s',
            }}>Log In</Link>
            <Link to="/register" style={{
              padding:'9px 22px', borderRadius:8, fontSize:14, fontWeight:800,
              background:'var(--clr-gold)', color:'var(--clr-primary)',
              boxShadow:'0 4px 14px rgba(244,180,0,0.38)', transition:'all 0.18s',
            }}>Sign Up Free</Link>
          </>
        ) : (
          <div style={{ position:'relative' }}>
            <button onClick={e => { e.stopPropagation(); setProfileOpen(p => !p); }} style={{
              display:'flex', alignItems:'center', gap:9,
              background:'rgba(255,255,255,0.11)', border:'1.5px solid rgba(255,255,255,0.22)',
              borderRadius:10, padding:'6px 12px 6px 6px', cursor:'pointer',
            }}>
              <div style={{
                width:32, height:32, borderRadius:8, background:'var(--clr-gold)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontWeight:800, fontSize:13, color:'var(--clr-primary)', fontFamily:'var(--font-display)',
              }}>{initials}</div>
              <span style={{ color:'#fff', fontSize:13, fontWeight:600, maxWidth:110, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {fullName.split(' ')[0]}
              </span>
              <span style={{ color:'rgba(255,255,255,0.5)', fontSize:10 }}>▾</span>
            </button>

            {profileOpen && (
              <div className="animate-scale-in" style={{
                position:'absolute', top:'calc(100% + 10px)', right:0,
                background:'#fff', borderRadius:12, boxShadow:'var(--shadow-xl)',
                minWidth:200, overflow:'hidden', border:'1px solid var(--clr-border)',
              }}>
                <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--clr-border-soft)', background:'var(--clr-bg)' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--clr-text)' }}>{fullName || 'User'}</div>
                  <div style={{ fontSize:11, color:'var(--clr-muted)', marginTop:2 }}>
                    {isApplicant ? '🎓 Applicant' : '⚙️ Administrator'}
                  </div>
                </div>
                {isApplicant && (
                  <Link to="/dashboard" onClick={() => setProfileOpen(false)} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 16px', fontSize:13, fontWeight:600, color:'var(--clr-text)' }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--clr-bg)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <span>📊</span> My Dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/admin" onClick={() => setProfileOpen(false)} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 16px', fontSize:13, fontWeight:600, color:'var(--clr-text)' }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--clr-bg)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <span>⚙️</span> Admin Panel
                  </Link>
                )}
                <button onClick={() => { logout(); navigate('/'); setProfileOpen(false); }} style={{
                  width:'100%', textAlign:'left', display:'flex', alignItems:'center', gap:10,
                  padding:'11px 16px', fontSize:13, fontWeight:600, color:'var(--clr-red)',
                  background:'transparent', border:'none', borderTop:'1px solid var(--clr-border-soft)',
                  cursor:'pointer', fontFamily:'inherit',
                }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--clr-red-pale)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <span>🚪</span> Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
