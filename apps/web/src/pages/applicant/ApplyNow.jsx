/**
 * HRMPEB ATS — Apply Now  (Module 4)
 * Multi-step application wizard:
 *   Step 1 — Personal Information
 *   Step 2 — Work Experience
 *   Step 3 — Education + Languages
 *   Step 4 — Skills + Certifications
 *   Step 5 — Cover Letter + Review & Submit
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

// ─── tiny helpers ────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Personal',   icon: '👤' },
  { id: 2, label: 'Experience', icon: '💼' },
  { id: 3, label: 'Education',  icon: '🎓' },
  { id: 4, label: 'Skills',     icon: '⚡' },
  { id: 5, label: 'Review',     icon: '✅' },
];

const PROFICIENCIES = ['Beginner','Intermediate','Advanced','Expert'];
const LANG_LEVELS   = ['Basic','Conversational','Proficient','Fluent','Native'];
const EMP_TYPES     = ['Full-Time','Part-Time','Contract','Internship','Freelance'];
const DEGREES       = ["Certificate","Diploma","Bachelor's","Master's","PhD","Other"];

function Btn({ children, onClick, variant='primary', size='md', disabled=false, loading=false, fullWidth=false, type='button', style={} }) {
  const base = {
    display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
    fontWeight:700, fontFamily:'inherit', cursor: disabled||loading ? 'not-allowed':'pointer',
    opacity: disabled||loading ? 0.6 : 1, border:'none',
    transition:'all 0.18s', outline:'none',
    width: fullWidth?'100%':'auto',
    ...style,
  };
  const v = {
    primary:  { background:'var(--clr-primary)',  color:'#fff',                  padding: size==='lg'?'13px 32px':'10px 22px', borderRadius:10, fontSize: size==='lg'?15:14, boxShadow:'0 4px 16px rgba(31,60,136,0.22)' },
    gold:     { background:'var(--clr-gold)',     color:'var(--clr-primary)',    padding: size==='lg'?'13px 32px':'10px 22px', borderRadius:10, fontSize: size==='lg'?15:14 },
    ghost:    { background:'transparent',         color:'var(--clr-muted)',      padding: size==='lg'?'13px 32px':'10px 22px', borderRadius:10, fontSize: size==='lg'?15:14, border:'1.5px solid var(--clr-border)' },
    danger:   { background:'var(--clr-red)',      color:'#fff',                  padding:'7px 14px', borderRadius:8, fontSize:13 },
    soft:     { background:'var(--clr-primary-pale)', color:'var(--clr-primary)',padding:'8px 18px', borderRadius:8, fontSize:13, fontWeight:600 },
  }[variant]||{};
  return (
    <button type={type} onClick={onClick} disabled={disabled||loading} style={{...base,...v}}>
      {loading && <span style={{ width:14,height:14,border:'2px solid currentColor',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.7s linear infinite',display:'inline-block' }} />}
      {children}
    </button>
  );
}

function Field({ label, error, required, children, hint }) {
  return (
    <div>
      {label && <label style={{ display:'block',fontSize:13,fontWeight:600,color: error?'var(--clr-red)':'var(--clr-text-soft)',marginBottom:6 }}>{label}{required && <span style={{ color:'var(--clr-red)',marginLeft:3 }}>*</span>}</label>}
      {children}
      {(error||hint) && <p style={{ marginTop:5,fontSize:12,color:error?'var(--clr-red)':'var(--clr-muted)' }}>{error||hint}</p>}
    </div>
  );
}

const inputStyle = (err) => ({
  width:'100%', padding:'11px 14px',
  border:`1.5px solid ${err?'var(--clr-red)':'var(--clr-border)'}`,
  borderRadius:10, fontSize:14, fontFamily:'inherit',
  color:'var(--clr-text)', background:'#fff', outline:'none',
  boxSizing:'border-box', transition:'border-color 0.18s',
});

function Inp({ value, onChange, placeholder, type='text', error, style={}, ...rest }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{...inputStyle(error),...style}}
      onFocus={e=>e.target.style.borderColor=error?'var(--clr-red)':'var(--clr-primary)'}
      onBlur={e=>e.target.style.borderColor=error?'var(--clr-red)':'var(--clr-border)'}
      {...rest}
    />
  );
}

function Sel({ value, onChange, options, placeholder, error }) {
  return (
    <select value={value} onChange={onChange}
      style={{...inputStyle(error), cursor:'pointer'}}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o=> typeof o==='string'
        ? <option key={o} value={o}>{o}</option>
        : <option key={o.value} value={o.value}>{o.label}</option>
      )}
    </select>
  );
}

// ─── Step Progress Bar ───────────────────────────────────────────────────────

function StepBar({ current }) {
  const activeIdx = STEPS.findIndex(s => s.id === current);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:32 }}>
      {STEPS.map((s, i) => {
        const done    = i < activeIdx;
        const active  = i === activeIdx;
        return (
          <React.Fragment key={s.id}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', position:'relative', flex: i>0&&i<STEPS.length-1?1:'unset' }}>
              <div style={{
                width:38, height:38, borderRadius:'50%', flexShrink:0,
                background: done?'var(--clr-green)' : active?'var(--clr-primary)':'var(--clr-border)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize: done?14:16,
                color: done||active?'#fff':'var(--clr-muted)',
                fontWeight:800,
                transition:'all 0.3s',
                boxShadow: active?'0 4px 16px rgba(31,60,136,0.3)':'none',
              }}>
                {done ? '✓' : s.icon}
              </div>
              <span style={{ fontSize:11, fontWeight:600, marginTop:5, color: active?'var(--clr-primary)': done?'var(--clr-green)':'var(--clr-muted)', whiteSpace:'nowrap' }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length-1 && (
              <div style={{ flex:1, height:2, background: i<activeIdx?'var(--clr-green)':'var(--clr-border)', margin:'0 4px', marginBottom:20, transition:'background 0.4s', minWidth:16 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Step 0: Choose Method ──────────────────────────────────────────────────

function Step0({ job, onChoice }) {
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file || file.type !== 'application/pdf') { toast.error('Please upload a PDF file.'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('File must be under 10MB.'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      // We store the base64 + filename; actual parsing is text-extraction from ArrayBuffer
      const ab = e.target.result;
      extractTextFromPDF(ab, file.name).then(parsed => onChoice('cv', file.name, parsed));
    };
    reader.readAsArrayBuffer(file);
  };

  const extractTextFromPDF = async (arrayBuffer, filename) => {
    // Simple heuristic text extraction from PDF bytes
    try {
      const bytes = new Uint8Array(arrayBuffer);
      let text = '';
      for (let i = 0; i < bytes.length - 1; i++) {
        const c = bytes[i];
        if (c >= 32 && c < 127) text += String.fromCharCode(c);
        else if (c === 10 || c === 13) text += ' ';
      }
      // Extract common fields
      const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const phoneMatch = text.match(/(\+?254|0)[7-9]\d{8}/);
      const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9-]+/i);
      return {
        rawText: text.slice(0, 5000),
        email: emailMatch?.[0] || '',
        phone: phoneMatch?.[0] || '',
        linkedinUrl: linkedinMatch ? 'https://' + linkedinMatch[0] : '',
        filename,
      };
    } catch { return { rawText:'', email:'', phone:'', linkedinUrl:'', filename }; }
  };

  return (
    <div style={{ animation:'fadeIn 0.35s ease' }}>
      <div style={{ textAlign:'center', marginBottom:32 }}>
        <div style={{ fontSize:44, marginBottom:12 }}>📂</div>
        <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:24, color:'var(--clr-primary)', marginBottom:8 }}>How would you like to apply?</h2>
        <p style={{ color:'var(--clr-muted)', fontSize:15, lineHeight:1.6 }}>Fill in the form manually.</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 }}>

        {/* Manual */}
        <div onClick={()=>onChoice('manual')} style={{ border:'2px dashed var(--clr-border)', borderRadius:16, padding:32, textAlign:'center', cursor:'pointer', background:'#fff', transition:'all 0.2s' }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--clr-green)';e.currentTarget.style.background='var(--clr-green-pale)';}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--clr-border)';e.currentTarget.style.background='#fff';}}>
          <div style={{ fontSize:40, marginBottom:12 }}>✏️</div>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:17, color:'var(--clr-text)', marginBottom:8 }}>Fill Manually</div>
          <p style={{ fontSize:13, color:'var(--clr-muted)', lineHeight:1.6, marginBottom:14 }}>Complete all fields step by step at your own pace.</p>
          <span style={{ background:'var(--clr-green)', color:'#fff', padding:'8px 20px', borderRadius:8, fontSize:13, fontWeight:700 }}>Start Form →</span>
          <div style={{ marginTop:12, fontSize:11, color:'var(--clr-muted)' }}>~5 minutes to complete</div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Personal Information ───────────────────────────────────────────

function Step1({ data, onChange, errors }) {
  const s = (k,v) => onChange({ ...data, [k]:v });
  return (
    <div style={{ animation:'fadeIn 0.35s ease' }}>
      <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:20, color:'var(--clr-primary)', marginBottom:20 }}>Personal Information</h3>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Field label="First Name" required error={errors.firstName}><Inp value={data.firstName} onChange={e=>s('firstName',e.target.value)} placeholder="Enter your first name" error={errors.firstName} /></Field>
          <Field label="Last Name"  required error={errors.lastName}><Inp value={data.lastName}  onChange={e=>s('lastName',e.target.value)}  placeholder="Enter your last name" error={errors.lastName} /></Field>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Field label="Email Address" required error={errors.email}><Inp type="email" value={data.email} onChange={e=>s('email',e.target.value)} placeholder="name@example.com" error={errors.email} /></Field>
          <Field label="Phone Number" required error={errors.phone}><Inp type="tel" value={data.phone} onChange={e=>s('phone',e.target.value)} placeholder="Include country code e.g. +254..." error={errors.phone} /></Field>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
          <Field label="Date of Birth"><Inp type="date" value={data.dateOfBirth} onChange={e=>s('dateOfBirth',e.target.value)} /></Field>
          <Field label="Gender">
            <Sel value={data.gender} onChange={e=>s('gender',e.target.value)} placeholder="Select gender" options={['Male','Female','Non-binary','Prefer not to say']} />
          </Field>
          <Field label="Nationality"><Inp value={data.nationality} onChange={e=>s('nationality',e.target.value)} placeholder="Enter your nationality" /></Field>
        </div>
        <Field label="Address"><Inp value={data.address} onChange={e=>s('address',e.target.value)} placeholder="Street address or P.O. Box" /></Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
          <Field label="City" required error={errors.city}><Inp value={data.city} onChange={e=>s('city',e.target.value)} placeholder="Enter your city" error={errors.city} /></Field>
          <Field label="Country" required error={errors.country}><Inp value={data.country} onChange={e=>s('country',e.target.value)} placeholder="Enter your country" error={errors.country} /></Field>
          <Field label="Postal Code"><Inp value={data.postalCode} onChange={e=>s('postalCode',e.target.value)} placeholder="Postal / ZIP code" /></Field>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Field label="LinkedIn URL"><Inp value={data.linkedinUrl} onChange={e=>s('linkedinUrl',e.target.value)} placeholder="Paste your LinkedIn profile link" /></Field>
          <Field label="Portfolio / Website"><Inp value={data.portfolioUrl} onChange={e=>s('portfolioUrl',e.target.value)} placeholder="Paste your portfolio or website link" /></Field>
        </div>
        <Field label="Professional Summary" hint="2–4 sentences about your experience and career goals">
          <textarea value={data.professionalSummary} onChange={e=>s('professionalSummary',e.target.value)}
            placeholder="Write a short professional summary about yourself" rows={4}
            style={{ width:'100%',padding:'11px 14px',border:'1.5px solid var(--clr-border)',borderRadius:10,fontSize:14,fontFamily:'inherit',color:'var(--clr-text)',background:'#fff',outline:'none',resize:'vertical',lineHeight:1.6,boxSizing:'border-box' }}
          />
        </Field>
      </div>
    </div>
  );
}

// ─── Step 2: Work Experience ────────────────────────────────────────────────

function Step2({ data, onChange }) {
  const addExp = () => onChange([...data, { company:'',position:'',location:'',employmentType:'Full-Time',startDate:'',endDate:'',isCurrent:false,description:'' }]);
  const upd = (i,k,v) => { const arr=[...data]; arr[i]={...arr[i],[k]:v}; onChange(arr); };
  const rem = (i) => onChange(data.filter((_,idx)=>idx!==i));

  return (
    <div style={{ animation:'fadeIn 0.35s ease' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:20, color:'var(--clr-primary)' }}>Work Experience</h3>
        <Btn variant="soft" onClick={addExp}>+ Add Position</Btn>
      </div>
      {data.length === 0 && (
        <div style={{ textAlign:'center', padding:'40px 20px', background:'var(--clr-bg)', borderRadius:14, border:'2px dashed var(--clr-border)', marginBottom:16 }}>
          <div style={{ fontSize:36, marginBottom:10 }}>💼</div>
          <p style={{ color:'var(--clr-muted)', fontSize:14 }}>No work experience added yet.<br />Click <strong>+ Add Position</strong> to get started.</p>
        </div>
      )}
      {data.map((exp, i) => (
        <div key={i} style={{ background:'var(--clr-bg)', borderRadius:14, padding:20, marginBottom:14, border:'1px solid var(--clr-border-soft)', position:'relative' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'var(--clr-primary)' }}>Position {i+1}</div>
            {data.length > 0 && <button onClick={()=>rem(i)} style={{ background:'var(--clr-red-pale)',border:'none',color:'var(--clr-red)',padding:'5px 12px',borderRadius:7,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }}>Remove</button>}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Field label="Company / Organisation" required><Inp value={exp.company} onChange={e=>upd(i,'company',e.target.value)} placeholder="Enter company/organization name" /></Field>
              <Field label="Job Title / Position" required><Inp value={exp.position} onChange={e=>upd(i,'position',e.target.value)} placeholder="Enter your job title" /></Field>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Field label="Location"><Inp value={exp.location} onChange={e=>upd(i,'location',e.target.value)} placeholder="City, Country" /></Field>
              <Field label="Employment Type">
                <Sel value={exp.employmentType} onChange={e=>upd(i,'employmentType',e.target.value)} options={EMP_TYPES} />
              </Field>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Field label="Start Date"><Inp type="month" value={exp.startDate} onChange={e=>upd(i,'startDate',e.target.value)} /></Field>
              <Field label="End Date">
                <Inp type="month" value={exp.endDate} onChange={e=>upd(i,'endDate',e.target.value)} disabled={exp.isCurrent} style={{ opacity:exp.isCurrent?0.5:1 }} />
              </Field>
            </div>
            <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, color:'var(--clr-text-soft)', fontWeight:600 }}>
              <input type="checkbox" checked={exp.isCurrent} onChange={e=>upd(i,'isCurrent',e.target.checked)} style={{ width:15,height:15,accentColor:'var(--clr-primary)' }} />
              I currently work here
            </label>
            <Field label="Description / Key Achievements">
              <textarea value={exp.description} onChange={e=>upd(i,'description',e.target.value)}
                placeholder="List your key responsibilities and achievements" rows={3}
                style={{ width:'100%',padding:'11px 14px',border:'1.5px solid var(--clr-border)',borderRadius:10,fontSize:14,fontFamily:'inherit',resize:'vertical',lineHeight:1.6,boxSizing:'border-box',color:'var(--clr-text)',background:'#fff',outline:'none' }}
              />
            </Field>
          </div>
        </div>
      ))}
      <Btn variant="ghost" onClick={addExp} fullWidth>+ Add Another Position</Btn>
    </div>
  );
}

// ─── Step 3: Education + Languages ─────────────────────────────────────────

function Step3({ education, languages, onEdu, onLang }) {
  const addEdu  = () => onEdu([...education, { institution:'',degree:'',fieldOfStudy:'',startDate:'',endDate:'',gpa:'',honors:'' }]);
  const updEdu  = (i,k,v) => { const a=[...education]; a[i]={...a[i],[k]:v}; onEdu(a); };
  const remEdu  = (i) => onEdu(education.filter((_,j)=>j!==i));
  const addLang = () => onLang([...languages, { language:'',proficiency:'Conversational' }]);
  const updLang = (i,k,v) => { const a=[...languages]; a[i]={...a[i],[k]:v}; onLang(a); };
  const remLang = (i) => onLang(languages.filter((_,j)=>j!==i));

  return (
    <div style={{ animation:'fadeIn 0.35s ease' }}>
      {/* Education */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:20, color:'var(--clr-primary)' }}>Education</h3>
        <Btn variant="soft" onClick={addEdu}>+ Add Education</Btn>
      </div>
      {education.length === 0 && (
        <div style={{ textAlign:'center', padding:'32px 20px', background:'var(--clr-bg)', borderRadius:14, border:'2px dashed var(--clr-border)', marginBottom:16 }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🎓</div>
          <p style={{ color:'var(--clr-muted)', fontSize:14 }}>No education records added yet.</p>
        </div>
      )}
      {education.map((edu, i) => (
        <div key={i} style={{ background:'var(--clr-bg)', borderRadius:14, padding:20, marginBottom:14, border:'1px solid var(--clr-border-soft)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'var(--clr-primary)' }}>Education {i+1}</div>
            <button onClick={()=>remEdu(i)} style={{ background:'var(--clr-red-pale)',border:'none',color:'var(--clr-red)',padding:'5px 12px',borderRadius:7,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }}>Remove</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Field label="Institution" required><Inp value={edu.institution} onChange={e=>updEdu(i,'institution',e.target.value)} placeholder="Enter institution name" /></Field>
              <Field label="Degree">
                <Sel value={edu.degree} onChange={e=>updEdu(i,'degree',e.target.value)} placeholder="Select degree" options={DEGREES} />
              </Field>
            </div>
            <Field label="Field of Study"><Inp value={edu.fieldOfStudy} onChange={e=>updEdu(i,'fieldOfStudy',e.target.value)} placeholder="Enter your field of study" /></Field>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
              <Field label="Start Year"><Inp type="month" value={edu.startDate} onChange={e=>updEdu(i,'startDate',e.target.value)} /></Field>
              <Field label="End Year"><Inp type="month" value={edu.endDate} onChange={e=>updEdu(i,'endDate',e.target.value)} /></Field>
              <Field label="GPA / Grade" hint="e.g. 3.8 / 4.0"><Inp value={edu.gpa} onChange={e=>updEdu(i,'gpa',e.target.value)} placeholder="Enter GPA or grade" /></Field>
            </div>
            <Field label="Honors / Awards"><Inp value={edu.honors} onChange={e=>updEdu(i,'honors',e.target.value)} placeholder="List any honors or awards" /></Field>
          </div>
        </div>
      ))}
      <Btn variant="ghost" onClick={addEdu} fullWidth style={{ marginBottom:32 }}>+ Add Education Record</Btn>

      {/* Languages */}
      <div style={{ borderTop:'2px solid var(--clr-border-soft)', paddingTop:28, marginTop:8 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:18, color:'var(--clr-primary)' }}>Languages</h3>
          <Btn variant="soft" onClick={addLang}>+ Add Language</Btn>
        </div>
        {languages.length === 0 && (
          <div style={{ textAlign:'center', padding:'24px', background:'var(--clr-bg)', borderRadius:12, border:'2px dashed var(--clr-border)', marginBottom:12 }}>
            <p style={{ color:'var(--clr-muted)', fontSize:14 }}>No languages added. Add at least one.</p>
          </div>
        )}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
          {languages.map((l, i) => (
            <div key={i} style={{ background:'var(--clr-bg)', borderRadius:12, padding:16, border:'1px solid var(--clr-border-soft)', display:'flex', gap:10 }}>
              <div style={{ flex:1 }}>
                <Inp value={l.language} onChange={e=>updLang(i,'language',e.target.value)} placeholder="Enter a language" style={{ marginBottom:8 }} />
                <Sel value={l.proficiency} onChange={e=>updLang(i,'proficiency',e.target.value)} options={LANG_LEVELS} />
              </div>
              <button onClick={()=>remLang(i)} style={{ alignSelf:'flex-start',background:'var(--clr-red-pale)',border:'none',color:'var(--clr-red)',padding:'6px 10px',borderRadius:7,fontSize:13,cursor:'pointer',fontFamily:'inherit' }}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Skills + Certifications ───────────────────────────────────────

function Step4({ skills, certs, onSkills, onCerts }) {
  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skills.find(s=>s.skillName.toLowerCase()===trimmed.toLowerCase())) { toast.error('Skill already added'); return; }
    onSkills([...skills, { skillName:trimmed, proficiency:'Intermediate', yearsOfExperience:1 }]);
    setSkillInput('');
  };
  const updSkill = (i,k,v) => { const a=[...skills]; a[i]={...a[i],[k]:v}; onSkills(a); };
  const remSkill = (i) => onSkills(skills.filter((_,j)=>j!==i));

  const addCert = () => onCerts([...certs, { certName:'',issuingOrg:'',issueDate:'',expiryDate:'',credentialId:'',credentialUrl:'' }]);
  const updCert = (i,k,v) => { const a=[...certs]; a[i]={...a[i],[k]:v}; onCerts(a); };
  const remCert = (i) => onCerts(certs.filter((_,j)=>j!==i));

  const SUGGESTED = ['Microsoft Office','Google Workspace','Project Management','Data Analysis','Communication','Leadership','Python','SQL','JavaScript','React','Figma','Photoshop','AutoCAD','SPSS','Tableau'];

  return (
    <div style={{ animation:'fadeIn 0.35s ease' }}>
      {/* Skills */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:20, color:'var(--clr-primary)' }}>Skills</h3>
        <span style={{ fontSize:12, color:'var(--clr-muted)' }}>{skills.length} added</span>
      </div>

      {/* Add skill input */}
      <div style={{ display:'flex', gap:10, marginBottom:16 }}>
        <Inp value={skillInput} onChange={e=>setSkillInput(e.target.value)} placeholder="Type a skill then press Add"
          onKeyDown={e=>{ if(e.key==='Enter'){e.preventDefault();addSkill();}}}
          style={{ flex:1 }}
        />
        <Btn onClick={addSkill} variant="primary">Add</Btn>
      </div>

      {/* Suggestions */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:20 }}>
        <span style={{ fontSize:12, color:'var(--clr-muted)', fontWeight:600, alignSelf:'center', marginRight:4 }}>Suggest:</span>
        {SUGGESTED.filter(s=>!skills.find(sk=>sk.skillName.toLowerCase()===s.toLowerCase())).slice(0,8).map(s=>(
          <button key={s} onClick={()=>{ onSkills([...skills,{skillName:s,proficiency:'Intermediate',yearsOfExperience:1}]); }}
            style={{ background:'var(--clr-bg)',border:'1px solid var(--clr-border)',borderRadius:'var(--radius-full)',padding:'4px 12px',fontSize:12,fontWeight:600,color:'var(--clr-text-soft)',cursor:'pointer',fontFamily:'inherit',transition:'all 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='var(--clr-primary-pale)';e.currentTarget.style.borderColor='var(--clr-primary)';e.currentTarget.style.color='var(--clr-primary)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='var(--clr-bg)';e.currentTarget.style.borderColor='var(--clr-border)';e.currentTarget.style.color='var(--clr-text-soft)';}}>
            + {s}
          </button>
        ))}
      </div>

      {/* Skills list */}
      {skills.length === 0 ? (
        <div style={{ textAlign:'center',padding:'24px',background:'var(--clr-bg)',borderRadius:12,border:'2px dashed var(--clr-border)',marginBottom:20 }}>
          <p style={{ color:'var(--clr-muted)',fontSize:14 }}>Add skills using the input above or tap a suggestion.</p>
        </div>
      ) : (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,marginBottom:24 }}>
          {skills.map((s,i)=>(
            <div key={i} style={{ background:'var(--clr-bg)',borderRadius:10,padding:'12px 14px',border:'1px solid var(--clr-border-soft)',display:'flex',gap:10,alignItems:'center' }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700,fontSize:13,color:'var(--clr-text)',marginBottom:6 }}>{s.skillName}</div>
                <div style={{ display:'flex',gap:8 }}>
                  <select value={s.proficiency} onChange={e=>updSkill(i,'proficiency',e.target.value)}
                    style={{ flex:1,padding:'5px 8px',border:'1px solid var(--clr-border)',borderRadius:7,fontSize:12,fontFamily:'inherit',background:'#fff',outline:'none' }}>
                    {PROFICIENCIES.map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                  <select value={s.yearsOfExperience} onChange={e=>updSkill(i,'yearsOfExperience',Number(e.target.value))}
                    style={{ width:72,padding:'5px 6px',border:'1px solid var(--clr-border)',borderRadius:7,fontSize:12,fontFamily:'inherit',background:'#fff',outline:'none' }}>
                    {[1,2,3,4,5,6,7,8,10,12,15].map(n=><option key={n} value={n}>{n}yr{n>1?'s':''}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={()=>remSkill(i)} style={{ background:'none',border:'none',color:'var(--clr-muted)',cursor:'pointer',fontSize:16,lineHeight:1,padding:4 }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      <div style={{ borderTop:'2px solid var(--clr-border-soft)',paddingTop:28,marginTop:4 }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
          <h3 style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:18,color:'var(--clr-primary)' }}>Certifications</h3>
          <Btn variant="soft" onClick={addCert}>+ Add Certificate</Btn>
        </div>
        {certs.length === 0 && (
          <div style={{ textAlign:'center',padding:'24px',background:'var(--clr-bg)',borderRadius:12,border:'2px dashed var(--clr-border)' }}>
            <p style={{ color:'var(--clr-muted)',fontSize:14 }}>No certifications yet — optional but can strengthen your application.</p>
          </div>
        )}
        {certs.map((c,i)=>(
          <div key={i} style={{ background:'var(--clr-bg)',borderRadius:14,padding:18,marginBottom:12,border:'1px solid var(--clr-border-soft)' }}>
            <div style={{ display:'flex',justifyContent:'space-between',marginBottom:12 }}>
              <div style={{ fontWeight:700,fontSize:13,color:'var(--clr-primary)' }}>Certificate {i+1}</div>
              <button onClick={()=>remCert(i)} style={{ background:'var(--clr-red-pale)',border:'none',color:'var(--clr-red)',padding:'5px 12px',borderRadius:7,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }}>Remove</button>
            </div>
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                <Field label="Certificate Name"><Inp value={c.certName} onChange={e=>updCert(i,'certName',e.target.value)} placeholder="Enter certificate name" /></Field>
                <Field label="Issuing Organisation"><Inp value={c.issuingOrg} onChange={e=>updCert(i,'issuingOrg',e.target.value)} placeholder="Enter issuing organisation" /></Field>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12 }}>
                <Field label="Issue Date"><Inp type="month" value={c.issueDate} onChange={e=>updCert(i,'issueDate',e.target.value)} /></Field>
                <Field label="Expiry Date" hint="Leave blank if no expiry"><Inp type="month" value={c.expiryDate} onChange={e=>updCert(i,'expiryDate',e.target.value)} /></Field>
                <Field label="Credential ID"><Inp value={c.credentialId} onChange={e=>updCert(i,'credentialId',e.target.value)} placeholder="Enter credential ID (optional)" /></Field>
              </div>
              <Field label="Credential URL"><Inp value={c.credentialUrl} onChange={e=>updCert(i,'credentialUrl',e.target.value)} placeholder="Paste verification link (optional)" /></Field>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 5: Cover Letter + Review & Submit ─────────────────────────────────

function Step5({ coverLetter, expectedSalary, startDate, onChange, personal, experience, education, skills, certs, languages, job }) {
  const s = (k,v) => onChange(k,v);

  const ReviewSection = ({ icon, title, count, children }) => (
    <div style={{ background:'var(--clr-bg)',borderRadius:12,padding:16,border:'1px solid var(--clr-border-soft)',marginBottom:12 }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:count>0?12:0 }}>
        <div style={{ fontWeight:700,fontSize:14,color:'var(--clr-text)',display:'flex',gap:8,alignItems:'center' }}>
          <span>{icon}</span>{title}
        </div>
        <span style={{ fontSize:12,fontWeight:700,color:'var(--clr-green)',background:'var(--clr-green-pale)',padding:'2px 10px',borderRadius:'var(--radius-full)' }}>
          {count} item{count!==1?'s':''}
        </span>
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ animation:'fadeIn 0.35s ease' }}>
      <h3 style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:20,color:'var(--clr-primary)',marginBottom:20 }}>Cover Letter & Review</h3>

      {/* Cover letter */}
      <div style={{ marginBottom:20 }}>
        <Field label="Cover Letter" hint="Introduce yourself and explain why you're a great fit for this role">
          <textarea value={coverLetter} onChange={e=>s('coverLetter',e.target.value)}
            placeholder={`Write your cover letter for the ${job?.title || 'role'} here`}
            rows={7}
            style={{ width:'100%',padding:'12px 14px',border:'1.5px solid var(--clr-border)',borderRadius:10,fontSize:14,fontFamily:'inherit',color:'var(--clr-text)',background:'#fff',outline:'none',resize:'vertical',lineHeight:1.7,boxSizing:'border-box' }}
          />
        </Field>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:24 }}>
        <Field label="Expected Salary (KES / month)" hint="Optional — enter your desired monthly salary">
          <Inp type="number" value={expectedSalary} onChange={e=>s('expectedSalary',e.target.value)} placeholder="Enter expected salary (numbers only)" />
        </Field>
        <Field label="Available Start Date">
          <Inp type="date" value={startDate} onChange={e=>s('startDate',e.target.value)} />
        </Field>
      </div>

      {/* Application Summary */}
      <div style={{ borderTop:'2px solid var(--clr-border-soft)',paddingTop:20 }}>
        <div style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:16,color:'var(--clr-primary)',marginBottom:16 }}>📋 Application Summary</div>

        {/* Applying for */}
        <div style={{ background:'linear-gradient(135deg,var(--clr-primary),var(--clr-primary-dark))',borderRadius:12,padding:16,marginBottom:12 }}>
          <div style={{ fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:0.8,marginBottom:4 }}>Applying for</div>
          <div style={{ fontFamily:'var(--font-display)',fontWeight:800,fontSize:18,color:'#fff' }}>{job?.title}</div>
          <div style={{ color:'rgba(255,255,255,0.6)',fontSize:13,marginTop:2 }}>{job?.location}</div>
        </div>

        <ReviewSection icon="👤" title="Personal Info" count={personal.firstName?1:0}>
          {personal.firstName && (
            <div style={{ fontSize:13,color:'var(--clr-text-soft)',lineHeight:1.6 }}>
              <strong>{personal.firstName} {personal.lastName}</strong> · {personal.email} · {personal.phone}
              {personal.city && <span> · {personal.city}, {personal.country}</span>}
            </div>
          )}
        </ReviewSection>

        <ReviewSection icon="💼" title="Work Experience" count={experience.length}>
          {experience.slice(0,2).map((e,i)=>(
            <div key={i} style={{ fontSize:13,color:'var(--clr-text-soft)',marginBottom:4 }}>
              <strong>{e.position}</strong> at {e.company} {e.isCurrent?'(Current)':e.endDate?`(${e.startDate} – ${e.endDate})`:''}
            </div>
          ))}
        </ReviewSection>

        <ReviewSection icon="🎓" title="Education" count={education.length}>
          {education.slice(0,2).map((e,i)=>(
            <div key={i} style={{ fontSize:13,color:'var(--clr-text-soft)',marginBottom:4 }}>
              <strong>{e.degree}</strong> in {e.fieldOfStudy} · {e.institution}
            </div>
          ))}
        </ReviewSection>

        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
          <ReviewSection icon="⚡" title="Skills" count={skills.length}>
            <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
              {skills.slice(0,6).map(s=>(
                <span key={s.skillName} style={{ background:'var(--clr-primary-pale)',color:'var(--clr-primary)',padding:'2px 10px',borderRadius:'var(--radius-full)',fontSize:11,fontWeight:600 }}>{s.skillName}</span>
              ))}
              {skills.length>6 && <span style={{ fontSize:11,color:'var(--clr-muted)' }}>+{skills.length-6} more</span>}
            </div>
          </ReviewSection>
          <ReviewSection icon="🌐" title="Languages" count={languages.length}>
            {languages.map(l=>(
              <div key={l.language} style={{ fontSize:12,color:'var(--clr-text-soft)' }}>{l.language} — {l.proficiency}</div>
            ))}
          </ReviewSection>
        </div>
      </div>

      {/* Confirmation checkbox */}
      <div style={{ background:'var(--clr-gold-pale)',border:'1px solid rgba(244,180,0,0.3)',borderRadius:12,padding:16,marginTop:16 }}>
        <div style={{ display:'flex',gap:10,alignItems:'flex-start' }}>
          <span style={{ fontSize:18 }}>⚠️</span>
          <p style={{ fontSize:13,color:'var(--clr-text-soft)',lineHeight:1.6 }}>
            By submitting, you confirm that all information provided is accurate and complete. False information may disqualify your application.
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// APPLY NOW — Main Component
// ═══════════════════════════════════════════════════════════════════════════

export default function ApplyNow() {
  const { jobId }      = useParams();
  const navigate       = useNavigate();
  const { user, profile, refreshProfile } = useAuth();

  const [job,     setJob]     = useState(null);
  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  // Check if already applied
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  // Form state
  const [personal, setPersonal] = useState({
    firstName:'', lastName:'', email:'', phone:'', dateOfBirth:'',
    gender:'', nationality:'', address:'', city:'', country:'Kenya',
    postalCode:'', linkedinUrl:'', portfolioUrl:'', professionalSummary:'',
  });
  const [experience,  setExperience]  = useState([]);
  const [education,   setEducation]   = useState([]);
  const [skills,      setSkills]      = useState([]);
  const [certs,       setCerts]       = useState([]);
  const [languages,   setLanguages]   = useState([]);
  const [coverLetter, setCoverLetter] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [startDate,   setStartDate]   = useState('');

  // Load job + pre-fill from profile
  useEffect(() => {
    const load = async () => {
      try {
        const j = await api.getJob(jobId);
        if (!j) { toast.error('Job not found'); navigate('/jobs'); return; }
        setJob(j);
        // Check already applied
        const myApps = await api.myApplications();
        const existing = myApps.find(a => a.jobId === jobId);
        if (existing) setAlreadyApplied(true);
      } catch(err) {
        toast.error('Failed to load job');
        navigate('/jobs');
      }
      // Pre-fill from profile
      if (profile) {
        setPersonal(p => ({
          ...p,
          firstName:   profile.firstName  || '',
          lastName:    profile.lastName   || '',
          phone:       profile.phone      || '',
          dateOfBirth: profile.dateOfBirth|| '',
          gender:      profile.gender     || '',
          nationality: profile.nationality|| '',
          address:     profile.address    || '',
          city:        profile.city       || '',
          country:     profile.country    || 'Kenya',
          postalCode:  profile.postalCode || '',
          linkedinUrl:  profile.linkedinUrl  || '',
          portfolioUrl: profile.portfolioUrl || '',
          professionalSummary: profile.professionalSummary || '',
        }));
      }
      if (user?.email) setPersonal(p => ({ ...p, email: user.email }));
    };
    load();
  }, [jobId, user, profile]);
  // Validate step 1
  const validatePersonal = () => {
    const e = {};
    if (!personal.firstName.trim()) e.firstName = 'Required';
    if (!personal.lastName.trim())  e.lastName  = 'Required';
    if (!personal.email)            e.email     = 'Required';
    if (personal.email && !/\S+@\S+\.\S+/.test(personal.email)) e.email = 'Invalid email';
    if (!personal.phone)            e.phone     = 'Required';
    if (!personal.city.trim())      e.city      = 'Required';
    if (!personal.country.trim())   e.country   = 'Required';
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const handleNext = () => {
    if (step===1 && !validatePersonal()) { toast.error('Please fix the errors'); return; }
    setErrors({});
    setStep(s=>s+1);
    window.scrollTo({ top:0, behavior:'smooth' });
  };

  const handleBack = () => { setStep(s=> Math.max(1, s-1)); window.scrollTo({ top:0, behavior:'smooth' }); };

  const handleSubmit = async () => {
    if (!coverLetter.trim()) { toast.error('Please write a cover letter'); return; }
    setLoading(true);
    try {
      // Save/update applicant profile (non-blocking if backend route is unavailable)
      try {
        await api.updateProfile({
          firstName: personal.firstName, lastName: personal.lastName,
          phone: personal.phone, dateOfBirth: personal.dateOfBirth,
          gender: personal.gender, nationality: personal.nationality,
          address: personal.address, city: personal.city,
          country: personal.country, postalCode: personal.postalCode,
          linkedinUrl: personal.linkedinUrl, portfolioUrl: personal.portfolioUrl,
          professionalSummary: personal.professionalSummary,
        });
        refreshProfile();
      } catch (profileErr) {
        const msg = String(profileErr?.message || '');
        if (!msg.includes('Cannot PATCH /api/auth/profile')) throw profileErr;
      }

      // Create application with all sub-records in one API call
      await api.apply({
        jobId,
        coverLetter,
        expectedSalary,
        availableStartDate: startDate,
        workExperiences: experience,
        educations:      education,
        skills,
        certifications:  certs,
        languages,
      });

      toast.success('Application submitted successfully! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (!job) return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--clr-bg)' }}>
      <div style={{ width:40,height:40,border:'3px solid var(--clr-primary)',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite' }} />
    </div>
  );

  if (alreadyApplied) return (
    <div style={{ minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'var(--clr-bg)',padding:32,textAlign:'center' }}>
      <div style={{ fontSize:56,marginBottom:20 }}>✅</div>
      <h2 style={{ fontFamily:'var(--font-display)',fontWeight:800,fontSize:28,color:'var(--clr-primary)',marginBottom:12 }}>Already Applied!</h2>
      <p style={{ color:'var(--clr-muted)',fontSize:15,maxWidth:360,lineHeight:1.7,marginBottom:28 }}>You have already submitted an application for <strong>{job.title}</strong>. Track your progress in your dashboard.</p>
      <div style={{ display:'flex',gap:12 }}>
        <Link to="/dashboard" style={{ padding:'12px 28px',borderRadius:10,background:'var(--clr-primary)',color:'#fff',fontWeight:700,fontSize:14 }}>My Dashboard →</Link>
        <Link to="/jobs" style={{ padding:'12px 28px',borderRadius:10,background:'var(--clr-bg)',border:'1.5px solid var(--clr-border)',color:'var(--clr-text)',fontWeight:700,fontSize:14 }}>Browse More Jobs</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--clr-bg)' }}>

      {/* Top nav strip */}
      <div style={{ background:'var(--clr-primary)',padding:'0 40px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <Link to="/" style={{ display:'flex',alignItems:'center',gap:'clamp(8px, 1.6vw, 14px)',textDecoration:'none' }}>
          <img src="/hrmpeb-logo.png" alt="HRMPEB logo" style={{ width:'clamp(36px, 7vw, 56px)', height:'clamp(36px, 7vw, 56px)', objectFit:'contain', borderRadius:10 }} />
          <span style={{ fontFamily:'var(--font-display)',fontWeight:800,fontSize:'clamp(14px, 2vw, 18px)',color:'#fff',lineHeight:1.1 }}>HRMPEB <span style={{ color:'var(--clr-gold)' }}>ATS</span></span>
        </Link>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          <span style={{ fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:0.8 }}>Applying for</span>
          <span style={{ fontSize:13,fontWeight:700,color:'#fff' }}>{job.title}</span>
          <span style={{ fontSize:11,color:'rgba(255,255,255,0.45)' }}>·</span>
          <span style={{ fontSize:12,color:'rgba(255,255,255,0.55)' }}>{job.location}</span>
        </div>
        <Link to={`/jobs/${jobId}`} style={{ fontSize:13,color:'rgba(255,255,255,0.55)',fontWeight:500,transition:'color 0.15s' }}
          onMouseEnter={e=>e.currentTarget.style.color='#fff'}
          onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.55)'}>
          ← Back to Job
        </Link>
      </div>

      {/* Main form area */}
      <div style={{ width:'100%',margin:0,padding:'36px 40px 80px' }}>

        {/* Progress */}
        <StepBar current={step} />

        {/* Step cards */}
        <div style={{ background:'#fff',borderRadius:'var(--radius-xl)',padding:36,boxShadow:'var(--shadow-lg)',border:'1px solid var(--clr-border-soft)' }}>
          {step===1 && <Step1 data={personal} onChange={setPersonal} errors={errors} />}
          {step===2 && <Step2 data={experience} onChange={setExperience} />}
          {step===3 && <Step3 education={education} languages={languages} onEdu={setEducation} onLang={setLanguages} />}
          {step===4 && <Step4 skills={skills} certs={certs} onSkills={setSkills} onCerts={setCerts} />}
          {step===5 && (
            <Step5
              coverLetter={coverLetter} expectedSalary={expectedSalary} startDate={startDate}
              onChange={(k,v)=>{ if(k==='coverLetter') setCoverLetter(v); else if(k==='expectedSalary') setExpectedSalary(v); else if(k==='startDate') setStartDate(v); }}
              personal={personal} experience={experience} education={education}
              skills={skills} certs={certs} languages={languages}
              job={job}
            />
          )}
        </div>

        {/* Navigation buttons */}
        {step > 0 && (
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:24 }}>
            <Btn variant="ghost" onClick={handleBack} size="lg">← Back</Btn>
            <div style={{ display:'flex',alignItems:'center',gap:6 }}>
              {[1,2,3,4,5].map(n=>(
                <div key={n} style={{ width: n===step?24:8, height:8, borderRadius:4, background: n===step?'var(--clr-primary)': n<step?'var(--clr-green)':'var(--clr-border)', transition:'all 0.3s' }} />
              ))}
            </div>
            {step < 5 ? (
              <Btn variant="primary" onClick={handleNext} size="lg">Next Step →</Btn>
            ) : (
              <Btn variant="gold" onClick={handleSubmit} loading={loading} size="lg">
                {loading ? 'Submitting…' : 'Submit Application 🚀'}
              </Btn>
            )}
          </div>
        )}
      </div>
    </div>
  );
}











