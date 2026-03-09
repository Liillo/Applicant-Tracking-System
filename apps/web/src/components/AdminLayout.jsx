/**
 * HRMPEB ATS - Admin Layout (sidebar + topbar)
 * Shared wrapper for all admin pages.
 */
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { to:'/admin',              icon:'\uD83D\uDCCA', label:'Dashboard',     exact:true  },
  { to:'/admin/applications', icon:'\uD83D\uDCC2', label:'Applications'               },
  { to:'/admin/management',   icon:'\u2699\uFE0F', label:'Job Management'             },
];
const SIGN_OUT_ICON = String.fromCodePoint(0x1F6AA);

export default function AdminLayout({ children, title, subtitle }) {
  const { fullName, initials, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); toast.success('Signed out'); navigate('/admin/login'); };

  const isActive = (to, exact=false) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--clr-bg)' }}>
      <aside style={{
        width: collapsed ? 68 : 230,
        background: 'linear-gradient(180deg,var(--clr-primary) 0%,#0f1f4d 100%)',
        display: 'flex', flexDirection: 'column',
        flexShrink: 0, transition: 'width 0.25s ease',
        position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
        boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
      }}>
        <div style={{ height:3, background:'linear-gradient(90deg,var(--clr-gold),transparent)', flexShrink:0 }} />

        <div style={{ padding: collapsed?'16px 0':'16px clamp(12px, 2vw, 20px)', display:'flex', alignItems:'center', gap:'clamp(8px, 1.6vw, 12px)', justifyContent:collapsed?'center':'flex-start', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0 }}>
          <img src="/hrmpeb-logo.png" alt="HRMPEB logo" style={{ width:'clamp(38px, 7vw, 56px)', height:'clamp(38px, 7vw, 56px)', objectFit:'contain', borderRadius:10, flexShrink:0 }} />
          {!collapsed && (
            <div>
              <div style={{ fontFamily:'var(--font-display)',fontWeight:800,fontSize:'clamp(13px, 1.6vw, 16px)',color:'#fff',letterSpacing:'-0.2px',lineHeight:1.15 }}>HRMPEB</div>
              <div style={{ fontSize:9,color:'rgba(255,255,255,0.4)',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase' }}>Admin Portal</div>
            </div>
          )}
        </div>

        <nav style={{ flex:1, padding:'12px 8px', overflowY:'auto' }}>
          {NAV.map(n => {
            const active = isActive(n.to, n.exact);
            return (
              <Link key={n.to} to={n.to} title={collapsed?n.label:''} style={{
                display:'flex', alignItems:'center', gap:10,
                padding: collapsed?'11px 0':'11px 12px',
                justifyContent: collapsed?'center':'flex-start',
                borderRadius:10, marginBottom:3,
                background: active?'rgba(255,255,255,0.13)':'transparent',
                borderLeft: active?'3px solid var(--clr-gold)':'3px solid transparent',
                transition:'all 0.18s', textDecoration:'none',
              }}
                onMouseEnter={e=>{ if(!active) e.currentTarget.style.background='rgba(255,255,255,0.07)'; }}
                onMouseLeave={e=>{ if(!active) e.currentTarget.style.background='transparent'; }}
              >
                <span style={{ width:24,height:24,borderRadius:6,background:active?'rgba(244,180,0,0.2)':'rgba(255,255,255,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:active?'var(--clr-gold)':'#fff',flexShrink:0 }}>
                  {n.icon}
                </span>
                {!collapsed && <span style={{ fontSize:13,fontWeight:active?700:500,color:active?'#fff':'rgba(255,255,255,0.65)',whiteSpace:'nowrap' }}>{n.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: collapsed?'12px 0':'12px 12px', borderTop:'1px solid rgba(255,255,255,0.08)', flexShrink:0 }}>
          {!collapsed && (
            <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10,padding:'8px 10px',background:'rgba(255,255,255,0.06)',borderRadius:10 }}>
              <div style={{ width:30,height:30,borderRadius:8,background:'var(--clr-gold)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:12,color:'var(--clr-primary)',fontFamily:'var(--font-display)',flexShrink:0 }}>{initials}</div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:12,fontWeight:700,color:'#fff',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{fullName||'Admin'}</div>
                <div style={{ fontSize:10,color:'rgba(255,255,255,0.4)' }}>Administrator</div>
              </div>
            </div>
          )}
          <button onClick={handleLogout} title={collapsed?'Sign Out':''} style={{ width:'100%',display:'flex',alignItems:'center',gap:10,justifyContent:collapsed?'center':'flex-start',padding:collapsed?'10px 0':'10px 12px',background:'rgba(220,38,38,0.12)',border:'1px solid rgba(220,38,38,0.2)',borderRadius:9,color:'#f87171',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'all 0.18s' }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(220,38,38,0.22)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(220,38,38,0.12)'}>
            <span style={{ fontSize:14, lineHeight:1 }}>{SIGN_OUT_ICON}</span>
            {!collapsed && 'Sign Out'}
          </button>
        </div>
      </aside>

      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        <header style={{ background:'#fff',borderBottom:'1px solid var(--clr-border-soft)',padding:'0 22px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0,boxShadow:'var(--shadow-sm)',position:'sticky',top:0,zIndex:100 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <button
              type="button"
              onClick={() => setCollapsed(c => !c)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{ width:34,height:34,borderRadius:8,border:'1.5px solid var(--clr-border)',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}
            >
              <span style={{ width:14, height:10, position:'relative', display:'inline-block' }}>
                <span style={{ position:'absolute', left:0, right:0, top:0, height:2, background:'var(--clr-primary)', borderRadius:2 }} />
                <span style={{ position:'absolute', left:0, right:0, top:4, height:2, background:'var(--clr-primary)', borderRadius:2 }} />
                <span style={{ position:'absolute', left:0, right:0, top:8, height:2, background:'var(--clr-primary)', borderRadius:2 }} />
              </span>
            </button>
            <div>
              <h1 style={{ fontFamily:'var(--font-display)',fontWeight:800,fontSize:19,color:'var(--clr-primary)',lineHeight:1.2 }}>{title}</h1>
              {subtitle && <p style={{ fontSize:12,color:'var(--clr-muted)',marginTop:1 }}>{subtitle}</p>}
            </div>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <div style={{ fontSize:12,color:'var(--clr-muted)',background:'var(--clr-bg)',padding:'5px 12px',borderRadius:8,border:'1px solid var(--clr-border-soft)' }}>
              {new Date().toLocaleDateString('en-KE',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}
            </div>
          </div>
        </header>

        <main style={{ flex:1, padding:'28px 32px', overflowY:'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
