/**
 * HRMPEB ATS - Applicant Register
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

function RegisterField({
  label,
  name,
  type = 'text',
  placeholder,
  icon,
  autoComplete,
  value,
  error,
  onChange,
  showPw,
  onTogglePw,
}) {
  return (
    <div>
      <label style={{ display:'block',fontSize:13,fontWeight:600,color:'var(--clr-text-soft)',marginBottom:6 }}>
        {label} <span style={{ color:'var(--clr-red)' }}>*</span>
      </label>
      <div style={{ position:'relative' }}>
        <span style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:15,pointerEvents:'none' }}>{icon}</span>
        <input
          type={type === 'password' ? (showPw ? 'text' : 'password') : type}
          value={value}
          onChange={e => onChange(name, e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={{ width:'100%',padding:'12px 14px 12px 40px',border:`1.5px solid ${error?'var(--clr-red)':'var(--clr-border)'}`,borderRadius:10,fontSize:14,fontFamily:'inherit',color:'var(--clr-text)',background:'#fff',outline:'none',boxSizing:'border-box',transition:'border-color 0.18s' }}
          onFocus={e=>e.target.style.borderColor=error?'var(--clr-red)':'var(--clr-primary)'}
          onBlur={e=>e.target.style.borderColor=error?'var(--clr-red)':'var(--clr-border)'}
        />
        {name === 'password' && (
          <button type="button" onClick={onTogglePw} style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:15 }}>
            {showPw ? '🙈' : '👁️'}
          </button>
        )}
      </div>
      {error && <p style={{ marginTop:5,fontSize:12,color:'var(--clr-red)' }}>{error}</p>}
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', password:'', confirm:'' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [agreed, setAgreed] = useState(false);

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email) e.email = 'Email is required';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    if (!agreed) e.agreed = 'You must agree to continue';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const pwStrength = (() => {
    const p = form.password;
    if (!p) return { score:0, label:'', color:'var(--clr-border)' };
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    const map = [
      { label:'Weak', color:'var(--clr-red)' },
      { label:'Fair', color:'#f59e0b' },
      { label:'Good', color:'#3b82f6' },
      { label:'Strong', color:'var(--clr-green)' },
      { label:'Very Strong', color:'var(--clr-green)' },
    ];
    return { score:s, ...map[s] };
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.email, form.password, form.firstName.trim(), form.lastName.trim());
      toast.success('Account created! Welcome to HRMPEB ATS 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      setErrors({ email: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 1fr' }}>
      <div style={{ background:'linear-gradient(145deg,var(--clr-primary) 0%,var(--clr-primary-dark) 60%,#0a1535 100%)', display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',padding:'60px 56px',position:'relative',overflow:'hidden' }}>
        {[{w:300,h:300,t:-60,r:-60,op:0.06},{w:180,h:180,b:60,l:40,op:0.04}].map((o,i)=>(
          <div key={i} style={{ position:'absolute',width:o.w,height:o.h,borderRadius:'50%',background:'var(--clr-gold)',opacity:o.op,top:o.t,right:o.r,bottom:o.b,left:o.l,pointerEvents:'none' }} />
        ))}
        <div style={{ position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,transparent,var(--clr-gold),transparent)' }} />

        <div style={{ marginBottom:40,animation:'fadeIn 0.5s ease' }}>
          <Link to="/" style={{ display:'flex',alignItems:'center',gap:12,textDecoration:'none' }}>
            <div style={{ width:52,height:52,background:'var(--clr-gold)',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-display)',fontWeight:800,fontSize:24,color:'var(--clr-primary)' }}>H</div>
            <span style={{ fontFamily:'var(--font-display)',fontWeight:800,fontSize:22,color:'#fff',letterSpacing:'-0.5px' }}>HRMPEB <span style={{ color:'var(--clr-gold)' }}>ATS</span></span>
          </Link>
        </div>

        <div style={{ maxWidth:360,animation:'fadeIn 0.5s ease 0.1s both' }}>
          <h2 style={{ fontFamily:'var(--font-display)',fontSize:36,fontWeight:800,color:'#fff',lineHeight:1.15,letterSpacing:'-1px',marginBottom:18 }}>
            Join Thousands of<br /><span style={{ color:'var(--clr-gold)' }}>Top Professionals.</span>
          </h2>
          <p style={{ color:'rgba(255,255,255,0.6)',fontSize:15,lineHeight:1.75,marginBottom:36 }}>
            Create your free account and get matched with the best job opportunities across Kenya in minutes.
          </p>
          {[
            { icon:'✅', text:'100% free to apply' },
            { icon:'🎯', text:'Personalized job recommendations' },
            { icon:'⚡', text:'Apply in minutes with CV upload' },
            { icon:'📱', text:'Track every application in real time' },
          ].map(f=>(
            <div key={f.text} style={{ display:'flex',alignItems:'center',gap:12,marginBottom:13 }}>
              <div style={{ width:32,height:32,borderRadius:8,background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.14)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,flexShrink:0 }}>{f.icon}</div>
              <span style={{ color:'rgba(255,255,255,0.72)',fontSize:14 }}>{f.text}</span>
            </div>
          ))}
        </div>

        <div style={{ position:'absolute',bottom:32,left:0,right:0,textAlign:'center',color:'rgba(255,255,255,0.38)',fontSize:12,fontWeight:500 }}>
          Applicant registration portal
        </div>
      </div>

      <div style={{ display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',padding:'48px 56px',background:'var(--clr-bg)',overflowY:'auto' }}>
        <div style={{ width:'100%',maxWidth:420,animation:'fadeIn 0.4s ease' }}>
          <div style={{ marginBottom:28 }}>
            <h1 style={{ fontFamily:'var(--font-display)',fontSize:28,fontWeight:800,color:'var(--clr-primary)',marginBottom:6,letterSpacing:'-0.5px' }}>Create your account</h1>
            <p style={{ color:'var(--clr-muted)',fontSize:14 }}>Get started - it is free and takes 30 seconds</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:16 }}>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
              <RegisterField label="First Name" name="firstName" icon="👤" placeholder="Jane" autoComplete="given-name" value={form.firstName} error={errors.firstName} onChange={set} showPw={showPw} onTogglePw={()=>setShowPw(p=>!p)} />
              <RegisterField label="Last Name" name="lastName" icon="👤" placeholder="Wanjiku" autoComplete="family-name" value={form.lastName} error={errors.lastName} onChange={set} showPw={showPw} onTogglePw={()=>setShowPw(p=>!p)} />
            </div>

            <RegisterField label="Email Address" name="email" type="email" icon="✉️" placeholder="you@example.com" autoComplete="email" value={form.email} error={errors.email} onChange={set} showPw={showPw} onTogglePw={()=>setShowPw(p=>!p)} />

            <div>
              <RegisterField label="Password" name="password" type="password" icon="🔒" placeholder="Min. 6 characters" autoComplete="new-password" value={form.password} error={errors.password} onChange={set} showPw={showPw} onTogglePw={()=>setShowPw(p=>!p)} />
              {form.password && (
                <div style={{ marginTop:8 }}>
                  <div style={{ display:'flex',gap:4,marginBottom:5 }}>
                    {[0,1,2,3].map(i=>(
                      <div key={i} style={{ flex:1,height:3,borderRadius:2,background:i<pwStrength.score?pwStrength.color:'var(--clr-border)',transition:'background 0.3s' }} />
                    ))}
                  </div>
                  <span style={{ fontSize:11,fontWeight:600,color:pwStrength.color }}>{pwStrength.label}</span>
                </div>
              )}
            </div>

            <RegisterField label="Confirm Password" name="confirm" type="password" icon="🔒" placeholder="Repeat password" autoComplete="new-password" value={form.confirm} error={errors.confirm} onChange={set} showPw={showPw} onTogglePw={()=>setShowPw(p=>!p)} />

            <div>
              <label style={{ display:'flex',alignItems:'flex-start',gap:10,cursor:'pointer' }}>
                <input type="checkbox" checked={agreed} onChange={e=>{ setAgreed(e.target.checked); setErrors(p=>({...p,agreed:''})); }} style={{ width:16,height:16,accentColor:'var(--clr-primary)',marginTop:2,flexShrink:0 }} />
                <span style={{ fontSize:13,color:'var(--clr-muted)',lineHeight:1.55 }}>
                  I agree to HRMPEB ATS&apos;s{' '}
                  <Link to="/" style={{ color:'var(--clr-primary)',fontWeight:600 }}>Terms of Service</Link> and{' '}
                  <Link to="/" style={{ color:'var(--clr-primary)',fontWeight:600 }}>Privacy Policy</Link>
                </span>
              </label>
              {errors.agreed && <p style={{ marginTop:5,fontSize:12,color:'var(--clr-red)' }}>{errors.agreed}</p>}
            </div>

            <button type="submit" disabled={loading} style={{ width:'100%',padding:'14px 20px',borderRadius:10,background:loading?'var(--clr-muted)':'var(--clr-primary)',color:'#fff',fontWeight:800,fontSize:15,border:'none',cursor:loading?'not-allowed':'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:10,boxShadow:'0 6px 20px rgba(31,60,136,0.25)',transition:'all 0.18s' }}>
              {loading ? (
                <>
                  <span style={{ width:16,height:16,border:'2px solid rgba(255,255,255,0.4)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.7s linear infinite',display:'inline-block' }} />
                  Creating account...
                </>
              ) : 'Create Account ->'}
            </button>
          </form>

          <div style={{ display:'flex',alignItems:'center',gap:12,margin:'22px 0' }}>
            <div style={{ flex:1,height:1,background:'var(--clr-border-soft)' }} />
            <span style={{ fontSize:12,color:'var(--clr-muted)',fontWeight:600 }}>Already have an account?</span>
            <div style={{ flex:1,height:1,background:'var(--clr-border-soft)' }} />
          </div>

          <Link to="/login" style={{ display:'block',textAlign:'center',width:'100%',padding:'13px 20px',borderRadius:10,border:'1.5px solid var(--clr-primary)',color:'var(--clr-primary)',fontWeight:700,fontSize:15,transition:'all 0.18s',boxSizing:'border-box' }}
            onMouseEnter={e=>{e.currentTarget.style.background='var(--clr-primary)';e.currentTarget.style.color='#fff';}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--clr-primary)';}}>
            Sign In Instead
          </Link>
        </div>
      </div>
    </div>
  );
}
