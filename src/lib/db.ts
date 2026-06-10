import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Local development - use regular PrismaClient with SQLite
  // For Vercel deployment with Turso, see the instructions in .env.example
  return new PrismaClient({
    log: ['error'],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

/**
 * For Vercel deployment with Turso/LibSQL, replace the createPrismaClient
 * function above with:
 *
 * import { PrismaLibSql } from '@prisma/adapter-libsql'
 * import { createClient } from '@libsql/client'
 *
 * function createPrismaClient() {
 *   const libsql = createClient({
 *     url: process.env.DATABASE_URL!,
 *     authToken: process.env.DATABASE_AUTH_TOKEN || '',
 *   })
 *   const adapter = new PrismaLibSql(libsql)
 *   return new PrismaClient({ adapter, log: ['error'] })
 * }
 *
 * And set these env vars in Vercel:
 *   DATABASE_URL=libsql://your-db.turso.io
 *   DATABASE_AUTH_TOKEN=your-auth-token
 */
