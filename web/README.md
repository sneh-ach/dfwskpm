# DFW Shree Krishna Pranami Mandir — Web App

React site with public pages, household portal, and temple dashboard CMS.

## Run locally

```bash
cd web
npm install
npm run dev
```

Open **http://localhost:5173**

## Supabase

1. Copy `.env.example` → `.env.local` (already set for this project).
2. Run `supabase/schema.sql` in the Supabase SQL Editor (see `supabase/README.md`).
3. Create the first admin user in Supabase Auth, then set `role = 'admin'` on `profiles`.

Household signup/login uses Supabase Auth. Website CMS content still uses local storage until fully migrated.

## Accounts

- Families: `/signup` → `/member`
- Staff: `/login` → `/admin`
