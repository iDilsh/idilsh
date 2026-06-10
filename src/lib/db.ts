import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL || ''

  // If using Turso/LibSQL (cloud), use the adapter
  if (databaseUrl.startsWith('libsql://')) {
    // Use dynamic require to avoid bundling issues with Turbopack
    // These modules are only needed on Vercel/cloud deployments
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSql } = require('@prisma/adapter-libsql')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@libsql/client')

    const libsql = createClient({
      url: databaseUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN || '',
    })
    const adapter = new PrismaLibSql(libsql)
    return new PrismaClient({ adapter, log: ['error'] })
  }

  // Local development - use regular PrismaClient with SQLite
  return new PrismaClient({ log: ['error'] })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
