---
Task ID: 1
Agent: Main
Task: Fix Vercel deployment issues for Pansil Maluwa website

Work Log:
- Analyzed Vercel deployment error screenshot: "No Output Directory named 'dist' found"
- Identified root cause: `output: "standalone"` in next.config.ts changes build output structure
- Removed `output: "standalone"` from next.config.ts
- Fixed build script: changed from `next build && cp -r...` to `prisma generate && next build`
- Added `postinstall: "prisma generate"` script for Vercel build process
- Updated `start` script from standalone server to `next start`
- Installed `@libsql/client` and `@prisma/adapter-libsql` for Vercel-compatible database
- Updated db.ts with LibSQL adapter instructions for Vercel (keeps SQLite for local dev)
- Fixed upload API to use base64 data URLs on Vercel (filesystem is read-only)
- Added vercel.json with framework detection and function config
- Created .env.example with Turso setup instructions
- Updated .gitignore to allow .env.example
- Reduced Prisma logging to avoid verbose output issues
- All routes verified working: /, /cpanel, /api/blog, /api/videos, /api/settings

Stage Summary:
- Vercel deployment error fixed by removing standalone output mode
- Database strategy: SQLite locally, LibSQL/Turso for Vercel production
- File upload strategy: base64 data URLs for Vercel, local file storage for dev
- All API routes and pages return 200 status
- Lint passes with 0 errors (2 minor warnings)
