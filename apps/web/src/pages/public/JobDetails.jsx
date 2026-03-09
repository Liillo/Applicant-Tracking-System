/**
 * HRMPEB ATS — Job Details Page (Module 2)
 */
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Badge, Button, PageLoader } from '../../components/UI';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

function BulletList({ text }) {
  if (!text) return null;
  const lines = text.split('\n').map(l=>l.trim()).filter(Boolean);
  return (
    <ul style={{ listStyle:'none', padding:0, margin:0 }}>
      {lines.map((l,i)=>(
        <li key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:8, fontSize:14, color:'var(--clr-text-soft)', lineHeight:1.65 }}>
          <span style={{ color:'var(--clr-gold)', fontWeight:700, marginTop:1, flexShrink:0 }}>›</span>
          <span>{l}</span>
        </li>
      ))}
    </ul>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 0', borderBottom:'1px solid var(--clr-border-soft)' }}>
      <span style={{ fontSize:18, flexShrink:0 }}>{icon}</span>
      <div>
        <div style={{ fontSize:10, fontWeight:700, color:'var(--clr-muted)', textTransform:'uppercase', letterSpacing:0.6 }}>{label}</div>
        <div style={{ fontSize:14, fontWeight:600, color:'var(--clr-text)', marginTop:1 }}>{value || '—'}</div>
      </div>
    </div>
  );
}

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, isApplicant, isAdmin } = useAuth();

  const [job,     setJob]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);
  const [appCount,setAppCount]= useState(0);
  const [deptName,setDeptName]= useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const j = await api.getJob(id);
        if (!j) { navigate('/jobs'); return; }
        setJob(j);
        setDeptName(j.department?.name || '—');
        setAppCount(j._count?.applications || 0);
        // Related jobs: fetch open jobs same department
        try {
          const allOpen = await api.getJobs({ status: 'Open', departmentId: j.departmentId });
          setRelated(allOpen.filter(r => r.id !== id).slice(0, 3).map(r => ({
            job: r, deptName: r.department?.name || '—',
          })));
        } catch(_) {}
      } catch(err) {
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div style={{ minHeight:'100vh' }}><Navbar /><PageLoader text="Loading job details…" /></div>;
  if (!job)    return null;

  const skills = (job.skillsRequired || '').split(',').map(s=>s.trim()).filter(Boolean);
  const isDeadlinePast = job.deadline && new Date(job.deadline) < new Date();

  const canApply = isApplicant && job.status === 'Open' && !isDeadlinePast;

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      toast.success('Link copied');
    } catch (_) {
      toast.error('Could not copy link');
    }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <Navbar />

      {/* Hero header */}
      <section style={{ background:'linear-gradient(135deg,var(--clr-primary),var(--clr-primary-dark))', padding:'48px 40px 52px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-60, right:-60, width:280, height:280, borderRadius:'50%', background:'rgba(244,180,0,0.05)', pointerEvents:'none' }} />
        <div style={{ width:'100%', margin:0, position:'relative' }}>
          <Link to="/jobs" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'rgba(255,255,255,0.6)', fontSize:13, fontWeight:500, marginBottom:24, transition:'color 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.6)'}>
            ← Back to Job Search
          </Link>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:24, flexWrap:'wrap' }}>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                <div style={{ width:56, height:56, borderRadius:14, background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>💼</div>
                <div>
                  <h1 style={{ fontFamily:'var(--font-display)', fontSize:34, fontWeight:800, color:'#fff', lineHeight:1.15, letterSpacing:'-0.8px', marginBottom:4 }}>{job.title}</h1>
                  <div style={{ color:'rgba(255,255,255,0.65)', fontSize:14 }}>{deptName} · {job.location}</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                <Badge label={job.jobType} />
                <Badge label={job.experienceLevel} />
                <Badge label={job.status} dot />
                {job.salaryMin && <Badge label={`KES ${(job.salaryMin/1000).toFixed(0)}k – ${(job.salaryMax/1000).toFixed(0)}k /mo`} bg="rgba(0,135,83,0.25)" color="#4ade80" />}
              </div>
            </div>

            {/* Quick stats card */}
            <div style={{ background:'rgba(255,255,255,0.1)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:16, padding:'20px 24px', minWidth:200, flexShrink:0 }}>
              {[
                { label:'Applicants', value:`${appCount} applied` },
                { label:'Openings',   value:`${job.slots} slot${job.slots>1?'s':''}` },
                { label:'Deadline',   value: job.deadline ? new Date(job.deadline).toLocaleDateString('en-KE',{day:'numeric',month:'long',year:'numeric'}) : 'Open' },
                { label:'Views',      value:`${job.views} views` },
              ].map(r=>(
                <div key={r.label} style={{ display:'flex', justifyContent:'space-between', gap:16, padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ color:'rgba(255,255,255,0.55)', fontSize:12 }}>{r.label}</span>
                  <span style={{ color:'#fff', fontWeight:700, fontSize:13 }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div style={{ width:'100%', margin:0, padding:'36px 40px', display:'grid', gridTemplateColumns:'1fr 360px', gap:28, flex:1 }}>

        {/* Left: full job info */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {/* Description */}
          {job.description && (
            <div style={{ background:'#fff', borderRadius:'var(--radius-lg)', padding:28, boxShadow:'var(--shadow-sm)', border:'1px solid var(--clr-border-soft)' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:17, color:'var(--clr-primary)', marginBottom:8, paddingBottom:10, borderBottom:'2px solid var(--clr-gold)' }}>Role Overview</h2>
              <p style={{ fontSize:14, color:'var(--clr-text-soft)', lineHeight:1.8 }}>{job.description}</p>
            </div>
          )}

          {/* Responsibilities */}
          {job.responsibilities && (
            <div style={{ background:'#fff', borderRadius:'var(--radius-lg)', padding:28, boxShadow:'var(--shadow-sm)', border:'1px solid var(--clr-border-soft)' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:17, color:'var(--clr-primary)', marginBottom:16, paddingBottom:10, borderBottom:'2px solid var(--clr-gold)' }}>Responsibilities</h2>
              <BulletList text={job.responsibilities} />
            </div>
          )}

          {/* Requirements */}
          {job.requirements && (
            <div style={{ background:'#fff', borderRadius:'var(--radius-lg)', padding:28, boxShadow:'var(--shadow-sm)', border:'1px solid var(--clr-border-soft)' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:17, color:'var(--clr-primary)', marginBottom:16, paddingBottom:10, borderBottom:'2px solid var(--clr-gold)' }}>Requirements</h2>
              <BulletList text={job.requirements} />
            </div>
          )}

          {/* Benefits */}
          {job.benefits && (
            <div style={{ background:'#fff', borderRadius:'var(--radius-lg)', padding:28, boxShadow:'var(--shadow-sm)', border:'1px solid var(--clr-border-soft)' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:17, color:'var(--clr-primary)', marginBottom:16, paddingBottom:10, borderBottom:'2px solid var(--clr-gold)' }}>Benefits & Perks</h2>
              <BulletList text={job.benefits} />
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div style={{ background:'#fff', borderRadius:'var(--radius-lg)', padding:28, boxShadow:'var(--shadow-sm)', border:'1px solid var(--clr-border-soft)' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:17, color:'var(--clr-primary)', marginBottom:16, paddingBottom:10, borderBottom:'2px solid var(--clr-gold)' }}>Skills Required</h2>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {skills.map(s=>(
                  <span key={s} style={{ background:'var(--clr-primary-pale)', color:'var(--clr-primary)', padding:'7px 16px', borderRadius:'var(--radius-full)', fontSize:13, fontWeight:600, border:'1px solid rgba(31,60,136,0.12)' }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Related Jobs */}
          {related.length > 0 && (
            <div style={{ background:'#fff', borderRadius:'var(--radius-lg)', padding:28, boxShadow:'var(--shadow-sm)', border:'1px solid var(--clr-border-soft)' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:17, color:'var(--clr-primary)', marginBottom:20, paddingBottom:10, borderBottom:'2px solid var(--clr-gold)' }}>Related Opportunities</h2>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
                {related.map(({job:r,deptName:dn})=>(
                  <Link key={r.id} to={`/jobs/${r.id}`} style={{ display:'block', background:'var(--clr-bg)', borderRadius:'var(--radius-md)', padding:16, textDecoration:'none', border:'1px solid var(--clr-border-soft)', transition:'all 0.18s' }}
                    onMouseEnter={e=>{e.currentTarget.style.background='var(--clr-primary-pale)';e.currentTarget.style.borderColor='var(--clr-primary)'}}
                    onMouseLeave={e=>{e.currentTarget.style.background='var(--clr-bg)';e.currentTarget.style.borderColor='var(--clr-border-soft)'}}>
                    <div style={{ fontWeight:700, fontSize:13, color:'var(--clr-primary)', marginBottom:4, lineHeight:1.3 }}>{r.title}</div>
                    <div style={{ fontSize:12, color:'var(--clr-muted)', marginBottom:8 }}>{r.location}</div>
                    <Badge label={r.jobType} size="xs" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Apply sidebar */}
        <div>
          <div style={{ background:'#fff', borderRadius:'var(--radius-lg)', padding:24, boxShadow:'var(--shadow-md)', border:'1px solid var(--clr-border-soft)', position:'sticky', top:'calc(var(--navbar-h) + 20px)' }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:17, color:'var(--clr-primary)', marginBottom:20 }}>Apply for This Role</div>

            {/* Apply CTA */}
            {canApply && (
              <Link to={`/apply/${job.id}`} style={{ display:'block', background:'linear-gradient(135deg,var(--clr-gold),var(--clr-gold-dark))', color:'var(--clr-primary)', textAlign:'center', padding:'15px 20px', borderRadius:12, fontWeight:800, fontSize:16, marginBottom:12, boxShadow:'0 8px 24px rgba(244,180,0,0.38)', transition:'transform 0.18s' }}
                onMouseEnter={e=>e.currentTarget.style.transform='scale(1.02)'}
                onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                Apply Now →
              </Link>
            )}

            {!isLoggedIn && (
              <>
                <Link to={`/register?next=/apply/${job.id}`} style={{ display:'block', background:'var(--clr-gold)', color:'var(--clr-primary)', textAlign:'center', padding:'14px 20px', borderRadius:12, fontWeight:800, fontSize:15, marginBottom:10 }}>
                  Create Account to Apply
                </Link>
                <Link to={`/login?next=/apply/${job.id}`} style={{ display:'block', background:'var(--clr-primary-pale)', color:'var(--clr-primary)', textAlign:'center', padding:'12px 20px', borderRadius:10, fontWeight:700, fontSize:14, marginBottom:16 }}>
                  Log In & Apply
                </Link>
              </>
            )}

            {isAdmin && (
              <div style={{ background:'var(--clr-bg)', borderRadius:10, padding:14, fontSize:13, color:'var(--clr-muted)', textAlign:'center', marginBottom:16 }}>
                ⚙️ You're viewing as Admin. <Link to="/admin/management" style={{ color:'var(--clr-primary)', fontWeight:700 }}>Manage this job →</Link>
              </div>
            )}

            {isDeadlinePast && isApplicant && (
              <div style={{ background:'var(--clr-red-pale)', border:'1px solid rgba(220,38,38,0.2)', borderRadius:10, padding:12, fontSize:13, color:'var(--clr-red)', textAlign:'center', marginBottom:16 }}>
                ⚠️ The deadline for this position has passed.
              </div>
            )}

            {job.status === 'Closed' && (
              <div style={{ background:'var(--clr-bg)', borderRadius:10, padding:12, fontSize:13, color:'var(--clr-muted)', textAlign:'center', marginBottom:16 }}>
                🔒 This position is currently closed.
              </div>
            )}

            {/* Job Info */}
            <div style={{ borderTop:'1px solid var(--clr-border-soft)', paddingTop:16 }}>
              <InfoRow icon="🏢" label="Department" value={deptName} />
              <InfoRow icon="📍" label="Location"   value={job.location} />
              <InfoRow icon="⏰" label="Job Type"   value={job.jobType} />
              <InfoRow icon="📈" label="Level"      value={job.experienceLevel} />
              <InfoRow icon="🪑" label="Openings"   value={`${job.slots} position${job.slots>1?'s':''}`} />
              <InfoRow icon="💰" label="Salary"     value={job.salaryMin ? `KES ${job.salaryMin.toLocaleString()} – ${job.salaryMax?.toLocaleString()} / ${job.salaryPeriod}` : 'Competitive'} />
              {job.deadline && <InfoRow icon="📅" label="Deadline" value={new Date(job.deadline).toLocaleDateString('en-KE',{weekday:'short',day:'numeric',month:'long',year:'numeric'})} />}
            </div>

            {/* Share */}
            <div style={{ marginTop:20, paddingTop:20, borderTop:'1px solid var(--clr-border-soft)' }}>
              <div style={{ fontSize:12, color:'var(--clr-muted)', fontWeight:600, marginBottom:10, textTransform:'uppercase', letterSpacing:0.5 }}>Share this role</div>
              <div style={{ display:'flex', gap:8 }}>
                {[{ label:'Copy Link', icon:'🔗' }].map(b=>(
                  <button key={b.label} onClick={handleCopyLink} style={{ flex:1, background:'var(--clr-bg)', border:'1px solid var(--clr-border)', borderRadius:8, padding:'8px 12px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:'var(--clr-text)', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                    {b.icon} {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
