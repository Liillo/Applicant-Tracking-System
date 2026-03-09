import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// POST /api/applications — authenticated applicant
router.post('/', requireAuth, async (req, res) => {
  const { jobId, coverLetter, expectedSalary, availableStartDate,
          cvFileName, workExperiences=[], educations=[],
          skills=[], certifications=[], languages=[] } = req.body;

  const existing = await prisma.application.findUnique({
    where: { jobId_applicantId: { jobId, applicantId: req.user.id } },
  });
  if (existing) return res.status(409).json({ error: 'Already applied for this job' });

  const app = await prisma.application.create({
    data: {
      jobId, applicantId: req.user.id,
      coverLetter, expectedSalary, availableStartDate, cvFileName,
      statusHistory: { create: { status:'Submitted', changedBy:req.user.id, note:'Application submitted' } },
      workExperiences: { create: workExperiences },
      educations:      { create: educations      },
      skills:          { create: skills           },
      certifications:  { create: certifications  },
      languages:       { create: languages        },
    },
    include: { job: true },
  });
  res.json(app);
});

// GET /api/applications/my — applicant's own applications
router.get('/my', requireAuth, async (req, res) => {
  const apps = await prisma.application.findMany({
    where: { applicantId: req.user.id },
    include: {
      job: { include: { department: true } },
      interviews: { orderBy: { scheduledDate: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(apps);
});

// GET /api/applications/my/notifications - applicant notifications
router.get('/my/notifications', requireAuth, async (req, res) => {
  if (req.user.role !== 'applicant') return res.json([]);

  const apps = await prisma.application.findMany({
    where: { applicantId: req.user.id },
    select: {
      id: true,
      jobId: true,
      job: { select: { title: true } },
      statusHistory: {
        where: { changedBy: { not: req.user.id } },
        orderBy: { createdAt: 'desc' },
        select: { id: true, status: true, note: true, createdAt: true },
      },
      notes: {
        where: { isPrivate: false },
        orderBy: { createdAt: 'desc' },
        select: { id: true, note: true, createdAt: true },
      },
    },
  });

  const notifications = [];
  for (const app of apps) {
    for (const h of app.statusHistory) {
      notifications.push({
        id: `status:${h.id}`,
        type: 'status',
        applicationId: app.id,
        jobId: app.jobId,
        jobTitle: app.job?.title || 'Job',
        status: h.status,
        message: h.note || `Application status updated to ${h.status}`,
        createdAt: h.createdAt,
      });
    }
    for (const n of app.notes) {
      notifications.push({
        id: `note:${n.id}`,
        type: 'note',
        applicationId: app.id,
        jobId: app.jobId,
        jobTitle: app.job?.title || 'Job',
        message: n.note,
        createdAt: n.createdAt,
      });
    }
  }

  notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(notifications.slice(0, 50));
});

// GET /api/applications — admin: all applications
router.get('/', requireAdmin, async (req, res) => {
  const { status, jobId } = req.query;
  const where = {};
  if (status) where.status = status;
  if (jobId)  where.jobId  = jobId;

  const apps = await prisma.application.findMany({
    where,
    include: {
      job: true,
      applicant: { include: { profile: true } },
      interviews: true,
      _count: { select: { notes: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(apps);
});

// GET /api/applications/:id — admin or own
router.get('/:id', requireAuth, async (req, res) => {
  const app = await prisma.application.findUnique({
    where: { id: req.params.id },
    include: {
      job: { include: { department: true } },
      applicant: { include: { profile: true } },
      workExperiences: true, educations: true,
      skills: true, certifications: true, languages: true,
      notes:         { orderBy: { createdAt: 'desc' } },
      statusHistory: { orderBy: { createdAt: 'desc' } },
      interviews:    { orderBy: { scheduledDate: 'asc' } },
    },
  });
  if (!app) return res.status(404).json({ error: 'Not found' });
  if (req.user.role !== 'admin' && app.applicantId !== req.user.id)
    return res.status(403).json({ error: 'Forbidden' });
  if (req.user.role !== 'admin') app.notes = (app.notes || []).filter(n => !n.isPrivate);
  res.json(app);
});

// PATCH /api/applications/:id/status — admin
router.patch('/:id/status', requireAdmin, async (req, res) => {
  const { status, note } = req.body;
  const app = await prisma.application.update({
    where: { id: req.params.id },
    data: {
      status,
      statusHistory: { create: { status, changedBy: req.user.id, note } },
    },
  });
  res.json(app);
});

// POST /api/applications/:id/notes — admin
router.post('/:id/notes', requireAdmin, async (req, res) => {
  const isPrivate = req.body.isPrivate !== undefined ? !!req.body.isPrivate : true;
  const note = await prisma.appNote.create({
    data: { applicationId: req.params.id, adminId: req.user.id, note: req.body.note, isPrivate },
  });
  res.json(note);
});

// DELETE /api/applications/:id/notes/:noteId — admin
router.delete('/:id/notes/:noteId', requireAdmin, async (req, res) => {
  await prisma.appNote.delete({ where: { id: req.params.noteId } });
  res.json({ ok: true });
});

// POST /api/applications/:id/interviews — admin
router.post('/:id/interviews', requireAdmin, async (req, res) => {
  const interview = await prisma.interview.create({
    data: { applicationId: req.params.id, scheduledBy: req.user.id, ...req.body },
  });
  await prisma.application.update({
    where: { id: req.params.id },
    data: {
      status: 'Interview Scheduled',
      statusHistory: { create: { status:'Interview Scheduled', changedBy:req.user.id, note:`${req.body.interviewType} interview scheduled` } },
    },
  });
  res.json(interview);
});

// PATCH /api/applications/:id/interviews/:intId — admin
router.patch('/:id/interviews/:intId', requireAdmin, async (req, res) => {
  const interview = await prisma.interview.update({
    where: { id: req.params.intId },
    data: req.body,
  });
  res.json(interview);
});

// PATCH /api/applications/:id/withdraw — applicant
router.patch('/:id/withdraw', requireAuth, async (req, res) => {
  const app = await prisma.application.findUnique({ where: { id: req.params.id } });
  if (!app || app.applicantId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  const updated = await prisma.application.update({
    where: { id: req.params.id },
    data: {
      status: 'Withdrawn',
      statusHistory: { create: { status:'Withdrawn', changedBy:req.user.id, note:'Withdrawn by applicant' } },
    },
  });
  res.json(updated);
});

export default router;
