---
Task ID: 1
Agent: main
Task: Fix Vercel deployment issues - database and client-side error handling

Work Log:
- Diagnosed the "Application error: a client-side exception has occurred" issue on Vercel
- Root cause: Prisma + SQLite doesn't work on Vercel's serverless environment (no persistent filesystem)
- API routes returned error objects `{error: "Failed to fetch blog posts"}` instead of arrays
- Client-side code crashed when trying to use `.map()` on the error object
- Fixed `src/lib/db.ts` to auto-detect Turso LibSQL vs local SQLite based on DATABASE_URL
- Fixed client-side error handling in BlogPage.tsx and VideosPage.tsx (check `res.ok` and `Array.isArray(data)`)
- Fixed PrismaLibSql export name (was PrismaLibSQL, correct is PrismaLibSql)
- Used dynamic `require()` in db.ts to avoid Turbopack bundling issues
- Created `scripts/setup-turso.ts` for creating schema and seeding Turso database
- Configured .env with user's Turso credentials
- Successfully pushed schema and seeded data to Turso (6 blog posts, 6 videos)
- Verified API routes return correct data from Turso
- Main page, blog API, and videos API all working

Stage Summary:
- App now works with both local SQLite and Turso LibSQL
- On Vercel, DATABASE_URL must start with `libsql://` and DATABASE_AUTH_TOKEN must be set
- Client-side components handle API errors gracefully without crashing
- Turso database has 6 blog posts and 6 videos seeded
- All API routes verified working with Turso connection
