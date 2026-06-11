---
Task ID: 1
Agent: main
Task: Fix blog posts/videos not loading and publish functionality

Work Log:
- Investigated the full project structure (Next.js 16, Prisma/SQLite, shadcn/ui)
- Tested all API endpoints directly - confirmed they return correct data
- Used Agent Browser to test the site - blog posts and videos were loading correctly
- Identified that the Sinhala blog post was accidentally unpublished during earlier testing
- Found cross-origin warning in dev log from preview panel (space-z.ai)
- Added `.space-z.ai` and `http://81.localhost` to `allowedDevOrigins` in next.config.ts
- Improved BlogPage.tsx: added error state with retry button, better async fetch handling
- Improved VideosPage.tsx: added error state with retry button, better async fetch handling
- Re-published the accidentally unpublished Sinhala blog post
- Cleaned up test blog posts
- Tested full workflow: blog listing, blog detail, videos listing, cpanel CRUD, publish toggle
- All features verified working via Agent Browser testing
- No browser errors, all API endpoints returning 200

Stage Summary:
- Blog posts now load correctly (6 posts including Sinhala content)
- Videos load correctly (6 videos with YouTube embeds)
- CPanel publish functionality works (create, edit, publish/unpublish, delete)
- Added error states with retry buttons to BlogPage and VideosPage
- Added preview origin to allowedDevOrigins for better dev experience
- Dev server running cleanly with no errors
