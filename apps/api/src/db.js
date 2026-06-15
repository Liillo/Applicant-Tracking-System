import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';

function getMariaDbConfig() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }

  const url = new URL(process.env.DATABASE_URL);

  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username || 'root'),
    password: decodeURIComponent(url.password || ''),
    database: decodeURIComponent(url.pathname.replace(/^\//, '')),
  };
}

export function createPrismaClient() {
  const adapter = new PrismaMariaDb(getMariaDbConfig());
  return new PrismaClient({ adapter });
}

export const prisma = createPrismaClient();
