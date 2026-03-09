/**
 * HRMPEB ATS — LocalStorage Database Engine
 * ─────────────────────────────────────────
 * Simulates a relational DB using localStorage.
 * Each "table" is a JSON array stored under its own key.
 *
 * Tables:
 *   ats_users           — all user accounts (applicants + admins)
 *   ats_applicant_profiles — extended profile for applicants
 *   ats_departments     — job departments / divisions
 *   ats_jobs            — job postings
 *   ats_applications    — job applications submitted
 *   ats_work_experience — work history per application
 *   ats_education       — education records per application
 *   ats_skills          — skills per application
 *   ats_certifications  — certs per application
 *   ats_languages       — languages per application
 *   ats_app_notes       — admin notes per application
 *   ats_status_history  — status change log per application
 *   ats_interviews      — scheduled interviews
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Generate a simple unique ID (no external lib needed) */
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** Current ISO timestamp */
export function now() {
  return new Date().toISOString();
}

/** Very simple password "hash" using btoa (not cryptographic — for demo only) */
export function hashPassword(plain) {
  return btoa(unescape(encodeURIComponent(plain + '__hrmpeb_salt_2024')));
}

/** Verify password against stored hash */
export function verifyPassword(plain, hash) {
  return hashPassword(plain) === hash;
}

// ─── Low-level read / write ────────────────────────────────────────────────────

function readTable(table) {
  try {
    const raw = localStorage.getItem(table);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeTable(table, rows) {
  localStorage.setItem(table, JSON.stringify(rows));
}

// ─── Generic CRUD ─────────────────────────────────────────────────────────────

export const db = {
  /** Return all rows */
  all(table) {
    return readTable(table);
  },

  /** Find one row by id */
  findById(table, id) {
    return readTable(table).find(r => r.id === id) || null;
  },

  /** Find rows matching a predicate */
  where(table, predicate) {
    return readTable(table).filter(predicate);
  },

  /** Find first row matching a predicate */
  findWhere(table, predicate) {
    return readTable(table).find(predicate) || null;
  },

  /** Insert a new row — auto-assigns id, createdAt, updatedAt */
  insert(table, data) {
    const rows = readTable(table);
    const row = {
      id: uid(),
      createdAt: now(),
      updatedAt: now(),
      ...data,
    };
    rows.push(row);
    writeTable(table, rows);
    return row;
  },

  /** Update a row by id — merges partial data */
  update(table, id, data) {
    const rows = readTable(table);
    const idx = rows.findIndex(r => r.id === id);
    if (idx === -1) return null;
    rows[idx] = { ...rows[idx], ...data, updatedAt: now() };
    writeTable(table, rows);
    return rows[idx];
  },

  /** Remove a row by id */
  delete(table, id) {
    const rows = readTable(table).filter(r => r.id !== id);
    writeTable(table, rows);
  },

  /** Remove all rows matching predicate */
  deleteWhere(table, predicate) {
    const rows = readTable(table).filter(r => !predicate(r));
    writeTable(table, rows);
  },

  /** Count rows optionally filtered */
  count(table, predicate = null) {
    const rows = readTable(table);
    return predicate ? rows.filter(predicate).length : rows.length;
  },

  /** Wipe a whole table (use with caution) */
  clear(table) {
    writeTable(table, []);
  },
};

// ─── Table Name Constants ──────────────────────────────────────────────────────

export const TABLES = {
  USERS:             'ats_users',
  PROFILES:          'ats_applicant_profiles',
  DEPARTMENTS:       'ats_departments',
  JOBS:              'ats_jobs',
  APPLICATIONS:      'ats_applications',
  WORK_EXP:          'ats_work_experience',
  EDUCATION:         'ats_education',
  SKILLS:            'ats_skills',
  CERTIFICATIONS:    'ats_certifications',
  LANGUAGES:         'ats_languages',
  APP_NOTES:         'ats_app_notes',
  STATUS_HISTORY:    'ats_status_history',
  INTERVIEWS:        'ats_interviews',
  SEEDED:            'ats_seeded_v1',
};

// ─── Domain Helpers ────────────────────────────────────────────────────────────

/** Users */
export const Users = {
  create({ email, password, role = 'applicant', firstName = '', lastName = '' }) {
    if (Users.findByEmail(email)) throw new Error('Email already registered.');
    const user = db.insert(TABLES.USERS, {
      email: email.toLowerCase().trim(),
      passwordHash: hashPassword(password),
      role,          // 'applicant' | 'admin'
      isActive: true,
      lastLogin: null,
    });
    if (role === 'applicant') {
      db.insert(TABLES.PROFILES, {
        userId: user.id,
        firstName,
        lastName,
        phone: '',
        dateOfBirth: '',
        gender: '',
        nationality: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        linkedinUrl: '',
        portfolioUrl: '',
        professionalSummary: '',
        profilePicture: '',
      });
    }
    return user;
  },

  findByEmail(email) {
    return db.findWhere(TABLES.USERS, u => u.email === email.toLowerCase().trim());
  },

  findById(id) {
    return db.findById(TABLES.USERS, id);
  },

  authenticate(email, password) {
    const user = Users.findByEmail(email);
    if (!user || !user.isActive) return null;
    if (!verifyPassword(password, user.passwordHash)) return null;
    db.update(TABLES.USERS, user.id, { lastLogin: now() });
    return user;
  },

  getProfile(userId) {
    return db.findWhere(TABLES.PROFILES, p => p.userId === userId);
  },

  updateProfile(userId, data) {
    const profile = db.findWhere(TABLES.PROFILES, p => p.userId === userId);
    if (!profile) return null;
    return db.update(TABLES.PROFILES, profile.id, data);
  },
};

/** Jobs */
export const Jobs = {
  getAll({ status = null, departmentId = null, type = null, level = null, search = '' } = {}) {
    let rows = db.all(TABLES.JOBS);
    if (status)       rows = rows.filter(j => j.status === status);
    if (departmentId) rows = rows.filter(j => j.departmentId === departmentId);
    if (type)         rows = rows.filter(j => j.jobType === type);
    if (level)        rows = rows.filter(j => j.experienceLevel === level);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        (j.skillsRequired || '').toLowerCase().includes(q)
      );
    }
    return rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getById(id) {
    return db.findById(TABLES.JOBS, id);
  },

  getDepartmentName(job) {
    if (!job?.departmentId) return '—';
    const dept = db.findById(TABLES.DEPARTMENTS, job.departmentId);
    return dept?.name || '—';
  },

  getApplicationCount(jobId) {
    return db.count(TABLES.APPLICATIONS, a => a.jobId === jobId);
  },

  create(data) {
    return db.insert(TABLES.JOBS, {
      status: 'Open',
      views: 0,
      ...data,
    });
  },

  update(id, data) {
    return db.update(TABLES.JOBS, id, data);
  },

  delete(id) {
    // Cascade delete applications and their sub-records
    const apps = db.where(TABLES.APPLICATIONS, a => a.jobId === id);
    apps.forEach(a => Applications.delete(a.id));
    db.delete(TABLES.JOBS, id);
  },

  incrementViews(id) {
    const job = db.findById(TABLES.JOBS, id);
    if (job) db.update(TABLES.JOBS, id, { views: (job.views || 0) + 1 });
  },
};

/** Applications */
export const Applications = {
  create({ jobId, applicantId, coverLetter = '', expectedSalary = '', availableStartDate = '', cvFileName = '' }) {
    const existing = db.findWhere(TABLES.APPLICATIONS,
      a => a.jobId === jobId && a.applicantId === applicantId
    );
    if (existing) throw new Error('You have already applied for this position.');

    const app = db.insert(TABLES.APPLICATIONS, {
      jobId,
      applicantId,
      status: 'Submitted',
      coverLetter,
      expectedSalary,
      availableStartDate,
      cvFileName,
      cvData: null, // base64 encoded PDF content stored here
    });

    // Record initial status history
    StatusHistory.add(app.id, 'Submitted', applicantId, 'Application submitted');
    return app;
  },

  getById(id) {
    return db.findById(TABLES.APPLICATIONS, id);
  },

  getForApplicant(applicantId) {
    return db
      .where(TABLES.APPLICATIONS, a => a.applicantId === applicantId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getForJob(jobId, { status = null } = {}) {
    let rows = db.where(TABLES.APPLICATIONS, a => a.jobId === jobId);
    if (status) rows = rows.filter(a => a.status === status);
    return rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getAll({ status = null, jobId = null } = {}) {
    let rows = db.all(TABLES.APPLICATIONS);
    if (status) rows = rows.filter(a => a.status === status);
    if (jobId)  rows = rows.filter(a => a.jobId === jobId);
    return rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  updateStatus(id, status, changedBy, note = '') {
    db.update(TABLES.APPLICATIONS, id, { status });
    StatusHistory.add(id, status, changedBy, note);
  },

  withdraw(id, applicantId) {
    const app = db.findById(TABLES.APPLICATIONS, id);
    if (!app || app.applicantId !== applicantId) throw new Error('Not found.');
    Applications.updateStatus(id, 'Withdrawn', applicantId, 'Withdrawn by applicant');
  },

  delete(id) {
    db.deleteWhere(TABLES.WORK_EXP,       r => r.applicationId === id);
    db.deleteWhere(TABLES.EDUCATION,      r => r.applicationId === id);
    db.deleteWhere(TABLES.SKILLS,         r => r.applicationId === id);
    db.deleteWhere(TABLES.CERTIFICATIONS, r => r.applicationId === id);
    db.deleteWhere(TABLES.LANGUAGES,      r => r.applicationId === id);
    db.deleteWhere(TABLES.APP_NOTES,      r => r.applicationId === id);
    db.deleteWhere(TABLES.STATUS_HISTORY, r => r.applicationId === id);
    db.deleteWhere(TABLES.INTERVIEWS,     r => r.applicationId === id);
    db.delete(TABLES.APPLICATIONS, id);
  },

  /** Save all sub-records (experience, education, skills, etc.) */
  saveSubRecords(applicationId, applicantId, {
    workExperiences = [],
    educations = [],
    skills = [],
    certifications = [],
    languages = [],
  }) {
    // Clear any old sub-records for this application
    db.deleteWhere(TABLES.WORK_EXP,       r => r.applicationId === applicationId);
    db.deleteWhere(TABLES.EDUCATION,      r => r.applicationId === applicationId);
    db.deleteWhere(TABLES.SKILLS,         r => r.applicationId === applicationId);
    db.deleteWhere(TABLES.CERTIFICATIONS, r => r.applicationId === applicationId);
    db.deleteWhere(TABLES.LANGUAGES,      r => r.applicationId === applicationId);

    workExperiences.forEach(e =>
      db.insert(TABLES.WORK_EXP, { applicationId, applicantId, ...e })
    );
    educations.forEach(e =>
      db.insert(TABLES.EDUCATION, { applicationId, applicantId, ...e })
    );
    skills.forEach(s =>
      db.insert(TABLES.SKILLS, { applicationId, applicantId, ...s })
    );
    certifications.forEach(c =>
      db.insert(TABLES.CERTIFICATIONS, { applicationId, applicantId, ...c })
    );
    languages.forEach(l =>
      db.insert(TABLES.LANGUAGES, { applicationId, applicantId, ...l })
    );
  },

  /** Get all sub-records for an application */
  getFullDetail(id) {
    const app  = db.findById(TABLES.APPLICATIONS, id);
    if (!app) return null;
    return {
      ...app,
      workExperiences: db.where(TABLES.WORK_EXP,       r => r.applicationId === id),
      educations:      db.where(TABLES.EDUCATION,       r => r.applicationId === id),
      skills:          db.where(TABLES.SKILLS,          r => r.applicationId === id),
      certifications:  db.where(TABLES.CERTIFICATIONS,  r => r.applicationId === id),
      languages:       db.where(TABLES.LANGUAGES,       r => r.applicationId === id),
      notes:           db.where(TABLES.APP_NOTES,       r => r.applicationId === id)
                         .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      statusHistory:   db.where(TABLES.STATUS_HISTORY,  r => r.applicationId === id)
                         .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      interviews:      db.where(TABLES.INTERVIEWS,      r => r.applicationId === id)
                         .sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate)),
    };
  },
};

/** Status History */
export const StatusHistory = {
  add(applicationId, status, changedBy, note = '') {
    return db.insert(TABLES.STATUS_HISTORY, { applicationId, status, changedBy, note });
  },
};

/** Admin Notes */
export const AppNotes = {
  add(applicationId, adminId, note, isPrivate = true) {
    return db.insert(TABLES.APP_NOTES, { applicationId, adminId, note, isPrivate });
  },
  getForApp(applicationId) {
    return db.where(TABLES.APP_NOTES, n => n.applicationId === applicationId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
};

/** Interviews */
export const Interviews = {
  schedule(applicationId, scheduledBy, data) {
    const interview = db.insert(TABLES.INTERVIEWS, {
      applicationId,
      scheduledBy,
      outcome: 'Pending',
      ...data,
    });
    Applications.updateStatus(
      applicationId,
      'Interview Scheduled',
      scheduledBy,
      `${data.interviewType} interview scheduled for ${data.scheduledDate}`
    );
    return interview;
  },
  getForApp(applicationId) {
    return db.where(TABLES.INTERVIEWS, i => i.applicationId === applicationId);
  },
};

/** Departments */
export const Departments = {
  getAll() {
    return db.all(TABLES.DEPARTMENTS).sort((a, b) => a.name.localeCompare(b.name));
  },
  create(name, description = '') {
    if (db.findWhere(TABLES.DEPARTMENTS, d => d.name.toLowerCase() === name.toLowerCase())) {
      throw new Error('Department already exists.');
    }
    return db.insert(TABLES.DEPARTMENTS, { name, description });
  },
  getJobCount(id) {
    return db.count(TABLES.JOBS, j => j.departmentId === id);
  },
};

// ─── Analytics Helpers ─────────────────────────────────────────────────────────

export const Analytics = {
  /** Dashboard KPIs */
  getDashboardStats() {
    const allJobs  = db.all(TABLES.JOBS);
    const allApps  = db.all(TABLES.APPLICATIONS);
    const allUsers = db.all(TABLES.USERS);

    const openJobs       = allJobs.filter(j => j.status === 'Open').length;
    const totalApps      = allApps.length;
    const hired          = allApps.filter(a => a.status === 'Hired').length;
    const totalApplicants = allUsers.filter(u => u.role === 'applicant').length;

    // This month
    const thisMonth = new Date();
    thisMonth.setDate(1); thisMonth.setHours(0, 0, 0, 0);
    const thisMonthApps = allApps.filter(a => new Date(a.createdAt) >= thisMonth).length;

    // Status distribution
    const statusCounts = {};
    allApps.forEach(a => {
      statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
    });
    const statusDist = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

    // Monthly trend (last 6 months)
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      const y = d.getFullYear(), m = d.getMonth();
      const count = allApps.filter(a => {
        const ad = new Date(a.createdAt);
        return ad.getFullYear() === y && ad.getMonth() === m;
      }).length;
      months.push({ month: label, count });
    }

    // Top jobs by application count
    const topJobs = allJobs
      .map(j => ({
        title: j.title,
        location: j.location,
        count: db.count(TABLES.APPLICATIONS, a => a.jobId === j.id),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Department breakdown
    const depts = db.all(TABLES.DEPARTMENTS);
    const deptStats = depts.map(d => {
      const jobIds = allJobs.filter(j => j.departmentId === d.id).map(j => j.id);
      const appCount = allApps.filter(a => jobIds.includes(a.jobId)).length;
      return { name: d.name, jobCount: jobIds.length, appCount };
    }).sort((a, b) => b.appCount - a.appCount).slice(0, 6);

    // Recent applications (5 latest)
    const recentApps = allApps
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(a => {
        const user    = db.findById(TABLES.USERS, a.applicantId);
        const profile = db.findWhere(TABLES.PROFILES, p => p.userId === a.applicantId);
        const job     = db.findById(TABLES.JOBS, a.jobId);
        return {
          ...a,
          firstName: profile?.firstName || '',
          lastName:  profile?.lastName  || '',
          email:     user?.email        || '',
          jobTitle:  job?.title         || '—',
        };
      });

    return {
      openJobs,
      totalJobs: allJobs.length,
      totalApps,
      thisMonthApps,
      hired,
      totalApplicants,
      hiringRate: totalApps > 0 ? ((hired / totalApps) * 100).toFixed(1) : '0.0',
      statusDist,
      monthlyTrend: months,
      topJobs,
      deptStats,
      recentApps,
    };
  },
};

// ─── Seed Data ─────────────────────────────────────────────────────────────────

export function seedDatabase() {
  // Only seed once
  if (localStorage.getItem(TABLES.SEEDED)) return;

  // ── Departments ────────────────────────────────────────
  const deptData = [
    { name: 'Human Resources',        description: 'People & Culture team' },
    { name: 'Information Technology', description: 'Software & Infrastructure' },
    { name: 'Finance & Accounting',   description: 'Financial operations' },
    { name: 'Marketing & Comms',      description: 'Brand, Digital & Communications' },
    { name: 'Operations',             description: 'Business operations & logistics' },
    { name: 'Sales & Business Dev',   description: 'Revenue & partnerships' },
    { name: 'Engineering',            description: 'Product engineering' },
    { name: 'Legal & Compliance',     description: 'Legal affairs' },
  ];
  const depts = {};
  deptData.forEach(d => {
    const dept = db.insert(TABLES.DEPARTMENTS, d);
    depts[d.name] = dept.id;
  });

  // ── Admin User ──────────────────────────────────────────
  const admin = db.insert(TABLES.USERS, {
    email: 'admin@hrmpeb.com',
    passwordHash: hashPassword('admin123'),
    role: 'admin',
    isActive: true,
    lastLogin: null,
    firstName: 'System',
    lastName: 'Administrator',
  });

  // ── Sample Applicant ────────────────────────────────────
  const applicant = db.insert(TABLES.USERS, {
    email: 'jane@example.com',
    passwordHash: hashPassword('jane123'),
    role: 'applicant',
    isActive: true,
    lastLogin: null,
  });
  db.insert(TABLES.PROFILES, {
    userId: applicant.id,
    firstName: 'Jane',
    lastName: 'Wanjiku',
    phone: '+254 712 345 678',
    dateOfBirth: '1995-06-15',
    gender: 'Female',
    nationality: 'Kenyan',
    address: '45 Ngong Road',
    city: 'Nairobi',
    state: 'Nairobi County',
    country: 'Kenya',
    postalCode: '00100',
    linkedinUrl: 'https://linkedin.com/in/jane-wanjiku',
    portfolioUrl: '',
    professionalSummary: 'Experienced product designer with 5+ years crafting intuitive digital experiences for fintech and e-commerce platforms.',
    profilePicture: '',
  });

  // ── Jobs ────────────────────────────────────────────────
  const jobsData = [
    {
      title: 'Senior Product Designer',
      departmentId: depts['Information Technology'],
      location: 'Nairobi, Kenya',
      jobType: 'Full-Time',
      experienceLevel: 'Senior',
      salaryMin: 120000,
      salaryMax: 180000,
      salaryCurrency: 'KES',
      salaryPeriod: 'Monthly',
      description: 'We are looking for a talented Senior Product Designer to join our growing team. You will work closely with product managers, engineers, and stakeholders to design intuitive, visually compelling digital experiences that delight our users.',
      responsibilities: 'Lead design projects from concept to launch\nConduct user research and usability testing\nCreate wireframes, prototypes, and high-fidelity designs in Figma\nCollaborate with cross-functional teams\nMentor junior designers and establish design standards\nPresent designs to stakeholders and incorporate feedback',
      requirements: "Bachelor's degree in Design, HCI, or related field\n5+ years of product design experience\nExpert-level proficiency in Figma\nStrong portfolio demonstrating end-to-end product design\nExperience with design systems\nExcellent communication and presentation skills",
      benefits: 'Competitive salary & equity\nHealth insurance (inpatient + outpatient)\nFlexible working hours\nRemote work options\nLearning & development budget\n21 days annual leave',
      skillsRequired: 'Figma,User Research,Prototyping,UX Design,UI Design,Design Systems',
      status: 'Open',
      slots: 2,
      deadline: '2026-04-30',
      createdBy: admin.id,
      views: 142,
    },
    {
      title: 'HR Manager',
      departmentId: depts['Human Resources'],
      location: 'Nairobi, Kenya',
      jobType: 'Full-Time',
      experienceLevel: 'Mid',
      salaryMin: 90000,
      salaryMax: 130000,
      salaryCurrency: 'KES',
      salaryPeriod: 'Monthly',
      description: 'Seeking an experienced HR Manager to oversee all aspects of human resource practices and processes. You will support business needs and ensure the proper implementation of company strategy and objectives.',
      responsibilities: 'Develop and implement HR strategies aligned with business goals\nManage full-cycle recruitment and onboarding\nOversee performance management processes\nHandle employee relations and conflict resolution\nEnsure legal compliance with Kenyan labor law\nMaintain HRIS and HR records',
      requirements: "Bachelor's degree in Human Resources or Business Administration\n4+ years of HR generalist experience\nKnowledge of Kenyan labor laws\nHRCI or SHRM certification preferred\nProficiency in HRIS systems\nStrong interpersonal and negotiation skills",
      benefits: 'Competitive salary\nHealth & life insurance\nPension contribution\nProfessional certification support\n21 days leave',
      skillsRequired: 'Recruitment,HRIS,Performance Management,Employee Relations,Kenyan Labor Law,Conflict Resolution',
      status: 'Open',
      slots: 1,
      deadline: '2026-05-15',
      createdBy: admin.id,
      views: 98,
    },
    {
      title: 'Full-Stack Software Engineer',
      departmentId: depts['Engineering'],
      location: 'Remote (Kenya)',
      jobType: 'Full-Time',
      experienceLevel: 'Mid',
      salaryMin: 100000,
      salaryMax: 160000,
      salaryCurrency: 'KES',
      salaryPeriod: 'Monthly',
      description: 'Join our engineering team to build scalable, high-performance software solutions. You will work on challenging problems across the full technology stack, from React frontends to Node.js APIs and cloud infrastructure.',
      responsibilities: 'Design, develop, and maintain web applications\nWrite clean, testable, and well-documented code\nParticipate in code reviews and technical discussions\nCollaborate with product and design teams\nTroubleshoot production issues and optimize performance\nContribute to architectural decisions',
      requirements: "Bachelor's degree in Computer Science or equivalent\n3+ years of full-stack development experience\nProficiency in React and Node.js\nExperience with SQL and NoSQL databases\nFamiliarity with AWS or GCP\nStrong problem-solving skills",
      benefits: 'Remote-first culture\nTop-tier hardware setup\nHealth insurance\nStock options\nLearning budget\nFlexible hours',
      skillsRequired: 'React,Node.js,JavaScript,TypeScript,PostgreSQL,AWS,REST APIs,Git',
      status: 'Open',
      slots: 3,
      deadline: '2026-06-01',
      createdBy: admin.id,
      views: 217,
    },
    {
      title: 'Digital Marketing Manager',
      departmentId: depts['Marketing & Comms'],
      location: 'Nairobi, Kenya',
      jobType: 'Full-Time',
      experienceLevel: 'Mid',
      salaryMin: 80000,
      salaryMax: 120000,
      salaryCurrency: 'KES',
      salaryPeriod: 'Monthly',
      description: 'We are looking for a creative and data-driven Digital Marketing Manager to lead our online presence and drive growth through targeted digital campaigns.',
      responsibilities: 'Develop and execute digital marketing strategies\nManage SEO, SEM, social media, and email campaigns\nAnalyze performance metrics and optimize ROI\nOversee content calendar and creation\nManage digital marketing budget\nReport to senior leadership on campaign results',
      requirements: "Bachelor's in Marketing or related field\n4+ years in digital marketing\nExperience with Google Analytics, Google Ads, Meta Ads\nStrong copywriting and content strategy skills\nData analysis and reporting experience",
      benefits: 'Competitive salary\nHealth insurance\nFlexible working\nPerformance bonuses\nLearning budget',
      skillsRequired: 'SEO,SEM,Google Analytics,Social Media Marketing,Content Strategy,Google Ads,Meta Ads',
      status: 'Open',
      slots: 1,
      deadline: '2026-04-20',
      createdBy: admin.id,
      views: 76,
    },
    {
      title: 'Finance Analyst',
      departmentId: depts['Finance & Accounting'],
      location: 'Nairobi, Kenya',
      jobType: 'Full-Time',
      experienceLevel: 'Junior',
      salaryMin: 60000,
      salaryMax: 85000,
      salaryCurrency: 'KES',
      salaryPeriod: 'Monthly',
      description: 'Join our Finance team as an Analyst to support budgeting, forecasting, and financial reporting processes.',
      responsibilities: 'Prepare monthly financial reports and dashboards\nSupport budgeting and forecasting cycles\nConduct variance analysis\nMaintain financial models in Excel\nAssist with audits and compliance\nProvide financial insights to management',
      requirements: "Bachelor's in Finance, Accounting, or Economics\nCPA or ACCA certification (Part II minimum)\n1-2 years of finance experience\nAdvanced Excel skills\nStrong attention to detail",
      benefits: 'Competitive salary\nHealth insurance\nCPA study support\nPension contribution',
      skillsRequired: 'Financial Analysis,Excel,Budgeting,Forecasting,IFRS,Financial Modeling',
      status: 'Open',
      slots: 2,
      deadline: '2026-05-30',
      createdBy: admin.id,
      views: 54,
    },
    {
      title: 'Sales Representative',
      departmentId: depts['Sales & Business Dev'],
      location: 'Mombasa, Kenya',
      jobType: 'Full-Time',
      experienceLevel: 'Entry',
      salaryMin: 45000,
      salaryMax: 70000,
      salaryCurrency: 'KES',
      salaryPeriod: 'Monthly',
      description: 'We are growing our sales team and looking for a motivated Sales Representative to drive revenue and build lasting client relationships in the Coastal region.',
      responsibilities: 'Prospect and acquire new clients\nManage existing client accounts\nAchieve monthly sales targets\nPrepare sales proposals and presentations\nReport sales activities and pipeline in CRM\nCollaborate with marketing on campaigns',
      requirements: "Diploma or Bachelor's degree\n1+ year in sales (B2B preferred)\nExcellent communication and negotiation skills\nSelf-motivated with a results-driven mindset\nValid driving license preferred",
      benefits: 'Base salary + commission\nTravel allowance\nHealth insurance\nSales training',
      skillsRequired: 'Sales,CRM,Negotiation,Client Relations,B2B Sales,Prospecting',
      status: 'Open',
      slots: 4,
      deadline: '2026-04-15',
      createdBy: admin.id,
      views: 38,
    },
    {
      title: 'Legal Counsel',
      departmentId: depts['Legal & Compliance'],
      location: 'Nairobi, Kenya',
      jobType: 'Full-Time',
      experienceLevel: 'Senior',
      salaryMin: 180000,
      salaryMax: 250000,
      salaryCurrency: 'KES',
      salaryPeriod: 'Monthly',
      description: 'Seeking an experienced Legal Counsel to manage our legal affairs, ensure regulatory compliance, and provide strategic legal advice to the business.',
      responsibilities: 'Draft, review, and negotiate contracts\nEnsure compliance with Kenyan laws and regulations\nManage litigation and dispute resolution\nAdvise on employment law matters\nCoordinate with external counsel\nConduct legal training for staff',
      requirements: "LLB degree and advocate of the High Court of Kenya\n6+ years of post-admission experience\nExperience in corporate/commercial law\nStrong drafting and negotiation skills\nAttention to detail and analytical mindset",
      benefits: 'Premium salary package\nHealth & life insurance\nPension\nCar allowance\nProfessional association memberships',
      skillsRequired: 'Corporate Law,Contract Drafting,Compliance,Employment Law,Litigation,Legal Research',
      status: 'Closed',
      slots: 1,
      deadline: '2026-03-01',
      createdBy: admin.id,
      views: 29,
    },
    {
      title: 'Operations Coordinator',
      departmentId: depts['Operations'],
      location: 'Nairobi, Kenya',
      jobType: 'Contract',
      experienceLevel: 'Junior',
      salaryMin: 50000,
      salaryMax: 65000,
      salaryCurrency: 'KES',
      salaryPeriod: 'Monthly',
      description: 'We are looking for a detail-oriented Operations Coordinator to support day-to-day operations and improve efficiency across departments.',
      responsibilities: 'Coordinate daily operational activities\nMaintain process documentation\nTrack KPIs and prepare reports\nLiaise between departments\nSupport procurement and vendor management\nIdentify process improvement opportunities',
      requirements: "Bachelor's degree in Business Administration or Operations\n1-2 years in operations\nStrong organizational and multitasking skills\nProficiency in MS Office\nExcellent written and verbal communication",
      benefits: 'Competitive contract rate\nHealth insurance\nTransport allowance\nPerformance review at 6 months',
      skillsRequired: 'Operations Management,Process Improvement,MS Office,Project Coordination,Reporting,Procurement',
      status: 'Open',
      slots: 1,
      deadline: '2026-05-01',
      createdBy: admin.id,
      views: 45,
    },
  ];

  const createdJobs = [];
  jobsData.forEach(j => {
    createdJobs.push(db.insert(TABLES.JOBS, j));
  });

  // ── Sample Application for Jane ──────────────────────────
  const designerJob = createdJobs.find(j => j.title === 'Senior Product Designer');
  if (designerJob) {
    const app = db.insert(TABLES.APPLICATIONS, {
      jobId: designerJob.id,
      applicantId: applicant.id,
      status: 'Shortlisted',
      coverLetter: "I am excited to apply for the Senior Product Designer role at HRMPEB. With over 5 years of experience designing digital products for fintech and e-commerce, I believe I can bring significant value to your team. My expertise in Figma, user research, and design systems aligns perfectly with what you're looking for.",
      expectedSalary: '150000',
      availableStartDate: '2026-04-01',
      cvFileName: '',
    });

    // Sub records
    db.insert(TABLES.WORK_EXP, {
      applicationId: app.id, applicantId: applicant.id,
      company: 'Safaricom PLC', position: 'Product Designer',
      location: 'Nairobi, Kenya', employmentType: 'Full-Time',
      startDate: '2021-03', endDate: '', isCurrent: true,
      description: 'Lead product design for M-PESA consumer apps. Redesigned onboarding flow reducing drop-off by 40%. Built and maintained the M-PESA design system.',
    });
    db.insert(TABLES.WORK_EXP, {
      applicationId: app.id, applicantId: applicant.id,
      company: 'Andela', position: 'UX Designer',
      location: 'Nairobi, Kenya', employmentType: 'Full-Time',
      startDate: '2019-01', endDate: '2021-02', isCurrent: false,
      description: 'Designed interfaces for enterprise clients across Africa and the US. Conducted over 50 user research sessions.',
    });
    db.insert(TABLES.EDUCATION, {
      applicationId: app.id, applicantId: applicant.id,
      institution: 'University of Nairobi', degree: 'Bachelor of Arts',
      fieldOfStudy: 'Fine Art & Design', startDate: '2014-09', endDate: '2018-06',
      gpa: '3.8', honors: "First Class Honours, Dean's List",
    });
    db.insert(TABLES.SKILLS, { applicationId: app.id, applicantId: applicant.id, skillName: 'Figma', proficiency: 'Expert', yearsOfExperience: 5 });
    db.insert(TABLES.SKILLS, { applicationId: app.id, applicantId: applicant.id, skillName: 'User Research', proficiency: 'Expert', yearsOfExperience: 5 });
    db.insert(TABLES.SKILLS, { applicationId: app.id, applicantId: applicant.id, skillName: 'Prototyping', proficiency: 'Advanced', yearsOfExperience: 4 });
    db.insert(TABLES.SKILLS, { applicationId: app.id, applicantId: applicant.id, skillName: 'Design Systems', proficiency: 'Advanced', yearsOfExperience: 3 });
    db.insert(TABLES.LANGUAGES, { applicationId: app.id, applicantId: applicant.id, language: 'English', proficiency: 'Native' });
    db.insert(TABLES.LANGUAGES, { applicationId: app.id, applicantId: applicant.id, language: 'Swahili', proficiency: 'Native' });

    // Status history
    db.insert(TABLES.STATUS_HISTORY, { applicationId: app.id, status: 'Submitted', changedBy: applicant.id, note: 'Application submitted' });
    db.insert(TABLES.STATUS_HISTORY, { applicationId: app.id, status: 'Under Review', changedBy: admin.id, note: 'CV shortlisted for review' });
    db.insert(TABLES.STATUS_HISTORY, { applicationId: app.id, status: 'Shortlisted', changedBy: admin.id, note: 'Strong portfolio match' });

    // Admin note
    db.insert(TABLES.APP_NOTES, {
      applicationId: app.id,
      adminId: admin.id,
      note: 'Excellent portfolio. Has experience with fintech design systems — very relevant to our stack. Recommend proceeding to technical interview.',
      isPrivate: true,
    });

    // Interview
    db.insert(TABLES.INTERVIEWS, {
      applicationId: app.id,
      scheduledBy: admin.id,
      interviewType: 'Video',
      scheduledDate: '2026-03-20T10:00',
      durationMinutes: 60,
      location: '',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      outcome: 'Pending',
      feedback: '',
    });
  }

  // Mark as seeded
  localStorage.setItem(TABLES.SEEDED, '1');
  console.log('[HRMPEB ATS] Database seeded successfully ✓');
}
