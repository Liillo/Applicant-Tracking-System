import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router  = Router();
const PROFILE_FIELDS = [
  'firstName',
  'lastName',
  'phone',
  'dateOfBirth',
  'gender',
  'nationality',
  'address',
  'city',
  'country',
  'postalCode',
  'linkedinUrl',
  'portfolioUrl',
  'professionalSummary',
];

function makeToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email, passwordHash, role: 'applicant',
      profile: { create: { firstName, lastName } },
    },
  });

  res.json({ token: makeToken(user), user: { id:user.id, email:user.email, role:user.role } });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

  res.json({ token: makeToken(user), user: { id:user.id, email:user.email, role:user.role } });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { profile: true },
  });
  res.json(user);
});

// PATCH /api/auth/profile
router.patch('/profile', requireAuth, async (req, res) => {
  if (req.user.role !== 'applicant') {
    return res.status(403).json({ error: 'Only applicants can update profile' });
  }

  const data = {};
  for (const key of PROFILE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      const val = req.body[key];
      data[key] = val == null ? null : String(val);
    }
  }

  const profile = await prisma.applicantProfile.upsert({
    where: { userId: req.user.id },
    update: data,
    create: { userId: req.user.id, ...data },
  });

  res.json(profile);
});

export default router;


