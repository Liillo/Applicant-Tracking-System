/**
 * HRMPEB ATS — Admin Application Detail  (API version)
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { api } from '../../utils/api';
import { Badge } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// ─── constants ────────────────────────────────────────────────────────────────
const PIPELINE = [
  'Submitted','Under Review','Shortlisted',
  'Interview Scheduled','Interviewed','Offer Extended','Hired',
];
const ALL_STATUSES = [...PIPELINE,'Rejected','Withdrawn'];
const INTERVIEW_TYPES = ['Phone Screen','Video Call','In-Person','Panel','Technical','HR Final'];
const STATUS_COLOR = {
  'Submitted':'#6b7280','Under Review':'#d97706','Shortlisted':'#059669',
  'Interview Scheduled':'#1F3C88','Interviewed':'#7c3aed','Offer Extended':'#ca8a04',
  'Hired':'#15803d','Rejected':'#dc2626','Withdrawn':'#9ca3af',
};
const STATUS_BG = {
  'Submitted':'#f3f4f6','Under Review':'#fffbea','Shortlisted':'#ecfdf5',
  'Interview Scheduled':'#eff6ff','Interviewed':'#f5f3ff','Offer Extended':'#fef9c3',
  'Hired':'#dcfce7','Rejected':'#fee2e2','Withdrawn':'#f3f4f6',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-KE',{weekday:'short',day:'numeric',month:'long',year:'numeric'});
}
function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'}) +
         ' · ' + d.toLocaleTimeString('en-KE',{hour:'2-digit',minute:'2-digit'});
}
function timeAgo(iso) {
  const diff = Math.floor((Date.now()-new Date(iso))/1000);
  if (diff<60)    return 'just now';
  if (diff<3600)  return `${Math.floor(diff/60)}m ago`;
  if (diff<86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function Card({ title, icon, children, style={} }) {
  return (
    <div style={{ background:'#fff',borderRadius:14,border:'1px solid var(--clr-border-soft)',boxShadow:'var(--shadow-sm)',overflow:'hidden',...style }}>
      {title && (
        <div style={{ padding:'14px 20px',borderBottom:'1px solid var(--clr-border-soft)',display:'flex',alignItems:'center',gap:8 }}>
          {icon && <span style={{ fontSize:16 }}>{icon}</span>}
          <h3 style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:14,color:'var(--clr-primary)',margin:0 }}>{title}</h3>
        </div>
      )}
      <div style={{ padding:20 }}>{children}</div>
    </div>
  );
}

function InfoPair({ label, value }) {
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:2,marginBottom:12 }}>
      <span style={{ fontSize:10,fontWeight:700,color:'var(--clr-muted)',textTransform:'uppercase',letterSpacing:0.8 }}>{label}</span>
      <span style={{ fontSize:13,fontWeight:600,color:'var(--clr-text)' }}>{value||'—'}</span>
    </div>
  );
}

function PipelineBar({ current }) {
  const step = PIPELINE.indexOf(current);
  return (
    <div style={{ display:'flex',alignItems:'center',gap:0,padding:'4px 0 12px' }}>
      {PIPELINE.map((s,i) => {
        const done   = step > i;
        const active = step === i;
        return (
          <React.Fragment key={s}>
            <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:4 }}>
              <div style={{ width:28,height:28,borderRadius:'50%',
                background:done?'var(--clr-green)':active?STATUS_COLOR[s]||'var(--clr-primary)':'var(--clr-border)',
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#fff',fontWeight:800,
                boxShadow:active?`0 0 0 3px ${STATUS_BG[s]||'#eff6ff'}`:'none',
              }}>{done?'✓':i+1}</div>
              <span style={{ fontSize:9,fontWeight:600,color:active?STATUS_COLOR[s]:done?'var(--clr-green)':'var(--clr-muted)',whiteSpace:'nowrap',maxWidth:64,textAlign:'center',lineHeight:1.3 }}>{s}</span>
            </div>
            {i<PIPELINE.length-1 && <div style={{ flex:1,height:2,background:done?'var(--clr-green)':'var(--clr-border)',margin:'0 4px',marginBottom:22,minWidth:8 }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Interview Scheduler Modal ─────────────────────────────────────────────────
function InterviewModal({ appId, onClose, onScheduled }) {
  const [form, setForm] = useState({ interviewType:'Video Call', scheduledDate:'', durationMinutes:60, meetingLink:'', notes:'' });
  const [saving, setSaving] = useState(false);
  const s = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = async () => {
    if (!form.scheduledDate) { toast.error('Please set a date and time'); return; }
    setSaving(true);
    try {
      await api.scheduleInterview(appId, form);
      toast.success('Interview scheduled! 📅');
      onScheduled();
      onClose();
    } catch(err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{ position:'fixed',inset:0,background:'rgba(10,20,50,0.55)',backdropFilter:'blur(4px)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
      <div style={{ background:'#fff',borderRadius:20,width:'100%',maxWidth:480,boxShadow:'var(--shadow-xl)',overflow:'hidden' }}>
        <div style={{ padding:'18px 22px',borderBottom:'1px solid var(--clr-border-soft)',display:'flex',justifyContent:'space-between',alignItems:'center',background:'var(--clr-primary)' }}>
          <div>
            <h3 style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:16,color:'#fff',margin:0 }}>📅 Schedule Interview</h3>
            <p style={{ fontSize:12,color:'rgba(255,255,255,0.6)',marginTop:2 }}>Book a time slot for this applicant</p>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.12)',border:'none',color:'#fff',width:30,height:30,borderRadius:8,cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center' }}>×</button>
        </div>
        <div style={{ padding:22,display:'flex',flexDirection:'column',gap:14 }}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
            <div>
              <label style={{ display:'block',fontSize:11,fontWeight:700,color:'var(--clr-muted)',textTransform:'uppercase',letterSpacing:0.6,marginBottom:6 }}>Interview Type *</label>
              <select value={form.interviewType} onChange={e=>s('interviewType',e.target.value)}
                style={{ width:'100%',padding:'10px 12px',border:'1.5px solid var(--clr-border)',borderRadius:9,fontSize:13,fontFamily:'inherit',background:'#fff',outline:'none' }}>
                {INTERVIEW_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block',fontSize:11,fontWeight:700,color:'var(--clr-muted)',textTransform:'uppercase',letterSpacing:0.6,marginBottom:6 }}>Duration (min)</label>
              <select value={form.durationMinutes} onChange={e=>s('durationMinutes',Number(e.target.value))}
                style={{ width:'100%',padding:'10px 12px',border:'1.5px solid var(--clr-border)',borderRadius:9,fontSize:13,fontFamily:'inherit',background:'#fff',outline:'none' }}>
                {[15,30,45,60,90,120].map(d=><option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ display:'block',fontSize:11,fontWeight:700,color:'var(--clr-muted)',textTransform:'uppercase',letterSpacing:0.6,marginBottom:6 }}>Date & Time *</label>
            <input type="datetime-local" value={form.scheduledDate} onChange={e=>s('scheduledDate',e.target.value)}
              style={{ width:'100%',padding:'10px 12px',border:'1.5px solid var(--clr-border)',borderRadius:9,fontSize:13,fontFamily:'inherit',background:'#fff',outline:'none',boxSizing:'border-box' }}
            />
          </div>
          <div>
            <label style={{ display:'block',fontSize:11,fontWeight:700,color:'var(--clr-muted)',textTransform:'uppercase',letterSpacing:0.6,marginBottom:6 }}>Meeting Link / Location</label>
            <input value={form.meetingLink} onChange={e=>s('meetingLink',e.target.value)} placeholder="https://meet.google.com/… or office room"
              style={{ width:'100%',padding:'10px 12px',border:'1.5px solid var(--clr-border)',borderRadius:9,fontSize:13,fontFamily:'inherit',background:'#fff',outline:'none',boxSizing:'border-box' }}
            />
          </div>
          <div>
            <label style={{ display:'block',fontSize:11,fontWeight:700,color:'var(--clr-muted)',textTransform:'uppercase',letterSpacing:0.6,marginBottom:6 }}>Notes</label>
            <textarea value={form.notes} onChange={e=>s('notes',e.target.value)} rows={3}
              placeholder="Topics to cover, prep notes…"
              style={{ width:'100%',padding:'10px 12px',border:'1.5px solid var(--clr-border)',borderRadius:9,fontSize:13,fontFamily:'inherit',resize:'vertical',lineHeight:1.6,background:'#fff',outline:'none',boxSizing:'border-box' }}
            />
          </div>
          <div style={{ display:'flex',gap:10,justifyContent:'flex-end' }}>
            <button onClick={onClose} style={{ padding:'10px 22px',borderRadius:9,background:'var(--clr-bg)',border:'1.5px solid var(--clr-border)',fontWeight:600,fontSize:14,cursor:'pointer',fontFamily:'inherit',color:'var(--clr-text)' }}>Cancel</button>
            <button onClick={handleSubmit} disabled={saving} style={{ padding:'10px 24px',borderRadius:9,background:'var(--clr-primary)',color:'#fff',fontWeight:700,fontSize:14,border:'none',cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:8 }}>
              {saving&&<span style={{ width:13,height:13,border:'2px solid rgba(255,255,255,0.4)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.7s linear infinite',display:'inline-block' }} />}
              Confirm Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN APPLICATION DETAIL
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminApplicationDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [detail,          setDetail]          = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [newStatus,       setNewStatus]       = useState('');
  const [statusNote,      setStatusNote]      = useState('');
  const [updatingStatus,  setUpdatingStatus]  = useState(false);
  const [noteText,        setNoteText]        = useState('');
  const [shareWithApplicant, setShareWithApplicant] = useState(false);
  const [addingNote,      setAddingNote]      = useState(false);
  const [showScheduler,   setShowScheduler]   = useState(false);
  const [activeTab,       setActiveTab]       = useState('profile');

  const load = useCallback(async () => {
    try {
      const data = await api.getApplication(id);
      setDetail(data);
      setNewStatus(data.status);
    } catch(err) {
      toast.error('Application not found');
      navigate('/admin/applications');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === detail.status) return;
    setUpdatingStatus(true);
    try {
      await api.updateStatus(id, { status: newStatus, note: statusNote || `Status changed to ${newStatus}` });
      toast.success(`Status updated to "${newStatus}"`);
      setStatusNote('');
      load();
    } catch(err) { toast.error(err.message); }
    finally { setUpdatingStatus(false); }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) { toast.error('Note cannot be empty'); return; }
    setAddingNote(true);
    try {
      await api.addNote(id, { note: noteText.trim(), isPrivate: !shareWithApplicant });
      toast.success('Note added');
      setNoteText('');
      setShareWithApplicant(false);
      load();
    } catch(err) { toast.error(err.message); }
    finally { setAddingNote(false); }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await api.deleteNote(id, noteId);
      toast.success('Note deleted');
      load();
    } catch(err) { toast.error(err.message); }
  };

  const handleUpdateInterviewOutcome = async (intId, outcome) => {
    try {
      await api.updateInterview(id, intId, { outcome });
      if (outcome === 'Passed' && detail.status === 'Interview Scheduled') {
        await api.updateStatus(id, { status:'Interviewed', note:'Interview completed' });
      }
      toast.success(`Interview marked as ${outcome}`);
      load();
    } catch(err) { toast.error(err.message); }
  };

  const handleQuickStatus = async (status, confirmMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    try {
      await api.updateStatus(id, { status, note: `${status} by admin` });
      toast.success(`Application ${status.toLowerCase()}`);
      load();
    } catch(err) { toast.error(err.message); }
  };

  if (loading) return (
    <AdminLayout title="Loading…">
      <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:300 }}>
        <div style={{ width:40,height:40,border:'3px solid var(--clr-primary)',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite' }} />
      </div>
    </AdminLayout>
  );
  if (!detail) return null;

  const profile   = detail.applicant?.profile;
  const applicant = detail.applicant;
  const job       = detail.job;

  const fullName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName}`
    : applicant?.email || 'Unknown';
  const initials = profile?.firstName
    ? `${profile.firstName[0]}${profile.lastName?.[0]||''}`.toUpperCase()
    : '?';

  const TABS = [
    { id:'profile',    label:'Profile',     icon:'👤' },
    { id:'cv',         label:'Application', icon:'📄' },
    { id:'interviews', label:'Interviews',  icon:'📅', badge: detail.interviews?.length },
    { id:'notes',      label:'Notes',       icon:'📝', badge: detail.notes?.length },
    { id:'history',    label:'History',     icon:'🕐' },
  ];

  return (
    <AdminLayout
      title={`${fullName}'s Application`}
      subtitle={`${job?.title||'(Job removed)'} · Applied ${new Date(detail.createdAt).toLocaleDateString('en-KE',{day:'numeric',month:'long',year:'numeric'})}`}
    >
      <div style={{ marginBottom:20 }}>
        <Link to="/admin/applications" style={{ display:'inline-flex',alignItems:'center',gap:6,color:'var(--clr-muted)',fontSize:13,fontWeight:600 }}
          onMouseEnter={e=>e.currentTarget.style.color='var(--clr-primary)'}
          onMouseLeave={e=>e.currentTarget.style.color='var(--clr-muted)'}>
          ← All Applications
        </Link>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'1fr 320px',gap:20 }}>

        {/* ── Left ─────────────────────────────────────── */}
        <div style={{ display:'flex',flexDirection:'column',gap:16 }}>

          {/* Header card */}
          <Card style={{ background:'linear-gradient(135deg,var(--clr-primary),var(--clr-primary-dark))',border:'none' }}>
            <div style={{ display:'flex',alignItems:'center',gap:18,flexWrap:'wrap' }}>
              <div style={{ width:64,height:64,borderRadius:16,background:'var(--clr-gold)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-display)',fontWeight:800,fontSize:22,color:'var(--clr-primary)',flexShrink:0,boxShadow:'0 4px 16px rgba(244,180,0,0.35)' }}>
                {initials}
              </div>
              <div style={{ flex:1 }}>
                <h2 style={{ fontFamily:'var(--font-display)',fontWeight:800,fontSize:22,color:'#fff',margin:'0 0 4px' }}>{fullName}</h2>
                <div style={{ display:'flex',gap:16,flexWrap:'wrap' }}>
                  {applicant?.email && <span style={{ fontSize:13,color:'rgba(255,255,255,0.65)' }}>✉️ {applicant.email}</span>}
                  {profile?.phone  && <span style={{ fontSize:13,color:'rgba(255,255,255,0.65)' }}>📞 {profile.phone}</span>}
                  {profile?.city   && <span style={{ fontSize:13,color:'rgba(255,255,255,0.65)' }}>📍 {profile.city}, {profile.country}</span>}
                </div>
                <div style={{ display:'flex',gap:8,marginTop:10,flexWrap:'wrap' }}>
                  <span style={{ background:STATUS_BG[detail.status],color:STATUS_COLOR[detail.status],padding:'4px 12px',borderRadius:'var(--radius-full)',fontSize:12,fontWeight:700 }}>{detail.status}</span>
                  {job && <Badge label={job.jobType} />}
                  {detail.cvFileName && <span style={{ background:'rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.75)',padding:'4px 12px',borderRadius:'var(--radius-full)',fontSize:12,fontWeight:600 }}>📄 {detail.cvFileName}</span>}
                </div>
              </div>
              <div style={{ display:'flex',gap:12 }}>
                {[
                  { icon:'💰',label:'Salary Ask',value:detail.expectedSalary?`KES ${Number(detail.expectedSalary).toLocaleString()}`:'-' },
                  { icon:'📅',label:'Available',  value:detail.availableStartDate?new Date(detail.availableStartDate).toLocaleDateString('en-KE',{day:'numeric',month:'short'}):'-' },
                ].map(s=>(
                  <div key={s.label} style={{ background:'rgba(255,255,255,0.1)',borderRadius:10,padding:'10px 14px',textAlign:'center' }}>
                    <div style={{ fontSize:16,marginBottom:3 }}>{s.icon}</div>
                    <div style={{ fontSize:12,fontWeight:700,color:'#fff' }}>{s.value}</div>
                    <div style={{ fontSize:10,color:'rgba(255,255,255,0.5)',marginTop:1 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Pipeline */}
          <Card title="Application Pipeline" icon="🔄">
            <PipelineBar current={detail.status} />
            {['Rejected','Withdrawn'].includes(detail.status) && (
              <div style={{ background:'var(--clr-red-pale)',border:'1px solid rgba(220,38,38,0.15)',borderRadius:10,padding:12,fontSize:13,color:'var(--clr-red)',fontWeight:600 }}>
                ⚠️ This application is {detail.status.toLowerCase()}.
              </div>
            )}
          </Card>

          {/* Tabbed panel */}
          <div style={{ background:'#fff',borderRadius:14,border:'1px solid var(--clr-border-soft)',boxShadow:'var(--shadow-sm)',overflow:'hidden' }}>
            <div style={{ display:'flex',borderBottom:'1px solid var(--clr-border-soft)',background:'var(--clr-bg)' }}>
              {TABS.map(t=>(
                <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{ flex:1,padding:'13px 10px',border:'none',background:activeTab===t.id?'#fff':'transparent',borderBottom:activeTab===t.id?'2px solid var(--clr-primary)':'2px solid transparent',fontFamily:'inherit',fontSize:12,fontWeight:600,color:activeTab===t.id?'var(--clr-primary)':'var(--clr-muted)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:5 }}>
                  <span>{t.icon}</span>{t.label}
                  {t.badge>0&&<span style={{ background:'var(--clr-primary)',color:'#fff',padding:'1px 6px',borderRadius:10,fontSize:10,fontWeight:700 }}>{t.badge}</span>}
                </button>
              ))}
            </div>

            <div style={{ padding:20 }}>

              {/* Profile tab */}
              {activeTab==='profile' && (
                <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                    <div>
                      <h4 style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:13,color:'var(--clr-primary)',marginBottom:12,paddingBottom:8,borderBottom:'2px solid var(--clr-gold)' }}>Personal Details</h4>
                      <InfoPair label="Full Name"   value={fullName} />
                      <InfoPair label="Email"       value={applicant?.email} />
                      <InfoPair label="Phone"       value={profile?.phone} />
                      <InfoPair label="Date of Birth" value={formatDate(profile?.dateOfBirth)} />
                      <InfoPair label="Gender"      value={profile?.gender} />
                      <InfoPair label="Nationality" value={profile?.nationality} />
                    </div>
                    <div>
                      <h4 style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:13,color:'var(--clr-primary)',marginBottom:12,paddingBottom:8,borderBottom:'2px solid var(--clr-gold)' }}>Contact & Links</h4>
                      <InfoPair label="City"    value={profile?.city} />
                      <InfoPair label="Country" value={profile?.country} />
                      <InfoPair label="Address" value={profile?.address} />
                      <InfoPair label="LinkedIn"  value={profile?.linkedinUrl  ? <a href={profile.linkedinUrl}  target="_blank" rel="noreferrer" style={{ color:'var(--clr-primary)',fontWeight:700 }}>View Profile →</a>  : null} />
                      <InfoPair label="Portfolio" value={profile?.portfolioUrl ? <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" style={{ color:'var(--clr-primary)',fontWeight:700 }}>View Portfolio →</a> : null} />
                    </div>
                  </div>
                  {profile?.professionalSummary && (
                    <div>
                      <h4 style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:13,color:'var(--clr-primary)',marginBottom:10,paddingBottom:8,borderBottom:'2px solid var(--clr-gold)' }}>Professional Summary</h4>
                      <p style={{ fontSize:13,color:'var(--clr-text-soft)',lineHeight:1.75,margin:0 }}>{profile.professionalSummary}</p>
                    </div>
                  )}
                  {detail.skills?.length>0 && (
                    <div>
                      <h4 style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:13,color:'var(--clr-primary)',marginBottom:10,paddingBottom:8,borderBottom:'2px solid var(--clr-gold)' }}>Skills ({detail.skills.length})</h4>
                      <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
                        {detail.skills.map((s,i)=>(
                          <div key={i} style={{ background:'var(--clr-primary-pale)',borderRadius:9,padding:'6px 12px',fontSize:12 }}>
                            <span style={{ fontWeight:700,color:'var(--clr-primary)' }}>{s.skillName}</span>
                            <span style={{ color:'var(--clr-muted)',marginLeft:6 }}>{s.proficiency}</span>
                            {s.yearsOfExperience && <span style={{ color:'var(--clr-muted)',marginLeft:4 }}>· {s.yearsOfExperience}yr{s.yearsOfExperience!==1?'s':''}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {detail.languages?.length>0 && (
                    <div>
                      <h4 style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:13,color:'var(--clr-primary)',marginBottom:10,paddingBottom:8,borderBottom:'2px solid var(--clr-gold)' }}>Languages</h4>
                      <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
                        {detail.languages.map((l,i)=>(
                          <div key={i} style={{ background:'var(--clr-bg)',border:'1px solid var(--clr-border-soft)',borderRadius:9,padding:'6px 14px',fontSize:12 }}>
                            <span style={{ fontWeight:700,color:'var(--clr-text)' }}>{l.language}</span>
                            <span style={{ color:'var(--clr-muted)',marginLeft:6 }}>{l.proficiency}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CV / Application tab */}
              {activeTab==='cv' && (
                <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
                  {detail.coverLetter && (
                    <div>
                      <h4 style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:13,color:'var(--clr-primary)',marginBottom:10,paddingBottom:8,borderBottom:'2px solid var(--clr-gold)' }}>Cover Letter</h4>
                      <p style={{ fontSize:13,color:'var(--clr-text-soft)',lineHeight:1.8,whiteSpace:'pre-wrap',margin:0 }}>{detail.coverLetter}</p>
                    </div>
                  )}
                  {detail.workExperiences?.length>0 && (
                    <div>
                      <h4 style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:13,color:'var(--clr-primary)',marginBottom:12,paddingBottom:8,borderBottom:'2px solid var(--clr-gold)' }}>Work Experience</h4>
                      {detail.workExperiences.map((e,i)=>(
                        <div key={i} style={{ paddingBottom:14,marginBottom:14,borderBottom:i<detail.workExperiences.length-1?'1px solid var(--clr-border-soft)':'none' }}>
                          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4 }}>
                            <div>
                              <div style={{ fontWeight:700,fontSize:14,color:'var(--clr-text)' }}>{e.position}</div>
                              <div style={{ fontSize:13,color:'var(--clr-primary)',fontWeight:600 }}>{e.company}</div>
                            </div>
                            <div style={{ textAlign:'right' }}>
                              <div style={{ fontSize:12,color:'var(--clr-muted)' }}>{e.startDate} – {e.isCurrent?'Present':e.endDate||'—'}</div>
                              <div style={{ fontSize:11,color:'var(--clr-muted)',marginTop:2 }}>{e.location} · {e.employmentType}</div>
                            </div>
                          </div>
                          {e.description&&<p style={{ fontSize:12,color:'var(--clr-text-soft)',lineHeight:1.65,margin:'8px 0 0' }}>{e.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                  {detail.educations?.length>0 && (
                    <div>
                      <h4 style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:13,color:'var(--clr-primary)',marginBottom:12,paddingBottom:8,borderBottom:'2px solid var(--clr-gold)' }}>Education</h4>
                      {detail.educations.map((e,i)=>(
                        <div key={i} style={{ paddingBottom:12,marginBottom:12,borderBottom:i<detail.educations.length-1?'1px solid var(--clr-border-soft)':'none' }}>
                          <div style={{ display:'flex',justifyContent:'space-between' }}>
                            <div>
                              <div style={{ fontWeight:700,fontSize:14,color:'var(--clr-text)' }}>{e.degree} in {e.fieldOfStudy}</div>
                              <div style={{ fontSize:13,color:'var(--clr-primary)',fontWeight:600 }}>{e.institution}</div>
                            </div>
                            <div style={{ textAlign:'right',fontSize:12,color:'var(--clr-muted)' }}>
                              {e.startDate} – {e.endDate||'—'}
                              {e.gpa&&<div style={{ color:'var(--clr-green)',fontWeight:700,marginTop:2 }}>GPA {e.gpa}</div>}
                            </div>
                          </div>
                          {e.honors&&<div style={{ fontSize:12,color:'var(--clr-muted)',marginTop:4 }}>🏆 {e.honors}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                  {detail.certifications?.length>0 && (
                    <div>
                      <h4 style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:13,color:'var(--clr-primary)',marginBottom:12,paddingBottom:8,borderBottom:'2px solid var(--clr-gold)' }}>Certifications</h4>
                      {detail.certifications.map((c,i)=>(
                        <div key={i} style={{ display:'flex',gap:12,padding:'10px 12px',background:'var(--clr-bg)',borderRadius:10,marginBottom:8,alignItems:'center' }}>
                          <span style={{ fontSize:20,flexShrink:0 }}>📜</span>
                          <div style={{ flex:1 }}>
                            <div style={{ fontWeight:700,fontSize:13,color:'var(--clr-text)' }}>{c.certName}</div>
                            <div style={{ fontSize:12,color:'var(--clr-muted)' }}>{c.issuingOrg}{c.issueDate&&` · ${c.issueDate}`}</div>
                          </div>
                          {c.credentialUrl&&<a href={c.credentialUrl} target="_blank" rel="noreferrer" style={{ fontSize:12,fontWeight:700,color:'var(--clr-primary)' }}>Verify →</a>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Interviews tab */}
              {activeTab==='interviews' && (
                <div>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18 }}>
                    <h4 style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:14,color:'var(--clr-primary)',margin:0 }}>Scheduled Interviews</h4>
                    <button onClick={()=>setShowScheduler(true)} style={{ padding:'8px 18px',borderRadius:9,background:'var(--clr-primary)',color:'#fff',fontWeight:700,fontSize:13,border:'none',cursor:'pointer',fontFamily:'inherit' }}>
                      + Schedule Interview
                    </button>
                  </div>
                  {detail.interviews?.length===0 ? (
                    <div style={{ textAlign:'center',padding:'32px 0' }}>
                      <div style={{ fontSize:36,marginBottom:10 }}>📅</div>
                      <p style={{ color:'var(--clr-muted)',fontSize:14 }}>No interviews scheduled yet.</p>
                      <button onClick={()=>setShowScheduler(true)} style={{ marginTop:12,padding:'9px 20px',borderRadius:9,background:'var(--clr-primary)',color:'#fff',fontWeight:700,fontSize:13,border:'none',cursor:'pointer',fontFamily:'inherit' }}>Schedule First Interview</button>
                    </div>
                  ) : detail.interviews.map(iv=>(
                    <div key={iv.id} style={{ background:'var(--clr-bg)',borderRadius:12,padding:16,marginBottom:12,border:'1px solid var(--clr-border-soft)' }}>
                      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8 }}>
                        <div>
                          <div style={{ fontWeight:700,fontSize:14,color:'var(--clr-text)' }}>{iv.interviewType}</div>
                          <div style={{ fontSize:13,color:'var(--clr-primary)',fontWeight:600,marginTop:2 }}>{formatDateTime(iv.scheduledDate)} · {iv.durationMinutes} min</div>
                        </div>
                        <span style={{ fontSize:12,fontWeight:700,padding:'4px 12px',borderRadius:'var(--radius-full)',
                          background:iv.outcome==='Passed'?'var(--clr-green-pale)':iv.outcome==='Failed'?'var(--clr-red-pale)':'var(--clr-primary-pale)',
                          color:iv.outcome==='Passed'?'var(--clr-green)':iv.outcome==='Failed'?'var(--clr-red)':'var(--clr-primary)' }}>
                          {iv.outcome}
                        </span>
                      </div>
                      {iv.meetingLink&&<div style={{ fontSize:12,marginBottom:6 }}>🔗 <a href={iv.meetingLink} target="_blank" rel="noreferrer" style={{ color:'var(--clr-primary)',fontWeight:600 }}>Join Meeting</a></div>}
                      {iv.notes&&<p style={{ fontSize:12,color:'var(--clr-muted)',margin:'8px 0',lineHeight:1.55 }}>{iv.notes}</p>}
                      {iv.outcome==='Pending'&&(
                        <div style={{ display:'flex',gap:8,marginTop:10 }}>
                          <button onClick={()=>handleUpdateInterviewOutcome(iv.id,'Passed')} style={{ padding:'6px 14px',borderRadius:8,background:'var(--clr-green-pale)',border:'none',color:'var(--clr-green)',fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'inherit' }}>✓ Passed</button>
                          <button onClick={()=>handleUpdateInterviewOutcome(iv.id,'Failed')} style={{ padding:'6px 14px',borderRadius:8,background:'var(--clr-red-pale)',border:'none',color:'var(--clr-red)',fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'inherit' }}>✗ Failed</button>
                          <button onClick={()=>handleUpdateInterviewOutcome(iv.id,'Rescheduled')} style={{ padding:'6px 14px',borderRadius:8,background:'var(--clr-bg)',border:'1px solid var(--clr-border)',color:'var(--clr-muted)',fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'inherit' }}>↻ Reschedule</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Notes tab */}
              {activeTab==='notes' && (
                <div>
                  <div style={{ marginBottom:18 }}>
                    <label style={{ display:'block',fontSize:11,fontWeight:700,color:'var(--clr-muted)',textTransform:'uppercase',letterSpacing:0.6,marginBottom:8 }}>Add Note</label>
                    <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} rows={3}
                      placeholder="Add observations, feedback, or internal comments…"
                      style={{ width:'100%',padding:'11px 14px',border:'1.5px solid var(--clr-border)',borderRadius:9,fontSize:13,fontFamily:'inherit',resize:'vertical',lineHeight:1.6,boxSizing:'border-box',outline:'none' }}
                      onFocus={e=>e.target.style.borderColor='var(--clr-primary)'}
                      onBlur={e=>e.target.style.borderColor='var(--clr-border)'}
                    />
                    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8 }}>
                      <label style={{ display:'flex',alignItems:'center',gap:8,fontSize:12,color:'var(--clr-text-soft)',cursor:'pointer' }}>
                        <input
                          type="checkbox"
                          checked={shareWithApplicant}
                          onChange={e=>setShareWithApplicant(e.target.checked)}
                          style={{ accentColor:'var(--clr-primary)' }}
                        />
                        Share with applicant
                      </label>
                      <button onClick={handleAddNote} disabled={addingNote||!noteText.trim()}
                        style={{ padding:'9px 22px',borderRadius:9,background:'var(--clr-primary)',color:'#fff',fontWeight:700,fontSize:13,border:'none',cursor:'pointer',fontFamily:'inherit',opacity:!noteText.trim()?0.5:1 }}>
                        Add Note
                      </button>
                    </div>
                  </div>
                  {detail.notes?.length===0 ? (
                    <div style={{ textAlign:'center',padding:'24px 0' }}>
                      <div style={{ fontSize:32,marginBottom:8 }}>📝</div>
                      <p style={{ color:'var(--clr-muted)',fontSize:14 }}>No notes yet.</p>
                    </div>
                  ) : detail.notes.map(n=>(
                    <div key={n.id} style={{ background:'var(--clr-bg)',borderRadius:11,padding:14,marginBottom:10,border:'1px solid var(--clr-border-soft)' }}>
                      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6 }}>
                        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                          <div style={{ width:26,height:26,borderRadius:7,background:'var(--clr-primary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#fff',fontWeight:800 }}>A</div>
                          <div>
                            <div style={{ fontSize:12,fontWeight:700,color:'var(--clr-text)' }}>Admin</div>
                            <div style={{ fontSize:11,color:'var(--clr-muted)' }}>{timeAgo(n.createdAt)}</div>
                          </div>
                        </div>
                        <button onClick={()=>handleDeleteNote(n.id)} style={{ background:'none',border:'none',color:'var(--clr-muted)',cursor:'pointer',fontSize:14,padding:4 }}>🗑️</button>
                      </div>
                      <div style={{ marginBottom:6 }}>
                        <span style={{ fontSize:11,padding:'2px 8px',borderRadius:'var(--radius-full)',background:n.isPrivate?'var(--clr-bg)':'var(--clr-green-pale)',color:n.isPrivate?'var(--clr-muted)':'var(--clr-green)',fontWeight:700 }}>
                          {n.isPrivate ? 'Internal' : 'Visible to applicant'}
                        </span>
                      </div>
                      <p style={{ fontSize:13,color:'var(--clr-text-soft)',lineHeight:1.65,margin:0 }}>{n.note}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* History tab */}
              {activeTab==='history' && (
                <div>
                  <h4 style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:14,color:'var(--clr-primary)',marginBottom:16 }}>Status History</h4>
                  {detail.statusHistory?.length===0 ? (
                    <p style={{ color:'var(--clr-muted)',fontSize:14 }}>No history recorded.</p>
                  ) : (
                    <div style={{ position:'relative' }}>
                      <div style={{ position:'absolute',left:13,top:0,bottom:0,width:2,background:'var(--clr-border-soft)' }} />
                      {detail.statusHistory.map(h=>(
                        <div key={h.id} style={{ display:'flex',gap:14,marginBottom:16,position:'relative' }}>
                          <div style={{ width:28,height:28,borderRadius:'50%',background:STATUS_BG[h.status]||'var(--clr-bg)',border:`2px solid ${STATUS_COLOR[h.status]||'var(--clr-border)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,flexShrink:0,zIndex:1 }}>✓</div>
                          <div style={{ flex:1,paddingTop:2 }}>
                            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                              <span style={{ fontWeight:700,fontSize:13,color:STATUS_COLOR[h.status]||'var(--clr-text)' }}>{h.status}</span>
                              <span style={{ fontSize:11,color:'var(--clr-muted)' }}>{formatDateTime(h.createdAt)}</span>
                            </div>
                            {h.note&&<p style={{ fontSize:12,color:'var(--clr-muted)',margin:'4px 0 0',lineHeight:1.5 }}>{h.note}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Sidebar ─────────────────────────────── */}
        <div style={{ display:'flex',flexDirection:'column',gap:16 }}>

          {/* Status update */}
          <Card title="Update Status" icon="🔄">
            <div style={{ marginBottom:12 }}>
              <select value={newStatus} onChange={e=>setNewStatus(e.target.value)}
                style={{ width:'100%',padding:'11px 12px',border:`2px solid ${STATUS_COLOR[newStatus]||'var(--clr-border)'}`,borderRadius:10,fontSize:13,fontFamily:'inherit',background:STATUS_BG[newStatus]||'#fff',color:STATUS_COLOR[newStatus]||'var(--clr-text)',fontWeight:700,outline:'none',cursor:'pointer',boxSizing:'border-box' }}>
                {ALL_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <textarea value={statusNote} onChange={e=>setStatusNote(e.target.value)} rows={2}
              placeholder="Optional: reason for status change…"
              style={{ width:'100%',padding:'9px 12px',border:'1.5px solid var(--clr-border)',borderRadius:9,fontSize:12,fontFamily:'inherit',resize:'none',lineHeight:1.5,boxSizing:'border-box',outline:'none',marginBottom:10 }}
            />
            <button onClick={handleStatusUpdate} disabled={newStatus===detail.status||updatingStatus}
              style={{ width:'100%',padding:'11px',borderRadius:9,background:newStatus===detail.status?'var(--clr-border)':'var(--clr-primary)',color:'#fff',fontWeight:700,fontSize:13,border:'none',cursor:newStatus===detail.status?'not-allowed':'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
              {updatingStatus&&<span style={{ width:13,height:13,border:'2px solid rgba(255,255,255,0.4)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.7s linear infinite',display:'inline-block' }} />}
              {newStatus===detail.status?'No change':'Update Status →'}
            </button>
          </Card>

          {/* Job info */}
          <Card title="Job Details" icon="💼">
            {job ? (
              <>
                <div style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:15,color:'var(--clr-primary)',marginBottom:4 }}>{job.title}</div>
                <div style={{ fontSize:12,color:'var(--clr-muted)',marginBottom:12 }}>{job.location}</div>
                <div style={{ display:'flex',gap:6,flexWrap:'wrap',marginBottom:12 }}>
                  <Badge label={job.jobType} size="xs" />
                  <Badge label={job.experienceLevel} size="xs" />
                  <Badge label={job.status} size="xs" dot />
                </div>
                {job.salaryMin&&<div style={{ fontSize:12,fontWeight:600,color:'var(--clr-green)',marginBottom:10 }}>KES {(job.salaryMin/1000).toFixed(0)}k–{(job.salaryMax/1000).toFixed(0)}k / {job.salaryPeriod}</div>}
                <div style={{ fontSize:11,color:'var(--clr-muted)',marginBottom:12 }}>{job._count?.applications||0} applicants · {job.slots} slot{job.slots!==1?'s':''}</div>
                <Link to={`/jobs/${job.id}`} target="_blank" style={{ display:'block',textAlign:'center',padding:'8px',borderRadius:8,background:'var(--clr-primary-pale)',color:'var(--clr-primary)',fontWeight:700,fontSize:12 }}>View Job Listing →</Link>
              </>
            ) : <p style={{ fontSize:13,color:'var(--clr-muted)' }}>Job has been removed.</p>}
          </Card>

          {/* Quick actions */}
          <Card title="Quick Actions" icon="⚡">
            <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
              <button onClick={()=>setShowScheduler(true)} style={{ display:'flex',alignItems:'center',gap:10,width:'100%',padding:'10px 12px',borderRadius:9,background:'var(--clr-primary-pale)',border:'none',color:'var(--clr-primary)',fontWeight:600,fontSize:13,cursor:'pointer',fontFamily:'inherit',transition:'all 0.18s' }}
                onMouseEnter={e=>{e.currentTarget.style.background='var(--clr-primary)';e.currentTarget.style.color='#fff';}}
                onMouseLeave={e=>{e.currentTarget.style.background='var(--clr-primary-pale)';e.currentTarget.style.color='var(--clr-primary)';}}>
                <span>📅</span> Schedule Interview
              </button>
              <button onClick={()=>handleQuickStatus('Shortlisted')} style={{ display:'flex',alignItems:'center',gap:10,width:'100%',padding:'10px 12px',borderRadius:9,background:'var(--clr-green-pale)',border:'none',color:'var(--clr-green)',fontWeight:600,fontSize:13,cursor:'pointer',fontFamily:'inherit' }}>
                <span>⭐</span> Shortlist Applicant
              </button>
              <button onClick={()=>handleQuickStatus('Rejected','Reject this application?')} style={{ display:'flex',alignItems:'center',gap:10,width:'100%',padding:'10px 12px',borderRadius:9,background:'var(--clr-red-pale)',border:'none',color:'var(--clr-red)',fontWeight:600,fontSize:13,cursor:'pointer',fontFamily:'inherit' }}>
                <span>❌</span> Reject Application
              </button>
            </div>
          </Card>

          {/* Meta */}
          <Card title="Application Info" icon="📋">
            <InfoPair label="Application ID"  value={detail.id?.slice(0,10)+'…'} />
            <InfoPair label="Submitted"        value={formatDate(detail.createdAt)} />
            <InfoPair label="Last Updated"     value={detail.updatedAt?timeAgo(detail.updatedAt):'—'} />
          </Card>
        </div>
      </div>

      {showScheduler && (
        <InterviewModal appId={id} onClose={()=>setShowScheduler(false)} onScheduled={load} />
      )}
    </AdminLayout>
  );
}
