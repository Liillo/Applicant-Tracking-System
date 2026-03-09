/**
 * HRMPEB ATS — Admin Applications List  (API version)
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { api } from '../../utils/api';
import { Badge } from '../../components/UI';
import toast from 'react-hot-toast';

const ALL_STATUSES = [
  'Submitted','Under Review','Shortlisted','Interview Scheduled',
  'Interviewed','Offer Extended','Hired','Rejected','Withdrawn',
];
const STATUS_ICON = {
  'Submitted':'📬','Under Review':'🔍','Shortlisted':'⭐',
  'Interview Scheduled':'📅','Interviewed':'🎙️','Offer Extended':'📄',
  'Hired':'🎉','Rejected':'❌','Withdrawn':'↩️',
};

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  if (diff < 604800)return `${Math.floor(diff/86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-KE',{day:'numeric',month:'short'});
}

function Chip({ label, active, onClick, count }) {
  return (
    <button onClick={onClick} style={{
      display:'inline-flex',alignItems:'center',gap:6,
      padding:'6px 13px',borderRadius:20,
      border:`1.5px solid ${active?'var(--clr-primary)':'var(--clr-border)'}`,
      background:active?'var(--clr-primary)':'#fff',
      color:active?'#fff':'var(--clr-muted)',
      fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit',
      transition:'all 0.18s',whiteSpace:'nowrap',
    }}>
      {STATUS_ICON[label] && <span>{STATUS_ICON[label]}</span>}
      {label}
      {count != null && (
        <span style={{ background:active?'rgba(255,255,255,0.22)':'var(--clr-border)',color:active?'#fff':'var(--clr-text)',padding:'1px 7px',borderRadius:10,fontSize:11 }}>{count}</span>
      )}
    </button>
  );
}

export default function AdminApplications() {
  const [searchParams] = useSearchParams();
  const [rows,         setRows]         = useState([]);
  const [allJobs,      setAllJobs]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status')||'');
  const [filterJob,    setFilterJob]    = useState(searchParams.get('jobId')||'');
  const [selected,     setSelected]     = useState(new Set());
  const [bulkStatus,   setBulkStatus]   = useState('');
  const [applyingBulk, setApplyingBulk] = useState(false);

  const load = useCallback(async () => {
    try {
      const [apps, jobs] = await Promise.all([
        api.allApplications(),
        api.getJobs(),
      ]);
      // Enrich rows with flattened name/email/job fields for easy display
      const enriched = apps.map(app => ({
        ...app,
        firstName:   app.applicant?.profile?.firstName || app.applicant?.email?.split('@')[0] || '—',
        lastName:    app.applicant?.profile?.lastName  || '',
        email:       app.applicant?.email || '—',
        jobTitle:    app.job?.title    || '(removed)',
        jobLocation: app.job?.location || '',
      }));
      setRows(enriched);
      setAllJobs(jobs.sort((a,b) => a.title.localeCompare(b.title)));
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.jobTitle.toLowerCase().includes(q);
    const matchStatus = !filterStatus || r.status === filterStatus;
    const matchJob    = !filterJob    || r.jobId  === filterJob;
    return matchSearch && matchStatus && matchJob;
  });

  const statusCounts = {};
  rows.forEach(r => { statusCounts[r.status] = (statusCounts[r.status]||0)+1; });

  const toggleSelect = (id) => setSelected(s => { const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n; });
  const selectAll    = () => setSelected(filtered.length===selected.size ? new Set() : new Set(filtered.map(r=>r.id)));

  const handleBulkUpdate = async () => {
    if (!bulkStatus || selected.size===0) return;
    setApplyingBulk(true);
    try {
      await Promise.all([...selected].map(id =>
        api.updateStatus(id, { status: bulkStatus, note: `Bulk update to ${bulkStatus}` })
      ));
      toast.success(`Updated ${selected.size} application${selected.size!==1?'s':''}`);
      setSelected(new Set());
      setBulkStatus('');
      load();
    } catch(err) { toast.error(err.message); }
    finally { setApplyingBulk(false); }
  };

  return (
    <AdminLayout
      title="Applications"
      subtitle={`${rows.length} total · ${rows.filter(r=>r.status==='Submitted').length} pending review`}
    >
      {/* Status chips */}
      <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:20 }}>
        <Chip label="All" active={!filterStatus} onClick={()=>setFilterStatus('')} count={rows.length} />
        {ALL_STATUSES.map(s => statusCounts[s]>0 && (
          <Chip key={s} label={s} active={filterStatus===s}
            onClick={()=>setFilterStatus(filterStatus===s?'':s)}
            count={statusCounts[s]||0} />
        ))}
      </div>

      {/* Search + Job filter */}
      <div style={{ display:'flex',gap:10,marginBottom:18,flexWrap:'wrap',alignItems:'center' }}>
        <div style={{ position:'relative',flex:1,minWidth:200 }}>
          <span style={{ position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',fontSize:14,pointerEvents:'none' }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, email, job…"
            style={{ width:'100%',padding:'9px 12px 9px 32px',border:'1.5px solid var(--clr-border)',borderRadius:9,fontSize:13,fontFamily:'inherit',outline:'none',boxSizing:'border-box',background:'#fff' }}
            onFocus={e=>e.target.style.borderColor='var(--clr-primary)'}
            onBlur={e=>e.target.style.borderColor='var(--clr-border)'}
          />
        </div>
        <select value={filterJob} onChange={e=>setFilterJob(e.target.value)}
          style={{ padding:'9px 12px',border:'1.5px solid var(--clr-border)',borderRadius:9,fontSize:13,fontFamily:'inherit',background:'#fff',outline:'none',cursor:'pointer',minWidth:180 }}>
          <option value="">All Jobs</option>
          {allJobs.map(j=><option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
        {(search||filterStatus||filterJob) && (
          <button onClick={()=>{setSearch('');setFilterStatus('');setFilterJob('');}}
            style={{ padding:'9px 14px',borderRadius:9,border:'1.5px solid var(--clr-border)',background:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',color:'var(--clr-red)',fontFamily:'inherit' }}>
            ✕ Clear
          </button>
        )}
        <span style={{ fontSize:13,color:'var(--clr-muted)',marginLeft:'auto' }}>{filtered.length} result{filtered.length!==1?'s':''}</span>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div style={{ background:'var(--clr-primary)',borderRadius:12,padding:'12px 18px',marginBottom:16,display:'flex',alignItems:'center',gap:14 }}>
          <span style={{ color:'#fff',fontSize:13,fontWeight:700 }}>{selected.size} selected</span>
          <select value={bulkStatus} onChange={e=>setBulkStatus(e.target.value)}
            style={{ padding:'7px 12px',borderRadius:8,border:'none',fontSize:13,fontFamily:'inherit',background:'rgba(255,255,255,0.15)',color:'#fff',outline:'none',cursor:'pointer',flex:1,maxWidth:220 }}>
            <option value="">Change status to…</option>
            {ALL_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={handleBulkUpdate} disabled={!bulkStatus||applyingBulk}
            style={{ padding:'7px 18px',borderRadius:8,background:'var(--clr-gold)',color:'var(--clr-primary)',fontWeight:800,fontSize:13,border:'none',cursor:'pointer',fontFamily:'inherit',opacity:!bulkStatus?0.5:1 }}>
            Apply
          </button>
          <button onClick={()=>setSelected(new Set())}
            style={{ padding:'7px 14px',borderRadius:8,background:'rgba(255,255,255,0.12)',color:'#fff',fontWeight:600,fontSize:13,border:'none',cursor:'pointer',fontFamily:'inherit' }}>
            Cancel
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{ background:'#fff',borderRadius:16,boxShadow:'var(--shadow-md)',border:'1px solid var(--clr-border-soft)',overflow:'hidden' }}>
        <div style={{ display:'grid',gridTemplateColumns:'40px 1.8fr 1.6fr 130px 110px 100px 80px',padding:'11px 20px',background:'var(--clr-bg)',borderBottom:'1px solid var(--clr-border-soft)',fontSize:11,fontWeight:700,color:'var(--clr-muted)',textTransform:'uppercase',letterSpacing:0.6 }}>
          <div><input type="checkbox" checked={filtered.length>0&&selected.size===filtered.length} onChange={selectAll} style={{ accentColor:'var(--clr-primary)',cursor:'pointer' }} /></div>
          <span>Applicant</span><span>Job</span><span>Status</span><span>Applied</span><span>Salary Ask</span><span style={{ textAlign:'right' }}>Action</span>
        </div>

        {loading ? (
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',padding:48 }}>
            <div style={{ width:32,height:32,border:'3px solid var(--clr-primary)',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center',padding:'52px 24px' }}>
            <div style={{ fontSize:44,marginBottom:14 }}>📭</div>
            <h3 style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:18,color:'var(--clr-primary)',marginBottom:8 }}>No applications found</h3>
            <p style={{ color:'var(--clr-muted)',fontSize:14 }}>Try adjusting your filters or search query.</p>
          </div>
        ) : filtered.map((r,i) => (
          <div key={r.id}
            style={{ display:'grid',gridTemplateColumns:'40px 1.8fr 1.6fr 130px 110px 100px 80px',padding:'13px 20px',borderBottom:i<filtered.length-1?'1px solid var(--clr-border-soft)':'none',alignItems:'center',transition:'background 0.15s',background:selected.has(r.id)?'var(--clr-primary-pale)':'transparent' }}
            onMouseEnter={e=>{ if(!selected.has(r.id)) e.currentTarget.style.background='var(--clr-bg)'; }}
            onMouseLeave={e=>{ if(!selected.has(r.id)) e.currentTarget.style.background='transparent'; }}>
            <div><input type="checkbox" checked={selected.has(r.id)} onChange={()=>toggleSelect(r.id)} style={{ accentColor:'var(--clr-primary)',cursor:'pointer' }} /></div>
            <div style={{ display:'flex',alignItems:'center',gap:10,minWidth:0 }}>
              <div style={{ width:34,height:34,borderRadius:9,background:'var(--clr-primary)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-display)',fontWeight:800,fontSize:12,color:'#fff',flexShrink:0 }}>
                {(r.firstName[0]||'?').toUpperCase()}{(r.lastName[0]||'').toUpperCase()}
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontWeight:700,fontSize:13,color:'var(--clr-text)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{r.firstName} {r.lastName}</div>
                <div style={{ fontSize:11,color:'var(--clr-muted)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{r.email}</div>
              </div>
            </div>
            <div style={{ minWidth:0,paddingRight:8 }}>
              <div style={{ fontSize:12,fontWeight:600,color:'var(--clr-text)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{r.jobTitle}</div>
              <div style={{ fontSize:11,color:'var(--clr-muted)' }}>{r.jobLocation}</div>
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:5 }}>
              <span style={{ fontSize:14 }}>{STATUS_ICON[r.status]||'📋'}</span>
              <Badge label={r.status} size="xs" />
            </div>
            <div style={{ fontSize:12,color:'var(--clr-muted)' }}>{timeAgo(r.createdAt)}</div>
            <div style={{ fontSize:12,fontWeight:600,color:r.expectedSalary?'var(--clr-green)':'var(--clr-muted)' }}>
              {r.expectedSalary ? `KES ${Number(r.expectedSalary).toLocaleString()}` : '—'}
            </div>
            <div style={{ textAlign:'right' }}>
              <Link to={`/admin/applications/${r.id}`}
                style={{ padding:'6px 14px',borderRadius:8,background:'var(--clr-primary)',color:'#fff',fontSize:12,fontWeight:700,whiteSpace:'nowrap' }}>
                Review →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
