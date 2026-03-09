import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/',     async (req, res) => {
  const depts = await prisma.department.findMany({
    include: { _count: { select: { jobs: true } } },
    orderBy: { name: 'asc' },
  });
  res.json(depts);
});

router.post('/',    requireAdmin, async (req, res) => {
  const dept = await prisma.department.create({ data: req.body });
  res.json(dept);
});

router.patch('/:id', requireAdmin, async (req, res) => {
  const dept = await prisma.department.update({ where: { id: req.params.id }, data: req.body });
  res.json(dept);
});

router.delete('/:id', requireAdmin, async (req, res) => {
  await prisma.department.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;