import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

function pickJobFields(body = {}, { forCreate = false } = {}) {
  const data = {};

  const scalarFields = [
    'title',
    'location',
    'jobType',
    'experienceLevel',
    'salaryMin',
    'salaryMax',
    'salaryCurrency',
    'salaryPeriod',
    'description',
    'responsibilities',
    'requirements',
    'benefits',
    'skillsRequired',
    'status',
    'slots',
    'deadline',
  ];

  for (const key of scalarFields) {
    if (body[key] !== undefined) data[key] = body[key];
  }

  if (body.departmentId !== undefined) {
    data.department = body.departmentId
      ? { connect: { id: body.departmentId } }
      : { disconnect: true };
  }

  if (forCreate) {
    // For create, department is required by schema.
    if (!data.department) return { error: 'departmentId is required' };
  }

  return { data };
}

// GET /api/jobs - public, with filters
router.get('/', async (req, res) => {
  const { status, departmentId, type, level, search } = req.query;
  const where = {};
  if (status) where.status = status;
  if (departmentId) where.departmentId = departmentId;
  if (type) where.jobType = type;
  if (level) where.experienceLevel = level;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { skillsRequired: { contains: search } },
    ];
  }

  const jobs = await prisma.job.findMany({
    where,
    include: { department: true, _count: { select: { applications: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(jobs);
});

// GET /api/jobs/overview - public aggregate metrics
router.get('/overview', async (_req, res) => {
  try {
    const [totalOpenJobs, totalApplications, distinctApplicants, positiveOutcomes] = await Promise.all([
      prisma.job.count({ where: { status: 'Open' } }),
      prisma.application.count(),
      prisma.application.findMany({
        distinct: ['applicantId'],
        select: { applicantId: true },
      }),
      prisma.application.count({ where: { status: { in: ['Hired', 'Offer Extended', 'Interviewed'] } } }),
    ]);

    const totalApplicants = distinctApplicants.length;
    const satisfactionRate = totalApplications > 0
      ? Math.max(0, Math.min(100, Math.round((positiveOutcomes / totalApplications) * 100)))
      : 0;

    res.json({
      totalOpenJobs,
      totalApplicants,
      totalApplications,
      satisfactionRate,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to load overview metrics' });
  }
});

// GET /api/jobs/:id - public
router.get('/:id', async (req, res) => {
  const job = await prisma.job.findUnique({
    where: { id: req.params.id },
    include: { department: true, _count: { select: { applications: true } } },
  });
  if (!job) return res.status(404).json({ error: 'Job not found' });

  // Increment views
  await prisma.job.update({ where: { id: job.id }, data: { views: job.views + 1 } });
  res.json(job);
});

// POST /api/jobs - admin only
router.post('/', requireAdmin, async (req, res) => {
  const { data, error } = pickJobFields(req.body, { forCreate: true });
  if (error) return res.status(400).json({ error });

  const job = await prisma.job.create({
    data: { ...data, createdBy: req.user.id },
    include: { department: true },
  });
  res.json(job);
});

// PATCH /api/jobs/:id - admin only
router.patch('/:id', requireAdmin, async (req, res) => {
  const { data } = pickJobFields(req.body);

  const job = await prisma.job.update({
    where: { id: req.params.id },
    data,
    include: { department: true },
  });
  res.json(job);
});

// DELETE /api/jobs/:id - admin only
router.delete('/:id', requireAdmin, async (req, res) => {
  await prisma.job.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
