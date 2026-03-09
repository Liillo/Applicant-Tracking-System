/**
 * HRMPEB ATS - Admin Dashboard (API version)
 */
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { api } from '../../utils/api';
import { Badge } from '../../components/UI';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const PIE_COLORS = {
  'Submitted':'#9ca3af','Under Review':'#f59e0b','Shortlisted':'#10b981',
  'Interview Scheduled':'#3b82f6','Interviewed':'#8b5cf6','Offer Extended':'#eab308',
  'Hired':'#15803d','Rejected':'#dc2626','Withdrawn':'#d1d5db',
};
const CHART_BLUE = '#1F3C88';
const ICONS = {
  briefcase: String.fromCodePoint(0x1F4BC),
  applications: String.fromCodePoint(0x1F4CB),
  hired: String.fromCodePoint(0x1F389),
  talent: String.fromCodePoint(0x1F393),
  inbox: String.fromCodePoint(0x1F4ED),
};

function KPICard({ icon, label, value, sub, color, bg, delay=0, to }) {
  const card = (
    <div style={{ background:'#fff',borderRadius:16,padding:'20px 22px',boxShadow:'var(--shadow-md)',border:'1px solid var(--clr-border-soft)',animation:`fadeIn 0.4s ease ${delay}s both`,transition:'transform 0.18s, box-shadow 0.18s' }}>
      <div style={{ width:46,height:46,borderRadius:13,background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,marginBottom:14 }}>{icon}</div>
      <div style={{ fontFamily:'var(--font-display)',fontSize:34,fontWeight:800,color,lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:13,fontWeight:600,color:'var(--clr-text-soft)',marginTop:4 }}>{label}</div>
      {sub && <div style={{ fontSize:12,color:'var(--clr-muted)',marginTop:3 }}>{sub}</div>}
    </div>
  );

  if (!to) return card;
  return (
    <Link to={to} style={{ textDecoration:'none' }}
      onMouseEnter={e=>{ const el=e.currentTarget.firstChild; el.style.transform='translateY(-2px)'; el.style.boxShadow='var(--shadow-lg)'; }}
      onMouseLeave={e=>{ const el=e.currentTarget.firstChild; el.style.transform='translateY(0)'; el.style.boxShadow='var(--shadow-md)'; }}>
      {card}
    </Link>
  );
}

function ChartCard({ title, subtitle, children, style={} }) {
  return (
    <div style={{ background:'#fff',borderRadius:16,padding:24,boxShadow:'var(--shadow-md)',border:'1px solid var(--clr-border-soft)',...style }}>
      <div style={{ marginBottom:20 }}>
        <h3 style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:16,color:'var(--clr-primary)',margin:0 }}>{title}</h3>
        {subtitle && <p style={{ fontSize:12,color:'var(--clr-muted)',marginTop:3 }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function SimpleBarChart({ data, color }) {
  const max = Math.max(...data.map((item) => item.count), 1);

  return (
    <div style={{ height: 240, display: 'grid', gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`, alignItems: 'end', gap: 12, paddingTop: 12 }}>
      {data.map((item) => {
        const height = Math.max((item.count / max) * 170, item.count > 0 ? 12 : 4);
        return (
          <div key={item.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--clr-primary)', marginBottom: 8 }}>{item.count}</div>
            <div
              title={`${item.month}: ${item.count} applications`}
              style={{
                width: '100%',
                maxWidth: 36,
                height,
                minHeight: 4,
                borderRadius: '10px 10px 4px 4px',
                background: `linear-gradient(180deg, ${color} 0%, #3559b5 100%)`,
                boxShadow: 'inset 0 -8px 18px rgba(255,255,255,0.12)',
                transition: 'height 0.5s ease',
              }}
            />
            <div style={{ fontSize: 11, color: 'var(--clr-muted)', marginTop: 10 }}>{item.month}</div>
          </div>
        );
      })}
    </div>
  );
}

function SimpleDonutChart({ data, colors }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const radius = 70;
  const strokeWidth = 26;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  if (!total) {
    return (
      <div style={{ height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--clr-muted)', fontSize: 14 }}>
        No applications yet
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <svg width="220" height="190" viewBox="0 0 220 190" role="img" aria-label="Application status distribution">
        <g transform="translate(110 95)">
          <circle r={radius} fill="none" stroke="var(--clr-border-soft)" strokeWidth={strokeWidth} />
          {data.map((item) => {
            const segment = (item.count / total) * circumference;
            const circle = (
              <circle
                key={item.status}
                r={radius}
                fill="none"
                stroke={colors[item.status] || '#9ca3af'}
                strokeWidth={strokeWidth}
                strokeDasharray={`${segment} ${circumference - segment}`}
                strokeDashoffset={-offset}
                transform="rotate(-90)"
                strokeLinecap="butt"
              />
            );
            offset += segment;
            return circle;
          })}
          <circle r={46} fill="#fff" />
          <text x="0" y="-2" textAnchor="middle" style={{ fontSize: 26, fontWeight: 800, fill: 'var(--clr-primary)' }}>
            {total}
          </text>
          <text x="0" y="18" textAnchor="middle" style={{ fontSize: 11, fontWeight: 700, fill: 'var(--clr-muted)' }}>
            Applications
          </text>
        </g>
      </svg>
    </div>
  );
}

function buildStats(jobs, apps) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const openJobs = jobs.filter(j=>j.status==='Open').length;
  const totalJobs = jobs.length;
  const totalApps = apps.length;
  const thisMonthApps = apps.filter(a=>{ const d=new Date(a.createdAt); return d.getMonth()===month&&d.getFullYear()===year; }).length;
  const hired = apps.filter(a=>a.status==='Hired').length;
  const hiringRate = totalApps>0 ? ((hired/totalApps)*100).toFixed(1) : '0.0';
  const totalApplicants = new Set(apps.map(a=>a.applicantId)).size;

  const monthlyTrend = [];
  for (let i=5; i>=0; i--) {
    const d = new Date(year, month-i, 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const count = apps.filter(a=>{ const ad=new Date(a.createdAt); return ad.getMonth()===m&&ad.getFullYear()===y; }).length;
    monthlyTrend.push({ month: d.toLocaleDateString('en-KE',{month:'short'}), count });
  }

  const statusOrder = [
    'Submitted',
    'Under Review',
    'Shortlisted',
    'Interview Scheduled',
    'Interviewed',
    'Offer Extended',
    'Hired',
    'Rejected',
    'Withdrawn',
  ];
  const statusMap = Object.fromEntries(statusOrder.map(s => [s, 0]));
  apps.forEach(a => {
    if (statusMap[a.status] !== undefined) statusMap[a.status] += 1;
    else statusMap[a.status] = (statusMap[a.status] || 0) + 1;
  });
  const total = apps.length;
  const statusDist = statusOrder
    .map((status) => {
      const count = statusMap[status] || 0;
      const percent = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
      return { status, count, percent };
    });

  const deptMap = {};
  jobs.forEach(j => {
    const name = j.department?.name || 'Unknown';
    if (!deptMap[name]) deptMap[name] = { name, jobCount: 0, appCount: 0 };
    deptMap[name].jobCount += 1;
    deptMap[name].appCount += (j._count?.applications || 0);
  });
  const deptStats = Object.values(deptMap).sort((a,b)=>b.appCount-a.appCount);

  const topJobs = [...jobs]
    .sort((a,b)=>(b._count?.applications||0)-(a._count?.applications||0))
    .slice(0,5)
    .map(j=>({ title:j.title, location:j.location, count:j._count?.applications||0 }));

  const funnel = [
    { stage:'Applied',     count:apps.length },
    { stage:'Reviewed',    count:apps.filter(a=>a.status!=='Submitted').length },
    { stage:'Shortlisted', count:apps.filter(a=>['Shortlisted','Interview Scheduled','Interviewed','Offer Extended','Hired'].includes(a.status)).length },
    { stage:'Interviewed', count:apps.filter(a=>['Interviewed','Offer Extended','Hired'].includes(a.status)).length },
    { stage:'Hired',       count:apps.filter(a=>a.status==='Hired').length },
  ];

  const openCount = jobs.filter(j=>j.status==='Open').length;
  const closedCount = jobs.filter(j=>j.status==='Closed').length;
  const draftCount = jobs.filter(j=>j.status==='Draft').length;

  const recentApps = [...apps]
    .sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))
    .slice(0,5)
    .map(a=>({
      ...a,
      firstName: a.applicant?.profile?.firstName || a.applicant?.email?.split('@')[0] || '?',
      lastName:  a.applicant?.profile?.lastName  || '',
      jobTitle:  a.job?.title || '(removed)',
    }));

  return {
    openJobs, totalJobs, totalApps, thisMonthApps, hired, hiringRate, totalApplicants,
    monthlyTrend, statusDist, recentApps, deptStats, topJobs, funnel, openCount, closedCount, draftCount,
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [jobs, apps] = await Promise.all([api.getJobs(), api.allApplications()]);
        setStats(buildStats(jobs, apps));
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !stats) {
    return (
      <AdminLayout title="Dashboard" subtitle="Loading...">
        <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:300 }}>
          <div style={{ width:40,height:40,border:'3px solid var(--clr-primary)',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite' }} />
        </div>
      </AdminLayout>
    );
  }

  const FUNNEL_COLORS = ['#3b82f6','#8b5cf6','var(--clr-gold)','#f59e0b','var(--clr-green)'];
  const funnelTotal = stats.funnel[0]?.count || 1;

  return (
    <AdminLayout title="Dashboard" subtitle="Recruitment overview and analytics">
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24 }}>
        <KPICard to="/admin/management" icon={ICONS.briefcase} label="Open Jobs" value={stats.openJobs} sub={`of ${stats.totalJobs} total`} color="var(--clr-primary)" bg="var(--clr-primary-pale)" delay={0} />
        <KPICard to="/admin/applications" icon={ICONS.applications} label="Total Applications" value={stats.totalApps} sub={`${stats.thisMonthApps} this month`} color="#d97706" bg="#fffbea" delay={0.07} />
        <KPICard to="/admin/applications?status=Hired" icon={ICONS.hired} label="Hired" value={stats.hired} sub={`${stats.hiringRate}% hire rate`} color="var(--clr-green)" bg="var(--clr-green-pale)" delay={0.14} />
        <KPICard to="/admin/applications" icon={ICONS.talent} label="Registered Talent" value={stats.totalApplicants} sub="across all departments" color="#7c3aed" bg="#f5f3ff" delay={0.21} />
      </div>

      <ChartCard title="Recent Applications" subtitle="5 most recent submissions" style={{ marginBottom:20 }}>
        {stats.recentApps.length === 0 ? (
          <div style={{ textAlign:'center',padding:'32px 0' }}>
            <div style={{ fontSize:40,marginBottom:12 }}>{ICONS.inbox}</div>
            <p style={{ color:'var(--clr-muted)',fontSize:14 }}>No applications yet. <Link to="/admin/management" style={{ color:'var(--clr-primary)',fontWeight:700 }}>Post a job</Link> to get started.</p>
          </div>
        ) : (
          <>
            {stats.recentApps.map(a=>(
              <Link key={a.id} to={`/admin/applications/${a.id}`} style={{ display:'flex',alignItems:'center',gap:14,padding:'12px 0',borderBottom:'1px solid var(--clr-border-soft)',textDecoration:'none' }}>
                <div style={{ width:36,height:36,borderRadius:10,background:'var(--clr-primary-pale)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-display)',fontWeight:800,fontSize:13,color:'var(--clr-primary)',flexShrink:0 }}>
                  {(a.firstName?.[0]||'?').toUpperCase()}{(a.lastName?.[0]||'').toUpperCase()}
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:13,fontWeight:700,color:'var(--clr-text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{a.firstName} {a.lastName}</div>
                  <div style={{ fontSize:12,color:'var(--clr-muted)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{a.jobTitle}</div>
                </div>
                <Badge label={a.status} size="xs" />
                <div style={{ fontSize:11,color:'var(--clr-muted)',flexShrink:0 }}>{new Date(a.createdAt).toLocaleDateString('en-KE',{day:'numeric',month:'short'})}</div>
              </Link>
            ))}
          </>
        )}
      </ChartCard>

      <div style={{ display:'grid',gridTemplateColumns:'1.6fr 1fr',gap:20 }}>
        <ChartCard title="Application Trend" subtitle="Monthly applications - last 6 months">
          <SimpleBarChart data={stats.monthlyTrend} color={CHART_BLUE} />
        </ChartCard>

        <ChartCard title="Status Distribution" subtitle="All applications by current status">
          {stats.statusDist.length === 0 ? (
            <div style={{ height:240,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--clr-muted)',fontSize:14 }}>No applications yet</div>
          ) : (
            <>
              <SimpleDonutChart data={stats.statusDist} colors={PIE_COLORS} />
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:8 }}>
                {stats.statusDist.map((s)=>(
                  <div key={s.status} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 8px',borderRadius:8,background:'var(--clr-bg)' }}>
                    <div style={{ display:'flex',alignItems:'center',gap:7,minWidth:0 }}>
                      <span style={{ width:9,height:9,borderRadius:'50%',background:PIE_COLORS[s.status]||'#9ca3af',flexShrink:0 }} />
                      <span style={{ fontSize:12,color:'var(--clr-text)',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{s.status}</span>
                    </div>
                    <span style={{ fontSize:11,color:'var(--clr-muted)',fontWeight:700,marginLeft:8,flexShrink:0 }}>{s.count} ({s.percent}%)</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </ChartCard>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:20,marginTop:20 }}>
        <ChartCard title="Departments" subtitle="Applications per department">
          {stats.deptStats.length === 0 ? (
            <div style={{ textAlign:'center',padding:'24px 0',color:'var(--clr-muted)',fontSize:13 }}>No data yet</div>
          ) : stats.deptStats.slice(0,6).map((d,i)=>(
            <div key={d.name} style={{ marginBottom:12 }}>
              <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4 }}>
                <span style={{ fontSize:12,fontWeight:600,color:'var(--clr-text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:140 }}>{d.name}</span>
                <span style={{ fontSize:12,fontWeight:700,color:'var(--clr-primary)',flexShrink:0,marginLeft:6 }}>{d.appCount}</span>
              </div>
              <div style={{ height:6,background:'var(--clr-border-soft)',borderRadius:3,overflow:'hidden' }}>
                <div style={{ height:'100%',borderRadius:3,background:i===0?'var(--clr-gold)':i===1?'var(--clr-primary)':'var(--clr-primary-light)',width:`${stats.deptStats[0].appCount>0?(d.appCount/stats.deptStats[0].appCount)*100:0}%`,transition:'width 0.6s ease' }} />
              </div>
              <div style={{ fontSize:10,color:'var(--clr-muted)',marginTop:2 }}>{d.jobCount} job{d.jobCount!==1?'s':''}</div>
            </div>
          ))}
        </ChartCard>

        <ChartCard title="Top Jobs by Applications" subtitle="Most applied-to positions">
          {stats.topJobs.length === 0 ? (
            <div style={{ textAlign:'center',padding:'24px 0',color:'var(--clr-muted)',fontSize:13 }}>No applications yet</div>
          ) : stats.topJobs.map((j,i)=>(
            <div key={j.title} style={{ display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:i<stats.topJobs.length-1?'1px solid var(--clr-border-soft)':'none' }}>
              <div style={{ width:26,height:26,borderRadius:8,background:['var(--clr-gold)','var(--clr-primary)','var(--clr-green)','#7c3aed','#f59e0b'][i]||'var(--clr-border)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-display)',fontWeight:800,fontSize:12,color:'#fff',flexShrink:0 }}>{i+1}</div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:12,fontWeight:700,color:'var(--clr-text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{j.title}</div>
                <div style={{ fontSize:11,color:'var(--clr-muted)' }}>{j.location}</div>
              </div>
              <div style={{ fontSize:13,fontWeight:800,color:'var(--clr-primary)',flexShrink:0 }}>{j.count}</div>
            </div>
          ))}
        </ChartCard>

        <ChartCard title="Hiring Funnel" subtitle="Conversion at each stage">
          {stats.funnel.map((f,i)=>(
            <div key={f.stage} style={{ marginBottom:10 }}>
              <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4 }}>
                <span style={{ fontSize:12,fontWeight:600,color:'var(--clr-text)' }}>{f.stage}</span>
                <span style={{ fontSize:12,fontWeight:700,color:FUNNEL_COLORS[i] }}>
                  {f.count} <span style={{ fontSize:10,color:'var(--clr-muted)',fontWeight:400 }}>({((f.count/funnelTotal)*100).toFixed(0)}%)</span>
                </span>
              </div>
              <div style={{ height:8,background:'var(--clr-border-soft)',borderRadius:4,overflow:'hidden' }}>
                <div style={{ height:'100%',borderRadius:4,background:FUNNEL_COLORS[i],width:`${(f.count/funnelTotal)*100}%`,transition:'width 0.7s ease' }} />
              </div>
            </div>
          ))}
        </ChartCard>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginTop:20 }}>
        <div style={{ background:'#fff',borderRadius:16,padding:22,boxShadow:'var(--shadow-md)',border:'1px solid var(--clr-border-soft)',display:'flex',alignItems:'center',gap:20 }}>
          <div style={{ position:'relative',width:72,height:72,flexShrink:0 }}>
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="30" fill="none" stroke="var(--clr-border-soft)" strokeWidth="7" />
              <circle cx="36" cy="36" r="30" fill="none" stroke="var(--clr-green)" strokeWidth="7" strokeLinecap="round"
                strokeDasharray={`${parseFloat(stats.hiringRate)*1.885} 188.5`} transform="rotate(-90 36 36)" />
              <text x="36" y="41" textAnchor="middle" fontSize="13" fontWeight="800" fontFamily="var(--font-display)" fill="var(--clr-green)">{stats.hiringRate}%</text>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:16,color:'var(--clr-text)' }}>Hiring Rate</div>
            <div style={{ fontSize:12,color:'var(--clr-muted)',lineHeight:1.5 }}>{stats.hired} hired of {stats.totalApps} total</div>
          </div>
        </div>

        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
          <div style={{ background:'var(--clr-primary)',borderRadius:20,padding:'22px 20px 16px',boxShadow:'var(--shadow-md)' }}>
            <div style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:15,color:'#fff',marginBottom:14 }}>Quick Actions</div>
            {[
              {
                to:'/admin/jobs/new',
                label:'Post New Job',
                bg:'#b88900',
                color:'#ffffff',
                hoverBg:'#9c7400',
                hoverColor:'#ffffff',
              },
              {
                to:'/admin/applications',
                label:'Review Applications',
                bg:'#1f8f4e',
                color:'#ffffff',
                hoverBg:'#18713d',
                hoverColor:'#ffffff',
              },
              {
                to:'/admin/management',
                label:'Manage Jobs',
                bg:'#245bb8',
                color:'#ffffff',
                hoverBg:'#1c4995',
                hoverColor:'#ffffff',
              },
            ].map(a=>(
              <Link key={a.to} to={a.to} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 12px',borderRadius:10,background:a.bg,color:a.color,fontSize:13,fontWeight:600,marginBottom:8,transition:'all 0.18s' }}
                onMouseEnter={e=>{e.currentTarget.style.background=a.hoverBg;e.currentTarget.style.color=a.hoverColor;e.currentTarget.style.transform='translateX(2px)';}}
                onMouseLeave={e=>{e.currentTarget.style.background=a.bg;e.currentTarget.style.color=a.color;e.currentTarget.style.transform='translateX(0)';}}>
                <span>{a.label}</span>
                <span style={{ fontSize:14,color:'inherit' }}>&rarr;</span>
              </Link>
            ))}
          </div>

          <div style={{ background:'linear-gradient(135deg,var(--clr-primary),var(--clr-primary-dark))',borderRadius:16,padding:22,boxShadow:'var(--shadow-md)' }}>
            <div style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:14,color:'#fff',marginBottom:14 }}>Jobs Overview</div>
            {[
              { label:'Open',   count:stats.openCount,   color:'var(--clr-green-light)' },
              { label:'Closed', count:stats.closedCount, color:'#f87171'                },
              { label:'Draft',  count:stats.draftCount,  color:'#fcd34d'                },
            ].map(s=>(
              <div key={s.label} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize:13,color:'rgba(255,255,255,0.65)' }}>{s.label} Positions</span>
                <span style={{ fontFamily:'var(--font-display)',fontWeight:800,fontSize:18,color:s.color }}>{s.count}</span>
              </div>
            ))}
            <Link to="/admin/management" style={{ display:'block',textAlign:'center',marginTop:14,background:'rgba(255,255,255,0.12)',color:'#fff',padding:'9px',borderRadius:9,fontWeight:700,fontSize:13 }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.2)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.12)'}>
              Manage Jobs &rarr;
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
