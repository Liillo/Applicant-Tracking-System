/**
 * HRMPEB ATS — Admin Job Management  (Module 7)
 * Three tabs: Jobs list · Create/Edit job form · Departments
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { api } from '../../utils/api';
import { Badge } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// ─── tiny helpers ─────────────────────────────────────────────────────────────
const JOB_TYPES   = ['Full-Time','Part-Time','Contract','Internship','Remote','Hybrid'];
const EXP_LEVELS  = ['Entry','Junior','Mid','Senior','Executive'];
const JOB_STATUSES= ['Open','Closed','Draft','Paused'];
const CURRENCIES  = ['KES','USD','EUR','GBP'];
const PERIODS     = ['Monthly','Annual'];

function Btn({ children, onClick, variant='primary', size='md', disabled=false, loading=false, fullWidth=false, type='button', style={} }) {
  const sz = { sm:{padding:'7px 16px',fontSize:12,borderRadius:8}, md:{padding:'10px 22px',fontSize:13,borderRadius:10}, lg:{padding:'13px 28px',fontSize:15,borderRadius:12} }[size]||{};
  const vr = {
    primary: { background:'var(--clr-primary)',  color:'#fff',               boxShadow:'0 4px 12px rgba(31,60,136,0.22)' },
    gold:    { background:'var(--clr-gold)',     color:'var(--clr-primary)',  boxShadow:'0 4px 12px rgba(244,180,0,0.28)' },
    danger:  { background:'var(--clr-red)',      color:'#fff'                                                             },
    ghost:   { background:'transparent',         color:'var(--clr-muted)',    border:'1.5px solid var(--clr-border)'      },
    soft:    { background:'var(--clr-primary-pale)', color:'var(--clr-primary)'                                          },
    success: { background:'var(--clr-green)',    color:'#fff'                                                             },
  }[variant]||{};
  return (
    <button type={type} onClick={onClick} disabled={disabled||loading}
      style={{ display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8,fontWeight:700,fontFamily:'inherit',cursor:disabled||loading?'not-allowed':'pointer',opacity:disabled||loading?0.6:1,border:'none',transition:'all 0.18s',width:fullWidth?'100%':'auto',...sz,...vr,...style }}>
      {loading&&<span style={{ width:13,height:13,border:'2px solid currentColor',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.7s linear infinite',display:'inline-block' }} />}
      {children}
    </button>
  );
}

function Inp({ label, error, required, hint, icon, value, onChange, type='text', placeholder, style={}, containerStyle={}, ...rest }) {
  return (
    <div style={containerStyle}>
      {label&&<label style={{ display:'block',fontSize:12,fontWeight:700,color:error?'var(--clr-red)':'var(--clr-muted)',textTransform:'uppercase',letterSpacing:0.6,marginBottom:6 }}>{label}{required&&<span style={{ color:'var(--clr-red)',marginLeft:3 }}>*</span>}</label>}
      <div style={{ position:'relative' }}>
        {icon&&<span style={{ position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',fontSize:15,pointerEvents:'none' }}>{icon}</span>}
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          style={{ width:'100%',padding:icon?'10px 12px 10px 36px':'10px 12px',border:`1.5px solid ${error?'var(--clr-red)':'var(--clr-border)'}`,borderRadius:9,fontSize:13,fontFamily:'inherit',color:'var(--clr-text)',background:'#fff',outline:'none',boxSizing:'border-box',transition:'border-color 0.18s',...style }}
          onFocus={e=>e.target.style.borderColor=error?'var(--clr-red)':'var(--clr-primary)'}
          onBlur={e=>e.target.style.borderColor=error?'var(--clr-red)':'var(--clr-border)'}
          {...rest}
        />
      </div>
      {(error||hint)&&<p style={{ marginTop:4,fontSize:11,color:error?'var(--clr-red)':'var(--clr-muted)' }}>{error||hint}</p>}
    </div>
  );
}

function Sel({ label, error, required, options, placeholder, value, onChange, containerStyle={} }) {
  return (
    <div style={containerStyle}>
      {label&&<label style={{ display:'block',fontSize:12,fontWeight:700,color:'var(--clr-muted)',textTransform:'uppercase',letterSpacing:0.6,marginBottom:6 }}>{label}{required&&<span style={{ color:'var(--clr-red)',marginLeft:3 }}>*</span>}</label>}
      <select value={value} onChange={onChange}
        style={{ width:'100%',padding:'10px 12px',border:`1.5px solid ${error?'var(--clr-red)':'var(--clr-border)'}`,borderRadius:9,fontSize:13,fontFamily:'inherit',color:'var(--clr-text)',background:'#fff',outline:'none',cursor:'pointer',boxSizing:'border-box' }}>
        {placeholder&&<option value="">{placeholder}</option>}
        {options.map(o=>typeof o==='string'?<option key={o} value={o}>{o}</option>:<option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error&&<p style={{ marginTop:4,fontSize:11,color:'var(--clr-red)' }}>{error}</p>}
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder, rows=4, hint, containerStyle={} }) {
  return (
    <div style={containerStyle}>
      {label&&<label style={{ display:'block',fontSize:12,fontWeight:700,color:'var(--clr-muted)',textTransform:'uppercase',letterSpacing:0.6,marginBottom:6 }}>{label}</label>}
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
        style={{ width:'100%',padding:'10px 12px',border:'1.5px solid var(--clr-border)',borderRadius:9,fontSize:13,fontFamily:'inherit',color:'var(--clr-text)',background:'#fff',outline:'none',resize:'vertical',lineHeight:1.65,boxSizing:'border-box' }}
        onFocus={e=>e.target.style.borderColor='var(--clr-primary)'}
        onBlur={e=>e.target.style.borderColor='var(--clr-border)'}
      />
      {hint&&<p style={{ marginTop:4,fontSize:11,color:'var(--clr-muted)' }}>{hint}</p>}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom:28 }}>
      <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:16 }}>
        <h3 style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:15,color:'var(--clr-primary)',margin:0 }}>{title}</h3>
        <div style={{ flex:1,height:1,background:'var(--clr-border-soft)' }} />
      </div>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// JOB FORM  (create + edit)
// ═══════════════════════════════════════════════════════════════════════════════
function JobForm({ jobId, onSaved, onCancel }) {
  const { user } = useAuth();
  const [existing, setExisting] = React.useState(null);
  useEffect(() => { if (jobId) api.getJob(jobId).then(j=>{ setExisting(j); setForm(f=>({...f,...j,salaryMin:j.salaryMin||'',salaryMax:j.salaryMax||''})); }).catch(()=>{}); }, [jobId]);

  const blank = {
    title:'', departmentId:'', location:'', jobType:'Full-Time', experienceLevel:'Mid',
    salaryMin:'', salaryMax:'', salaryCurrency:'KES', salaryPeriod:'Monthly',
    description:'', responsibilities:'', requirements:'', benefits:'', skillsRequired:'',
    status:'Open', slots:1, deadline:'',
  };

  const [form,    setForm]    = useState(existing ? { ...blank, ...existing, salaryMin:existing.salaryMin||'', salaryMax:existing.salaryMax||'' } : blank);
  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);
  const [depts,   setDepts]   = useState([]);

  useEffect(() => { api.getDepartments().then(setDepts).catch(()=>{}); }, []);

  const s = (k,v) => { setForm(p=>({...p,[k]:v})); setErrors(p=>({...p,[k]:''})); };

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = 'Job title is required';
    if (!form.departmentId)       e.departmentId= 'Select a department';
    if (!form.location.trim())    e.location    = 'Location is required';
    if (!form.description.trim()) e.description = 'Job description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) { toast.error('Please fill required fields'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
        slots:     Number(form.slots)||1,
      };
      if (jobId) {
        await api.updateJob(jobId, payload);
        toast.success('Job updated successfully!');
      } else {
        await api.createJob(payload);
        toast.success('Job posted successfully! 🎉');
      }
      onSaved?.();
    } catch(err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const deptOptions = depts.map(d=>({ value:d.id, label:d.name }));

  return (
    <div style={{ width:'100%', animation:'fadeIn 0.3s ease' }}>
      <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:24 }}>
        <button onClick={onCancel} style={{ background:'var(--clr-bg)',border:'1.5px solid var(--clr-border)',borderRadius:9,padding:'8px 14px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',color:'var(--clr-text)',display:'flex',alignItems:'center',gap:6 }}>← Back</button>
        <div>
          <h2 style={{ fontFamily:'var(--font-display)',fontWeight:800,fontSize:20,color:'var(--clr-primary)',margin:0 }}>{existing?'Edit Job Posting':'Post New Job'}</h2>
          <p style={{ color:'var(--clr-muted)',fontSize:13,marginTop:2 }}>{existing?'Update the job details below':'Fill in the details to create a new job posting'}</p>
        </div>
      </div>

      <div style={{ background:'#fff',borderRadius:16,padding:28,boxShadow:'var(--shadow-md)',border:'1px solid var(--clr-border-soft)' }}>

        {/* Basic Info */}
        <Section title="Basic Information">
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14 }}>
            <Inp label="Job Title" required value={form.title} onChange={e=>s('title',e.target.value)} placeholder="e.g. Senior Product Designer" error={errors.title} icon="💼" />
            <Sel label="Department" required value={form.departmentId} onChange={e=>s('departmentId',e.target.value)} options={deptOptions} placeholder="Select department…" error={errors.departmentId} />
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14,marginBottom:14 }}>
            <Inp label="Location" required value={form.location} onChange={e=>s('location',e.target.value)} placeholder="Nairobi, Kenya" error={errors.location} icon="📍" />
            <Sel label="Job Type" required value={form.jobType} onChange={e=>s('jobType',e.target.value)} options={JOB_TYPES} />
            <Sel label="Experience Level" required value={form.experienceLevel} onChange={e=>s('experienceLevel',e.target.value)} options={EXP_LEVELS} />
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:14 }}>
            <Sel label="Status" value={form.status} onChange={e=>s('status',e.target.value)} options={JOB_STATUSES} />
            <Inp label="Open Slots" type="number" value={form.slots} onChange={e=>s('slots',e.target.value)} placeholder="1" style={{ textAlign:'center' }} />
            <Inp label="Application Deadline" type="date" value={form.deadline} onChange={e=>s('deadline',e.target.value)} />
            <div />
          </div>
        </Section>

        {/* Salary */}
        <Section title="Compensation">
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:14 }}>
            <Inp label="Min Salary" type="number" value={form.salaryMin} onChange={e=>s('salaryMin',e.target.value)} placeholder="80000" icon="💰" />
            <Inp label="Max Salary" type="number" value={form.salaryMax} onChange={e=>s('salaryMax',e.target.value)} placeholder="120000" icon="💰" />
            <Sel label="Currency" value={form.salaryCurrency} onChange={e=>s('salaryCurrency',e.target.value)} options={CURRENCIES} />
            <Sel label="Period" value={form.salaryPeriod} onChange={e=>s('salaryPeriod',e.target.value)} options={PERIODS} />
          </div>
        </Section>

        {/* Description */}
        <Section title="Job Description">
          <Textarea label="Overview *" value={form.description} onChange={e=>s('description',e.target.value)}
            placeholder="Describe the role, team, and what success looks like…" rows={5}
            containerStyle={{ marginBottom:14 }} />
          {errors.description&&<p style={{ fontSize:12,color:'var(--clr-red)',marginTop:-10,marginBottom:14 }}>{errors.description}</p>}
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
            <Textarea label="Responsibilities" value={form.responsibilities} onChange={e=>s('responsibilities',e.target.value)}
              placeholder={"Lead design projects from concept to launch\nConduct user research\nMentor junior team members"} rows={6}
              hint="One responsibility per line" />
            <Textarea label="Requirements" value={form.requirements} onChange={e=>s('requirements',e.target.value)}
              placeholder={"Bachelor's degree in relevant field\n3+ years experience\nStrong communication skills"} rows={6}
              hint="One requirement per line" />
          </div>
        </Section>

        {/* Benefits & Skills */}
        <Section title="Benefits & Skills">
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
            <Textarea label="Benefits & Perks" value={form.benefits} onChange={e=>s('benefits',e.target.value)}
              placeholder={"Competitive salary & equity\nHealth insurance\nFlexible working hours\n21 days annual leave"} rows={5}
              hint="One benefit per line" />
            <Inp label="Skills Required" value={form.skillsRequired} onChange={e=>s('skillsRequired',e.target.value)}
              placeholder="React, Node.js, Figma, Python…" hint="Comma-separated list of skills"
              containerStyle={{ alignSelf:'flex-start' }} />
          </div>
        </Section>

        {/* Preview strip */}
        {form.title && (
          <div style={{ background:'var(--clr-primary-pale)',borderRadius:12,padding:16,marginBottom:24,display:'flex',alignItems:'center',gap:14,border:'1px solid rgba(31,60,136,0.12)' }}>
            <div style={{ width:44,height:44,borderRadius:12,background:'var(--clr-primary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0 }}>💼</div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:16,color:'var(--clr-primary)' }}>{form.title}</div>
              <div style={{ fontSize:12,color:'var(--clr-muted)',marginTop:2 }}>
                {depts.find(d=>d.id===form.departmentId)?.name||'—'} · {form.location||'—'}
              </div>
              <div style={{ display:'flex',gap:6,marginTop:6 }}>
                <Badge label={form.jobType} size="xs" />
                <Badge label={form.experienceLevel} size="xs" />
                <Badge label={form.status} size="xs" dot />
                {form.salaryMin&&<Badge label={`KES ${(Number(form.salaryMin)/1000).toFixed(0)}k–${(Number(form.salaryMax||form.salaryMin)/1000).toFixed(0)}k`} size="xs" bg="var(--clr-green-pale)" color="var(--clr-green)" />}
              </div>
            </div>
            <div style={{ fontSize:11,color:'var(--clr-muted)',textAlign:'right' }}>
              {form.slots} slot{form.slots!=1?'s':''}<br />
              {form.deadline&&`Deadline: ${new Date(form.deadline).toLocaleDateString('en-KE',{day:'numeric',month:'short'})}`}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display:'flex',justifyContent:'flex-end',gap:12 }}>
          <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
          <Btn variant="gold" onClick={handleSave} loading={saving} size="lg">
            {saving?'Saving…':existing?'Save Changes':'Post Job →'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// JOBS LIST TAB
// ═══════════════════════════════════════════════════════════════════════════════
function JobsTab({ onEdit, onNew, refreshKey }) {
  const [jobs,       setJobs]       = useState([]);
  const [depts,      setDepts]      = useState([]);
  const [search,     setSearch]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDept,   setFilterDept]   = useState('');
  const [deleting,   setDeleting]   = useState(null);

  const load = useCallback(async () => {
    try {
      const [jobs, depts] = await Promise.all([api.getJobs(), api.getDepartments()]);
      setJobs(jobs);
      setDepts(depts);
    } catch(err) { toast.error('Failed to load jobs'); }
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    const matchSearch = !search || j.title.toLowerCase().includes(q) || (j.location||'').toLowerCase().includes(q);
    const matchStatus = !filterStatus || j.status === filterStatus;
    const matchDept   = !filterDept   || j.departmentId === filterDept;
    return matchSearch && matchStatus && matchDept;
  });

  const handleToggleStatus = async (job) => {
    const next = job.status === 'Open' ? 'Closed' : 'Open';
    const previous = job.status;
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: next } : j));
    try {
      await api.updateJob(job.id, { status: next });
      toast.success(`Job marked as ${next}`);
    } catch(err) {
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: previous } : j));
      toast.error(err.message);
    }
  };

  const handleDelete = async (jobId) => {
    const job = jobs.find(j=>j.id===jobId);
    const appCount = job?._count?.applications||0;
    const confirmed = window.confirm(
      appCount > 0
        ? `This job has ${appCount} application(s). Deleting it will also delete all related applications. Continue?`
        : 'Delete this job posting?'
    );
    if (!confirmed) return;
    try {
      await api.deleteJob(jobId);
      toast.success('Job deleted');
      load();
    } catch(err) { toast.error(err.message); }
  };

  return (
    <div style={{ animation:'fadeIn 0.3s ease' }}>
      {/* Toolbar */}
      <div style={{ display:'flex',gap:12,alignItems:'center',marginBottom:20,flexWrap:'wrap' }}>
        <div style={{ position:'relative',flex:1,minWidth:200 }}>
          <span style={{ position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',fontSize:14,pointerEvents:'none' }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search jobs…"
            style={{ width:'100%',padding:'10px 12px 10px 34px',border:'1.5px solid var(--clr-border)',borderRadius:9,fontSize:13,fontFamily:'inherit',color:'var(--clr-text)',background:'#fff',outline:'none',boxSizing:'border-box' }}
            onFocus={e=>e.target.style.borderColor='var(--clr-primary)'}
            onBlur={e=>e.target.style.borderColor='var(--clr-border)'}
          />
        </div>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
          style={{ padding:'10px 12px',border:'1.5px solid var(--clr-border)',borderRadius:9,fontSize:13,fontFamily:'inherit',background:'#fff',outline:'none',cursor:'pointer' }}>
          <option value="">All Statuses</option>
          {JOB_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterDept} onChange={e=>setFilterDept(e.target.value)}
          style={{ padding:'10px 12px',border:'1.5px solid var(--clr-border)',borderRadius:9,fontSize:13,fontFamily:'inherit',background:'#fff',outline:'none',cursor:'pointer' }}>
          <option value="">All Departments</option>
          {depts.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <Btn variant="gold" onClick={onNew} icon="➕">Post New Job</Btn>
      </div>

      {/* Summary row */}
      <div style={{ display:'flex',gap:10,marginBottom:16 }}>
        {['Open','Closed','Draft','Paused'].map(s=>{
          const cnt = jobs.filter(j=>j.status===s).length;
          return (
            <button key={s} onClick={()=>setFilterStatus(filterStatus===s?'':s)}
              style={{ padding:'6px 14px',borderRadius:8,border:`1.5px solid ${filterStatus===s?'var(--clr-primary)':'var(--clr-border)'}`,background:filterStatus===s?'var(--clr-primary-pale)':'#fff',fontSize:12,fontWeight:700,color:filterStatus===s?'var(--clr-primary)':'var(--clr-muted)',cursor:'pointer',fontFamily:'inherit',display:'flex',gap:6,alignItems:'center' }}>
              <span>{s}</span>
              <span style={{ background:'var(--clr-border)',color:'var(--clr-text)',padding:'1px 7px',borderRadius:'var(--radius-full)',fontSize:11 }}>{cnt}</span>
            </button>
          );
        })}
        <span style={{ marginLeft:'auto',fontSize:13,color:'var(--clr-muted)',alignSelf:'center' }}>{filtered.length} job{filtered.length!==1?'s':''}</span>
      </div>

      {/* Jobs table */}
      <div style={{ background:'#fff',borderRadius:16,boxShadow:'var(--shadow-md)',border:'1px solid var(--clr-border-soft)',overflow:'hidden' }}>
        {/* Header */}
        <div style={{ display:'grid',gridTemplateColumns:'1fr 140px 110px 90px 90px 80px 130px',gap:0,padding:'12px 20px',background:'var(--clr-bg)',borderBottom:'1px solid var(--clr-border-soft)',fontSize:11,fontWeight:700,color:'var(--clr-muted)',textTransform:'uppercase',letterSpacing:0.6 }}>
          <span>Job Title</span><span>Department</span><span>Type</span><span>Slots</span><span>Apps</span><span>Status</span><span style={{ textAlign:'right' }}>Actions</span>
        </div>
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center',padding:'48px 24px' }}>
            <div style={{ fontSize:40,marginBottom:12 }}>📭</div>
            <h3 style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:18,color:'var(--clr-primary)',marginBottom:8 }}>No jobs found</h3>
            <p style={{ color:'var(--clr-muted)',fontSize:14,marginBottom:20 }}>Try different filters or create a new posting.</p>
            <Btn variant="gold" onClick={onNew}>Post New Job →</Btn>
          </div>
        ) : filtered.map((job,i)=>{
          const appCount = job._count?.applications||0;
          const deptName = job.department?.name||'—';
          return (
            <div key={job.id} style={{ display:'grid',gridTemplateColumns:'1fr 140px 110px 90px 90px 80px 130px',gap:0,padding:'14px 20px',borderBottom:i<filtered.length-1?'1px solid var(--clr-border-soft)':'none',alignItems:'center',transition:'background 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--clr-bg)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              {/* Title */}
              <div>
                <div style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:14,color:'var(--clr-primary)',marginBottom:3 }}>{job.title}</div>
                <div style={{ fontSize:11,color:'var(--clr-muted)' }}>📍 {job.location}{job.deadline&&<span style={{ marginLeft:6 }}>· 📅 {new Date(job.deadline).toLocaleDateString('en-KE',{day:'numeric',month:'short'})}</span>}</div>
                {job.salaryMin&&<div style={{ fontSize:11,color:'var(--clr-green)',marginTop:2,fontWeight:600 }}>KES {(job.salaryMin/1000).toFixed(0)}k–{(job.salaryMax/1000).toFixed(0)}k</div>}
              </div>
              {/* Dept */}
              <div style={{ fontSize:12,color:'var(--clr-text-soft)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',paddingRight:8 }}>{deptName}</div>
              {/* Type */}
              <div><Badge label={job.jobType} size="xs" /></div>
              {/* Slots */}
              <div style={{ fontSize:13,fontWeight:700,color:'var(--clr-text)',textAlign:'center' }}>{job.slots}</div>
              {/* Apps */}
              <div style={{ textAlign:'center' }}>
                <Link to={`/admin/applications?jobId=${job.id}`} style={{ fontSize:13,fontWeight:700,color:'var(--clr-primary)',background:'var(--clr-primary-pale)',padding:'4px 10px',borderRadius:8,display:'inline-block' }}>{appCount}</Link>
              </div>
              {/* Status (single toggle button) */}
              <div>
                <button onClick={()=>handleToggleStatus(job)} title={job.status==='Open'?'Close job':'Re-open job'}
                  style={{ background:job.status==='Open'?'var(--clr-green-pale)':'#fef2f2',border:'none',borderRadius:999,padding:'6px 12px',fontSize:12,cursor:'pointer',fontFamily:'inherit',color:job.status==='Open'?'var(--clr-green)':'var(--clr-red)',fontWeight:700,display:'inline-flex',alignItems:'center',gap:6 }}>
                  <span style={{ fontSize:16,lineHeight:0.7 }}>•</span>
                  {job.status==='Open'?'Open':'Closed'}
                </button>
              </div>
              {/* Actions */}
              <div style={{ display:'flex',gap:6,justifyContent:'flex-end' }}>
                <button onClick={()=>onEdit(job.id)} style={{ background:'var(--clr-primary-pale)',border:'none',borderRadius:7,padding:'6px 10px',fontSize:12,cursor:'pointer',fontFamily:'inherit',color:'var(--clr-primary)',fontWeight:600 }}>Edit</button>
                <button onClick={()=>handleDelete(job.id)} style={{ background:'var(--clr-red-pale)',border:'none',borderRadius:7,padding:'6px 10px',fontSize:12,cursor:'pointer',fontFamily:'inherit',color:'var(--clr-red)',fontWeight:600 }}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEPARTMENTS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function DepartmentsTab({ refreshKey }) {
  const [depts,    setDepts]    = useState([]);
  const [newName,  setNewName]  = useState('');
  const [newDesc,  setNewDesc]  = useState('');
  const [saving,   setSaving]   = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const load = async () => { try { setDepts(await api.getDepartments()); } catch(err) {} };
  useEffect(() => { load(); }, [refreshKey]);

  const handleAdd = async () => {
    if (!newName.trim()) { toast.error('Department name is required'); return; }
    setSaving(true);
    try {
      await api.createDepartment({ name: newName.trim(), description: newDesc.trim() });
      toast.success('Department created!');
      setNewName(''); setNewDesc('');
      load();
    } catch(err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleEdit = (d) => { setEditId(d.id); setEditName(d.name); setEditDesc(d.description||''); };
  const handleSaveEdit = async () => {
    if (!editName.trim()) { toast.error('Name required'); return; }
    try {
      await api.updateDepartment(editId, { name: editName.trim(), description: editDesc.trim() });
      toast.success('Department updated'); setEditId(null); load();
    } catch(err) { toast.error(err.message); }
  };
  const handleDelete = async (id) => {
    const dept = depts.find(d=>d.id===id);
    const jobCount = dept?._count?.jobs||0;
    if (jobCount > 0 && !window.confirm(`This department has ${jobCount} job(s). Delete anyway?`)) return;
    try {
      await api.deleteDepartment(id);
      toast.success('Department deleted'); load();
    } catch(err) { toast.error(err.message); }
  };

  return (
    <div style={{ display:'grid',gridTemplateColumns:'1fr 1.4fr',gap:24,animation:'fadeIn 0.3s ease' }}>
      {/* Add form */}
      <div style={{ background:'#fff',borderRadius:16,padding:24,boxShadow:'var(--shadow-md)',border:'1px solid var(--clr-border-soft)',alignSelf:'start' }}>
        <h3 style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:16,color:'var(--clr-primary)',marginBottom:18 }}>Add Department</h3>
        <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
          <Inp label="Department Name" required value={newName} onChange={e=>setNewName(e.target.value)} placeholder="e.g. Engineering" icon="🏢" />
          <Textarea label="Description" value={newDesc} onChange={e=>setNewDesc(e.target.value)} placeholder="Brief description of this department…" rows={3} />
          <Btn variant="gold" onClick={handleAdd} loading={saving} fullWidth>Add Department</Btn>
        </div>
      </div>

      {/* List */}
      <div style={{ background:'#fff',borderRadius:16,boxShadow:'var(--shadow-md)',border:'1px solid var(--clr-border-soft)',overflow:'hidden' }}>
        <div style={{ padding:'16px 20px',borderBottom:'1px solid var(--clr-border-soft)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <h3 style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:16,color:'var(--clr-primary)',margin:0 }}>All Departments</h3>
          <span style={{ fontSize:12,color:'var(--clr-muted)',fontWeight:600 }}>{depts.length} total</span>
        </div>
        {depts.length===0 ? (
          <div style={{ textAlign:'center',padding:'32px' }}>
            <div style={{ fontSize:36,marginBottom:10 }}>🏢</div>
            <p style={{ color:'var(--clr-muted)',fontSize:14 }}>No departments yet. Add one to get started.</p>
          </div>
        ) : depts.map((d,i)=>(
          <div key={d.id} style={{ padding:'14px 20px',borderBottom:i<depts.length-1?'1px solid var(--clr-border-soft)':'none' }}>
            {editId===d.id ? (
              <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                <input value={editName} onChange={e=>setEditName(e.target.value)} style={{ padding:'8px 12px',border:'1.5px solid var(--clr-primary)',borderRadius:8,fontSize:13,fontFamily:'inherit',outline:'none' }} />
                <input value={editDesc} onChange={e=>setEditDesc(e.target.value)} placeholder="Description…" style={{ padding:'8px 12px',border:'1.5px solid var(--clr-border)',borderRadius:8,fontSize:13,fontFamily:'inherit',outline:'none' }} />
                <div style={{ display:'flex',gap:8 }}>
                  <Btn variant="success" size="sm" onClick={handleSaveEdit}>Save</Btn>
                  <Btn variant="ghost" size="sm" onClick={()=>setEditId(null)}>Cancel</Btn>
                </div>
              </div>
            ) : (
              <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                <div style={{ width:36,height:36,borderRadius:10,background:'var(--clr-primary-pale)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0 }}>🏢</div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontWeight:700,fontSize:14,color:'var(--clr-text)' }}>{d.name}</div>
                  {d.description&&<div style={{ fontSize:12,color:'var(--clr-muted)',marginTop:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{d.description}</div>}
                  <div style={{ fontSize:11,color:'var(--clr-primary)',fontWeight:600,marginTop:2 }}>{d._count?.jobs||0} job{(d._count?.jobs||0)!==1?'s':''}</div>
                </div>
                <div style={{ display:'flex',gap:6 }}>
                  <button onClick={()=>handleEdit(d)} style={{ background:'var(--clr-primary-pale)',border:'none',borderRadius:7,padding:'6px 10px',fontSize:12,cursor:'pointer',fontFamily:'inherit',color:'var(--clr-primary)',fontWeight:600 }}>✏️</button>
                  <button onClick={()=>handleDelete(d.id)} style={{ background:'var(--clr-red-pale)',border:'none',borderRadius:7,padding:'6px 10px',fontSize:12,cursor:'pointer',fontFamily:'inherit',color:'var(--clr-red)',fontWeight:600 }}>🗑️</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN MANAGEMENT — Main Component
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminManagement() {
  const [tab,        setTab]        = useState('jobs');
  const [view,       setView]       = useState('list'); // 'list' | 'form'
  const [editJobId,  setEditJobId]  = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey(k=>k+1);

  const handleNew = () => { setEditJobId(null); setView('form'); };
  const handleEdit = (id) => { setEditJobId(id); setView('form'); };
  const handleSaved = () => { setView('list'); setTab('jobs'); refresh(); };
  const handleCancel = () => { setView('list'); setEditJobId(null); };

  const TABS = [
    { id:'jobs',  icon:'💼', label:'Job Postings' },
    { id:'depts', icon:'🏢', label:'Departments'  },
  ];

  // Tab/view title
  let title = 'Job Management', subtitle = 'Post, edit, and manage job openings';
  if (view==='form') { title = editJobId?'Edit Job':'Post New Job'; subtitle = editJobId?'Update job details':'Create a new job posting'; }
  else if (tab==='depts') { title='Departments'; subtitle='Manage hiring departments and divisions'; }

  return (
    <AdminLayout title={title} subtitle={subtitle}>
      {view === 'form' ? (
        <JobForm jobId={editJobId} onSaved={handleSaved} onCancel={handleCancel} />
      ) : (
        <>
          {/* Tabs */}
          <div style={{ display:'flex',gap:4,background:'#fff',borderRadius:12,padding:4,width:'fit-content',marginBottom:24,boxShadow:'var(--shadow-sm)',border:'1px solid var(--clr-border-soft)' }}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:'9px 22px',borderRadius:9,border:'none',fontFamily:'inherit',fontSize:13,fontWeight:600,cursor:'pointer',background:tab===t.id?'var(--clr-primary)':'transparent',color:tab===t.id?'#fff':'var(--clr-muted)',transition:'all 0.18s',display:'flex',alignItems:'center',gap:7 }}>
                <span style={{ fontSize:15 }}>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>

          {tab==='jobs'  && <JobsTab onEdit={handleEdit} onNew={handleNew} refreshKey={refreshKey} />}
          {tab==='depts' && <DepartmentsTab refreshKey={refreshKey} />}
        </>
      )}
    </AdminLayout>
  );
}
