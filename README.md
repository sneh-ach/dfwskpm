# DFW Shree Krishna Pranami Mandir

React web app for the temple — public site, household portal, and temple dashboard.

## Run locally

```bash
cd web
npm install
npm run dev
```

Open **http://localhost:5173**

## What’s included

- **Public:** Home, About, Events, Calendar, News, Sermons, Donate, Contact
- **Households:** Signup, login, family portal (photo, address, invoices, requests)
- **Admin:** Member lookup, households, billing, email templates, inbox, website CMS, staff access

## Accounts

- Families register at `/signup`
- Temple staff use `/login` → `/admin`
- Local bootstrap admin: see `web/README.md` (replace with Supabase auth when you connect it)

Hard-refresh the browser once after pulling so old demo data in localStorage is cleared.

Legacy static HTML is in `legacy/`.
