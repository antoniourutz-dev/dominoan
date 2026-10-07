# Dominoan

Daily Basque synonym domino game for classroom use. The application uses React,
Vite and Supabase authentication/storage.

## Local development

Requirements: Node.js 22 and npm.

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Run `npm install`.
4. Run `npm run dev`.

Use `npm run check` before proposing a release. The command validates TypeScript,
the curriculum tests and the production bundle.

## Database

Apply migrations from `supabase/migrations` to a staging project before production.
Teacher roles must be assigned administratively in `public.profiles`; public sign-up
always creates a student.

See `docs/PRODUCTION_READINESS.md` for the release gate and operating rules.
