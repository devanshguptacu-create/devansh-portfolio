# Devansh Gupta - Developer Portfolio

React + Vite + Supabase (Auth, Postgres with Row Level Security, Storage). Dark minimalist portfolio with a role-based admin dashboard.

## Run locally
1. `npm install`
2. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (the public anon/publishable key only; never use a service-role key).
3. `npm run dev` and open the printed link (include `/devansh-portfolio/`).

## Supabase setup
1. Run `supabase/schema.sql` in the SQL Editor (once), then: `alter table public.projects add column if not exists category text not null default 'Other Projects';`
2. Authentication > URL Configuration: set the Site URL and add Redirect URLs for your live site (`https://your-site/**`) and `http://localhost:5173/**`.
3. First admin: register on the site, then in the SQL Editor run `update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'YOUR_EMAIL');`. The API cannot grant admin.

## Deploy
- **Vercel:** import the repo, set `VITE_BASE=/` plus the two Supabase variables, deploy.
- **GitHub Pages:** add the two variables as repository Secrets, set Settings > Pages > Source to GitHub Actions. The base path defaults to `/devansh-portfolio/`.

## Updating content
- Projects, skills, certifications, messages, social links and hero text: admin dashboard (`/#/dashboard` after signing in as admin).
- Defaults and fallback content: `src/data/content.js` and `src/data/social.js`.
- Resume: replace `public/resume.pdf`. Photo: replace `public/photo.jpg`.

## Security notes
All permissions are enforced by Row Level Security in Postgres, not by hiding buttons. Never commit `.env.local`.