/**
 * HRMPEB ATS — Job Search Page (Module 2)
 */
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Badge, EmptyState } from '../../components/UI';
import { api } from '../../utils/api';

const TYPES  = ['Full-Time','Part-Time','Contract','Internship','Remote','Hybrid'];
const LEVELS = ['Entry','Junior','Mid','Senior','Executive'];

function JobCard({ job, deptName, appCount }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link to={`/jobs/${job.id}`} style={{ display:'block', textDecoration:'none', background:'#fff', borderRadius:'var(--radius-lg)', padding:22, border:`1.5px solid ${hovered?'var(--clr-primary)':'var(--clr-border-soft)'}`, boxShadow: hovered?'var(--shadow-md)':'var(--shadow-sm)', transition:'all 0.2s', marginBottom:14 }}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:'var(--clr-primary-pale)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>💼</div>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, color:'var(--clr-primary)', lineHeight:1.2 }}>{job.title}</div>
              <div style={{ fontSize:12, color:'var(--clr-muted)', marginTop:2 }}>{deptName} · {job.location}</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
            <Badge label={job.jobType} size="xs" />
            <Badge label={job.experienceLevel} size="xs" />
            {job.salaryMin && <Badge label={`KES ${(job.salaryMin/1000).toFixed(0)}k–${(job.salaryMax/1000).toFixed(0)}k /mo`} size="xs" bg="var(--clr-green-pale)" color="var(--clr-green)" />}
          </div>
          <p style={{ fontSize:13, color:'var(--clr-muted)', lineHeight:1.6, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
            {job.description}
          </p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8, flexShrink:0 }}>
          <Badge label={job.status} dot />
          <div style={{ fontSize:11, color:'var(--clr-muted)', textAlign:'right' }}>
            <div>👥 {appCount} applied</div>
            {job.deadline && <div style={{ marginTop:3 }}>📅 {new Date(job.deadline).toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'})}</div>}
          </div>
          {job.slots > 1 && <div style={{ fontSize:11, color:'var(--clr-muted)' }}>🪑 {job.slots} slots</div>}
        </div>
      </div>
      <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid var(--clr-border-soft)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', gap:6 }}>
          {(job.skillsRequired||'').split(',').filter(Boolean).slice(0,3).map(s=>(
            <span key={s} style={{ fontSize:11, background:'var(--clr-primary-pale)', color:'var(--clr-primary)', padding:'2px 8px', borderRadius:'var(--radius-full)', fontWeight:600 }}>{s.trim()}</span>
          ))}
        </div>
        <span style={{ fontSize:13, fontWeight:700, color:hovered?'var(--clr-gold)':'var(--clr-primary)', transition:'color 0.18s' }}>View & Apply →</span>
      </div>
    </Link>
  );
}

export default function JobSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search,   setSearch]   = useState(searchParams.get('search') || '');
  const [filters,  setFilters]  = useState({ department:'', type:'', level:'' });
  const [jobs,     setJobs]     = useState([]);
  const [depts,    setDepts]    = useState([]);
  const [input,    setInput]    = useState(search);

  useEffect(() => {
    api.getDepartments().then(setDepts).catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const params = {};
        if (search)              params.search       = search;
        if (filters.department)  params.departmentId = depts.find(d => d.name === filters.department)?.id;
        if (filters.type)        params.type         = filters.type;
        if (filters.level)       params.level        = filters.level;
        params.status = 'Open';
        const results = await api.getJobs(params);
        setJobs(results.map(j => ({
          job:      j,
          deptName: j.department?.name || '—',
          appCount: j._count?.applications || 0,
        })));
      } catch(err) { /* silent */ }
    };
    load();
  }, [search, filters, depts]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(input); };

  const clearFilters = () => { setFilters({ department:'', type:'', level:'' }); setSearch(''); setInput(''); };

  const hasActiveFilter = search || filters.department || filters.type || filters.level;

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      <Navbar />

      {/* Search Hero */}
      <section style={{ background:'linear-gradient(135deg,var(--clr-primary),var(--clr-primary-dark))', padding:'52px 40px' }}>
        <div style={{ maxWidth:800, margin:'0 auto', textAlign:'center' }}>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:38, fontWeight:800, color:'#fff', marginBottom:8, letterSpacing:'-0.8px', animation:'fadeIn 0.4s ease' }}>
            Find Your Next Opportunity
          </h1>
          <p style={{ color:'rgba(255,255,255,0.68)', fontSize:16, marginBottom:32, animation:'fadeIn 0.4s ease 0.1s both' }}>
            Browse {jobs.length} open position{jobs.length !== 1 ? 's' : ''} across Kenya's top employers
          </p>
          <form onSubmit={handleSearch} style={{ display:'flex', gap:0, background:'#fff', borderRadius:14, overflow:'hidden', boxShadow:'0 12px 36px rgba(0,0,0,0.2)', animation:'fadeIn 0.4s ease 0.15s both' }}>
            <span style={{ display:'flex', alignItems:'center', paddingLeft:18, color:'var(--clr-muted)', fontSize:18 }}>🔍</span>
            <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Job title, skill, or keyword…"
              style={{ flex:1, padding:'15px 16px', border:'none', outline:'none', fontSize:15, fontFamily:'inherit', color:'var(--clr-text)' }} />
            <button type="submit" style={{ padding:'15px 30px', background:'var(--clr-gold)', border:'none', color:'var(--clr-primary)', fontWeight:800, fontSize:15, cursor:'pointer', fontFamily:'inherit' }}>Search</button>
          </form>
        </div>
      </section>

      {/* Body */}
      <div style={{ width:'100%', margin:0, padding:'32px 40px', display:'grid', gridTemplateColumns:'300px 1fr', gap:28, flex:1 }}>

        {/* Sidebar Filters */}
        <aside>
          <div style={{ background:'#fff', borderRadius:'var(--radius-lg)', padding:24, boxShadow:'var(--shadow-sm)', border:'1px solid var(--clr-border-soft)', position:'sticky', top:'calc(var(--navbar-h) + 20px)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, color:'var(--clr-primary)' }}>Filters</span>
              {hasActiveFilter && (
                <button onClick={clearFilters} style={{ background:'none', border:'none', color:'var(--clr-red)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Clear all</button>
              )}
            </div>
            <div style={{ height:3, background:'linear-gradient(90deg,var(--clr-gold),var(--clr-green))', borderRadius:'var(--radius-full)', marginBottom:22 }} />

            {[
              { key:'department', label:'Department', opts:depts.map(d=>d.name) },
              { key:'type',       label:'Job Type',   opts:TYPES },
              { key:'level',      label:'Experience', opts:LEVELS },
            ].map(f=>(
              <div key={f.key} style={{ marginBottom:20 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--clr-muted)', textTransform:'uppercase', letterSpacing:0.8, marginBottom:8 }}>{f.label}</label>
                <select value={filters[f.key]} onChange={e=>setFilters(p=>({...p,[f.key]:e.target.value}))} style={{ width:'100%', padding:'10px 12px', border:'1.5px solid var(--clr-border)', borderRadius:'var(--radius-md)', fontSize:13, fontFamily:'inherit', color:'var(--clr-text)', background:'#fff', outline:'none', cursor:'pointer' }}>
                  <option value="">All {f.label}s</option>
                  {f.opts.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}

            {/* Active filters */}
            {hasActiveFilter && (
              <div style={{ marginTop:8 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--clr-muted)', textTransform:'uppercase', letterSpacing:0.8, marginBottom:8 }}>Active</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {search && <span style={{ background:'var(--clr-primary-pale)', color:'var(--clr-primary)', padding:'3px 10px', borderRadius:'var(--radius-full)', fontSize:12, fontWeight:600 }}>"{search}"</span>}
                  {filters.department && <span style={{ background:'var(--clr-primary-pale)', color:'var(--clr-primary)', padding:'3px 10px', borderRadius:'var(--radius-full)', fontSize:12, fontWeight:600 }}>{filters.department}</span>}
                  {filters.type  && <Badge label={filters.type}  size="xs" />}
                  {filters.level && <Badge label={filters.level} size="xs" />}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Results */}
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <span style={{ fontSize:14, color:'var(--clr-muted)', fontWeight:500 }}>
              <strong style={{ color:'var(--clr-text)' }}>{jobs.length}</strong> {hasActiveFilter ? 'matching' : 'open'} position{jobs.length !== 1 ? 's' : ''}
            </span>
            <div style={{ display:'flex', gap:6 }}>
              {['var(--clr-primary)','var(--clr-gold)','var(--clr-green)'].map((c,i)=>(
                <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:c }} />
              ))}
            </div>
          </div>

          {jobs.length === 0 ? (
            <div style={{ background:'#fff', borderRadius:'var(--radius-lg)', boxShadow:'var(--shadow-sm)', border:'1px solid var(--clr-border-soft)' }}>
              <EmptyState icon="🔍" title="No jobs found" description="Try adjusting your search or filters. New positions are added regularly!"
                action={<button onClick={clearFilters} style={{ background:'var(--clr-primary)', color:'#fff', border:'none', padding:'10px 24px', borderRadius:'var(--radius-md)', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Clear Filters</button>} />
            </div>
          ) : (
            <div>{jobs.map(({job,deptName,appCount})=><JobCard key={job.id} job={job} deptName={deptName} appCount={appCount} />)}</div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}