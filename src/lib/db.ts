import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL || ''

  // If no DATABASE_URL is set, create a basic client (will fail on queries, but won't crash at build time)
  if (!databaseUrl) {
    console.warn('DATABASE_URL is not set. Database operations will fail.')
    return new PrismaClient({ log: ['error'] })
  }

  // If using Turso/LibSQL (cloud), use the adapter
  if (databaseUrl.startsWith('libsql://')) {
    // Use dynamic require to avoid bundling issues with Turbopack
    // These modules are only needed on Vercel/cloud deployments
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSQL } = require('@prisma/adapter-libsql')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@libsql/client')

    const libsql = createClient({
      url: databaseUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN || '',
    })
    const adapter = new PrismaLibSQL(libsql)
    return new PrismaClient({ adapter, log: ['error'] })
  }

  // Local development - use regular PrismaClient with SQLite
  return new PrismaClient({ log: ['error'] })
}

// Use lazy initialization to avoid creating the client during Vercel build
// when environment variables are not yet available
function getDb(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  return globalForPrisma.prisma
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const instance = getDb()
    const value = Reflect.get(instance, prop, receiver)
    if (typeof value === 'function') {
      return value.bind(instance)
    }
    return value
  },
})
