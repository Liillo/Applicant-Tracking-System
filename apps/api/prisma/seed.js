import { createPrismaClient } from '../src/db.js';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const prisma = createPrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@hrmpeb.com' },
    update: {},
    create: {
      email: 'admin@hrmpeb.com',
      passwordHash: await bcrypt.hash('admin123', 12),
      role: 'admin',
    },
  });

  await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      passwordHash: await bcrypt.hash('jane123', 12),
      role: 'applicant',
      profile: { create: { firstName: 'Jane', lastName: 'Wanjiku', city: 'Nairobi', country: 'Kenya' } },
    },
  });

  const depts = ['Engineering','Design','Finance','HR','Marketing','Operations'];
  for (const name of depts) {
    await prisma.department.upsert({ where: { name }, update: {}, create: { name } });
  }

  console.log('✅ Database seeded');
}

main().catch(console.error).finally(() => prisma.$disconnect());
