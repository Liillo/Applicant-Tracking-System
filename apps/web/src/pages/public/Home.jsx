/**
 * HRMPEB ATS — Home Page (Module 2)
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Badge } from '../../components/UI';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

function useCountUp(target, duration = 1300, started = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!started) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, started]);
  return val;
}

function AnimatedStat({ value, suffix = '', label, started }) {
  const num = useCountUp(value, 1200, started);
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
        {num.toLocaleString()}<span style={{ color: 'var(--clr-gold)' }}>{suffix}</span>
      </div>
      <div style={{ color: 'rgba(255,255,255,0.58)', fontSize: 13, marginTop: 7, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function JobCard({ job, deptName, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link to={`/jobs/${job.id}`} style={{
      display: 'block', textDecoration: 'none',
      background: '#fff', borderRadius: 'var(--radius-lg)', padding: 24,
      border: `1.5px solid ${hovered ? 'var(--clr-primary)' : 'var(--clr-border-soft)'}`,
      boxShadow: hovered ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
      transform: hovered ? 'translateY(-4px)' : 'none',
      transition: 'all 0.22s ease',
      animation: `fadeIn 0.4s ease ${index * 0.07}s both`,
    }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--clr-primary-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>💼</div>
        <Badge label={job.status} dot />
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--clr-primary)', marginBottom: 4, lineHeight: 1.3 }}>{job.title}</div>
      <div style={{ fontSize: 13, color: 'var(--clr-muted)', marginBottom: 14 }}>{deptName} · {job.location}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        <Badge label={job.jobType} size="xs" />
        <Badge label={job.experienceLevel} size="xs" />
        {job.salaryMin && <Badge label={`KES ${(job.salaryMin/1000).toFixed(0)}k–${(job.salaryMax/1000).toFixed(0)}k`} size="xs" bg="var(--clr-green-pale)" color="var(--clr-green)" />}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--clr-border-soft)', fontSize: 12, color: 'var(--clr-muted)' }}>
        {job.deadline && <span>📅 {new Date(job.deadline).toLocaleDateString('en-KE',{day:'numeric',month:'short'})}</span>}
        <span style={{ color: hovered ? 'var(--clr-gold)' : 'var(--clr-primary)', fontWeight: 700, fontSize: 13, transition: 'color 0.2s' }}>Apply →</span>
      </div>
    </Link>
  );
}

function FeatureCard({ icon, title, desc, color, delay }) {
  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: 28, boxShadow: 'var(--shadow-md)', border: '1px solid var(--clr-border-soft)', animation: `fadeIn 0.4s ease ${delay}s both` }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 16 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--clr-text)', marginBottom: 8 }}>{title}</div>
      <p style={{ fontSize: 14, color: 'var(--clr-muted)', lineHeight: 1.7 }}>{desc}</p>
    </div>
  );
}

export default function Home() {
  const { isLoggedIn, isApplicant } = useAuth();
  const navigate = useNavigate();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [deptCount, setDeptCount] = useState(0);
  const [overview, setOverview] = useState({ totalJobs: 0, totalApplicants: 0, totalApplications: 0, satisfactionRate: 0 });
  const [featuredSlide, setFeaturedSlide] = useState(0);
  const [statsStarted, setStatsStarted] = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const statsRef = useRef(null);

  useEffect(() => {
    const loadFeaturedJobs = async () => {
      try {
        const jobs = await api.getJobs({ status: 'Open' });
        const open = Array.isArray(jobs) ? jobs.slice(0, 6) : [];
        setFeaturedJobs(open.map(j => ({
          job: j,
          deptName: j.department?.name || '-',
        })));
      } catch {
        setFeaturedJobs([]);
      }
    };

    loadFeaturedJobs();
  }, []);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [overviewData, departments] = await Promise.all([
          api.jobsOverview(),
          api.getDepartments(),
        ]);

        setDeptCount(Array.isArray(departments) ? departments.length : 0);
        setOverview({
          totalJobs: Number(overviewData?.totalOpenJobs || 0),
          totalApplicants: Number(overviewData?.totalApplicants || 0),
          totalApplications: Number(overviewData?.totalApplications || 0),
          satisfactionRate: Number(overviewData?.satisfactionRate || 0),
        });
      } catch {
        setDeptCount(0);
        setOverview({ totalJobs: 0, totalApplicants: 0, totalApplications: 0, satisfactionRate: 0 });
      }
    };

    loadOverview();
  }, []);

  useEffect(() => {
    if (!statsRef.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsStarted(true); }, { threshold: 0.3 });
    obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const handleSearch = (e) => { e.preventDefault(); navigate(`/jobs${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`); };

  const totalJobs = overview.totalJobs;
  const totalApplicants = overview.totalApplicants;
  const totalApplications = overview.totalApplications;
  const satisfactionRate = overview.satisfactionRate;

  const featuredSlides = useMemo(() => {
    const slides = [];
    for (let i = 0; i < featuredJobs.length; i += 2) {
      slides.push(featuredJobs.slice(i, i + 2));
    }
    return slides;
  }, [featuredJobs]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg,var(--clr-primary) 0%,var(--clr-primary-dark) 55%,#0e1c52 100%)', padding: '88px 40px 96px', position: 'relative', overflow: 'hidden' }}>
        {[{size:360,top:-100,right:-80,op:0.06},{size:220,top:80,right:80,op:0.04},{size:280,top:60,left:-60,op:0.04}].map((o,i)=>(
          <div key={i} style={{ position:'absolute', width:o.size, height:o.size, borderRadius:'50%', background:'var(--clr-gold)', opacity:o.op, top:o.top, right:o.right, left:o.left, pointerEvents:'none' }} />
        ))}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,transparent,var(--clr-gold),transparent)' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(244,180,0,0.14)', border:'1px solid rgba(244,180,0,0.35)', borderRadius:'var(--radius-full)', padding:'6px 16px', marginBottom:24, animation:'fadeIn 0.5s ease' }}>
                <span style={{ fontSize:14 }}>🏆</span>
                <span style={{ color:'var(--clr-gold)', fontSize:13, fontWeight:700 }}>Kenya's Leading Recruitment Platform</span>
              </div>
              <h1 style={{ fontFamily:'var(--font-display)', fontSize:52, fontWeight:800, color:'#fff', lineHeight:1.1, letterSpacing:'-1.5px', marginBottom:22, animation:'fadeIn 0.5s ease 0.1s both' }}>
                The Smarter Way<br />to <span style={{ color:'var(--clr-gold)' }}>Hire Talent.</span>
              </h1>
              <p style={{ color:'rgba(255,255,255,0.72)', fontSize:17, lineHeight:1.75, maxWidth:460, marginBottom:36, animation:'fadeIn 0.5s ease 0.2s both' }}>
                HRMPEB ATS streamlines your entire recruitment pipeline — from job posting to hire — with intelligent tracking, CV auto-parsing, and real-time analytics.
              </p>
              <form onSubmit={handleSearch} style={{ display:'flex', gap:0, background:'#fff', borderRadius:14, overflow:'hidden', boxShadow:'0 12px 40px rgba(0,0,0,0.22)', animation:'fadeIn 0.5s ease 0.3s both', marginBottom:28 }}>
                <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Job title, skill, or keyword…" style={{ flex:1, padding:'15px 20px', border:'none', outline:'none', fontSize:15, fontFamily:'inherit', color:'var(--clr-text)' }} />
                <button type="submit" style={{ padding:'15px 28px', background:'var(--clr-gold)', border:'none', color:'var(--clr-primary)', fontWeight:800, fontSize:15, cursor:'pointer', fontFamily:'inherit' }}>Search Jobs →</button>
              </form>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap', animation:'fadeIn 0.5s ease 0.35s both' }}>
                <Link to="/jobs" style={{ padding:'12px 28px', borderRadius:10, background:'rgba(255,255,255,0.12)', border:'1.5px solid rgba(255,255,255,0.28)', color:'#fff', fontWeight:700, fontSize:14 }}>
                  Browse {totalJobs} Open Jobs
                </Link>
                {!isLoggedIn && <Link to="/register" style={{ padding:'12px 28px', borderRadius:10, background:'var(--clr-green)', color:'#fff', fontWeight:700, fontSize:14 }}>Get Started Free</Link>}
                {isApplicant && <Link to="/dashboard" style={{ padding:'12px 28px', borderRadius:10, background:'var(--clr-green)', color:'#fff', fontWeight:700, fontSize:14 }}>My Dashboard →</Link>}
              </div>
            </div>

            <div style={{ display:'flex', justifyContent:'center' }}>
              <div style={{ background:'rgba(255,255,255,0.07)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.14)', borderRadius:20, padding:28, width:'100%', maxWidth:360, animation:'fadeIn 0.5s ease 0.15s both' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:22 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--clr-green)' }} />
                  <span style={{ color:'rgba(255,255,255,0.6)', fontSize:12, fontWeight:600, letterSpacing:0.5, textTransform:'uppercase' }}>Live Recruitment Stats</span>
                </div>
                {[
                  { label:'Open Positions',     value:totalJobs,         icon:'💼', color:'var(--clr-gold)' },
                  { label:'Registered Talent',  value:totalApplicants,   icon:'🎓', color:'var(--clr-green-light)' },
                  { label:'Applications In',    value:totalApplications, icon:'📋', color:'#a78bfa' },
                  { label:'Departments Hiring', value:deptCount, icon:'\uD83C\uDFE2', color:'var(--clr-gold)' },
                ].map(s=>(
                  <div key={s.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontSize:18 }}>{s.icon}</span>
                      <span style={{ color:'rgba(255,255,255,0.65)', fontSize:13 }}>{s.label}</span>
                    </div>
                    <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:18, color:s.color }}>{s.value}</span>
                  </div>
                ))}
                <Link to="/jobs" style={{ display:'block', textAlign:'center', marginTop:22, background:'var(--clr-gold)', color:'var(--clr-primary)', padding:'12px 20px', borderRadius:10, fontWeight:800, fontSize:14 }}>Explore All Jobs →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section ref={statsRef} style={{ background:'var(--clr-primary-dark)', padding:'44px 40px' }}>
        <div style={{ maxWidth:900, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
          <AnimatedStat value={totalJobs}         suffix="+" label="Open Positions"        started={statsStarted} />
          <AnimatedStat value={totalApplicants}   suffix="+" label="Registered Applicants" started={statsStarted} />
          <AnimatedStat value={totalApplications} suffix="+" label="Applications Submitted" started={statsStarted} />
          <AnimatedStat value={satisfactionRate}  suffix="%" label="Satisfaction Rate"      started={statsStarted} />
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background:'var(--clr-bg)', padding:'80px 40px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <div style={{ display:'inline-block', background:'var(--clr-primary-pale)', color:'var(--clr-primary)', padding:'5px 16px', borderRadius:'var(--radius-full)', fontSize:12, fontWeight:700, marginBottom:14, letterSpacing:0.5, textTransform:'uppercase' }}>Why HRMPEB ATS</div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:36, fontWeight:800, color:'var(--clr-primary)', letterSpacing:'-0.8px', marginBottom:12 }}>Everything You Need to Hire Smarter</h2>
            <p style={{ color:'var(--clr-muted)', fontSize:16, maxWidth:520, margin:'0 auto', lineHeight:1.7 }}>From intelligent CV parsing to real-time analytics — built for modern HR teams.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {[
              { icon:'🔍', color:'var(--clr-primary)', title:'Smart Job Matching',   desc:'Highlights the most relevant openings based on skills, location, and experience level.', delay:0 },
              { icon:'📄', color:'var(--clr-gold)',    title:'CV Auto-Parsing',       desc:'Upload a PDF resume and we automatically extract experience, education, and skills.', delay:0.07 },
              { icon:'📊', color:'var(--clr-green)',   title:'Real-Time Tracking',    desc:'Applicants monitor every stage. Admins get live status updates across all candidates.', delay:0.14 },
              { icon:'🗓', color:'#7c3aed',             title:'Interview Scheduling',  desc:'Schedule phone, video, or in-person interviews directly from the application dashboard.', delay:0.21 },
              { icon:'📈', color:'var(--clr-primary)', title:'Recruitment Analytics', desc:'Application trends, department breakdowns, status distributions, and hiring rates.', delay:0.28 },
              { icon:'🔒', color:'var(--clr-red)',     title:'Strict Access Control', desc:'Admin and applicant portals are completely isolated. No cross-role access — ever.', delay:0.35 },
            ].map(f=><FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* FEATURED JOBS */}
      <section style={{ background:'#fff', padding:'80px 40px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:36, flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ color:'var(--clr-gold)', fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:0.8, marginBottom:8 }}>● Live Openings</div>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:800, color:'var(--clr-primary)', letterSpacing:'-0.6px' }}>Featured Opportunities</h2>
            </div>
            <Link to="/jobs" style={{ padding:'10px 24px', borderRadius:10, background:'var(--clr-primary)', color:'#fff', fontWeight:700, fontSize:14 }}>View All Jobs →</Link>
          </div>
          {featuredJobs.length === 0 ? (
            <div style={{ textAlign:'center', padding:'48px 0', color:'var(--clr-muted)' }}>No open positions at this time.</div>
          ) : (
            <div>
              <div style={{ position:'relative', marginBottom:16 }}>
                {featuredSlides.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setFeaturedSlide(p => (p - 1 + featuredSlides.length) % featuredSlides.length)}
                      style={{ position:'absolute',left:-120,top:'50%',transform:'translateY(-50%)',zIndex:2,width:36,height:36,borderRadius:'50%',border:'1.5px solid var(--clr-border)',background:'#fff',color:'var(--clr-primary)',fontWeight:800,cursor:'pointer',boxShadow:'var(--shadow-sm)' }}
                    >
                      &lt;
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeaturedSlide(p => (p + 1) % featuredSlides.length)}
                      style={{ position:'absolute',right:-120,top:'50%',transform:'translateY(-50%)',zIndex:2,width:36,height:36,borderRadius:'50%',border:'1.5px solid var(--clr-border)',background:'#fff',color:'var(--clr-primary)',fontWeight:800,cursor:'pointer',boxShadow:'var(--shadow-sm)' }}
                    >
                      &gt;
                    </button>
                  </>
                )}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:20 }}>
                  {(featuredSlides[featuredSlide] || []).map(({job,deptName},i)=><JobCard key={job.id} job={job} deptName={deptName} index={i} />)}
                </div>
              </div>
              {featuredSlides.length > 1 && (
                <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:10 }}>
                  <div style={{ display:'flex', gap:6 }}>
                    {featuredSlides.map((_, i) => (
                      <span key={i} onClick={() => setFeaturedSlide(i)} style={{ width:i===featuredSlide?18:8,height:8,borderRadius:999,background:i===featuredSlide?'var(--clr-primary)':'var(--clr-border)',cursor:'pointer',transition:'all 0.2s' }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background:'var(--clr-bg)', padding:'80px 40px' }}>
        <div style={{ maxWidth:860, margin:'0 auto', textAlign:'center' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:800, color:'var(--clr-primary)', marginBottom:12 }}>How It Works</h2>
          <p style={{ color:'var(--clr-muted)', marginBottom:52, fontSize:15 }}>Three simple steps to your next career move</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:28 }}>
            {[
              { step:'01', icon:'🔍', title:'Discover Roles',  desc:'Browse jobs by department, type, level, or keyword. Filter to find your perfect fit.' },
              { step:'02', icon:'📝', title:'Apply with Ease', desc:'Upload your CV for auto-fill, or complete the form manually — your choice.' },
              { step:'03', icon:'🎉', title:'Get Hired',       desc:'Track your application status in real time from submission to offer.' },
            ].map((s,i)=>(
              <div key={i} style={{ background:'#fff', borderRadius:'var(--radius-lg)', padding:28, boxShadow:'var(--shadow-md)' }}>
                <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--clr-primary)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontWeight:800, fontSize:16, color:'var(--clr-gold)', margin:'0 auto 16px', boxShadow:'0 4px 16px rgba(31,60,136,0.25)' }}>{s.step}</div>
                <div style={{ fontSize:28, marginBottom:12 }}>{s.icon}</div>
                <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:17, color:'var(--clr-text)', marginBottom:8 }}>{s.title}</div>
                <p style={{ fontSize:14, color:'var(--clr-muted)', lineHeight:1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background:'linear-gradient(135deg,var(--clr-primary) 0%,var(--clr-primary-dark) 100%)', padding:'80px 40px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 20% 50%,rgba(244,180,0,0.07),transparent 60%),radial-gradient(circle at 80% 50%,rgba(0,135,83,0.06),transparent 60%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', maxWidth:600, margin:'0 auto' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:40, fontWeight:800, color:'#fff', letterSpacing:'-1px', marginBottom:16, lineHeight:1.15 }}>
            Ready to Find Your<br /><span style={{ color:'var(--clr-gold)' }}>Dream Role?</span>
          </h2>
          <p style={{ color:'rgba(255,255,255,0.68)', fontSize:16, lineHeight:1.7, marginBottom:36 }}>Join thousands of professionals who trust HRMPEB ATS for their career journey.</p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to={isLoggedIn ? '/jobs' : '/register'} style={{ padding:'14px 36px', borderRadius:12, background:'var(--clr-gold)', color:'var(--clr-primary)', fontWeight:800, fontSize:16, boxShadow:'0 8px 28px rgba(244,180,0,0.4)' }}>
              {isLoggedIn ? 'Browse Jobs →' : 'Create Free Account →'}
            </Link>
            <Link to="/jobs" style={{ padding:'14px 32px', borderRadius:12, border:'2px solid rgba(255,255,255,0.3)', color:'#fff', fontWeight:700, fontSize:15 }}>Explore Openings</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}


