# HireSphere
HireSphere is a full-stack platform that modernizes university placements. It provides a unified workspace for students to track coding practice, optimize resumes, and manage job applications. Built with a monorepo architecture, it empowers students' job hunts while delivering actionable, campus-wide performance analytics to placement coordinators.

## Deployment

### Render (Web Service, Root Directory blank)
- **Build**: `npm install --include=dev && npm run build --workspace=server`
- **Start**: `npm run start --workspace=server`
- **Env vars**:
  - `DATABASE_URL`
  - `JWT_SECRET` (long random string)
  - `FRONTEND_URL` (the Vercel URL, no trailing slash)
  - `NODE_VERSION=22`

### Vercel (Root Directory `apps/web`, Vite preset)
- **Env var**: `VITE_API_URL` = the Render URL (no trailing slash)

### Database
Run `npx drizzle-kit push` once from `apps/server` with `DATABASE_URL` set.
