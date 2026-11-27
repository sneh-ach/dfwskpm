# Supabase setup (DFWSKPM)

Project: `qmbaqzzldpfdhjtlgoce`  
URL: `https://qmbaqzzldpfdhjtlgoce.supabase.co`

## Already applied (from this repo)

- Tables, RLS policies, signup → profile trigger
- Public `avatars` storage bucket
- Default email templates (`welcome`, `reviewed`, `invoice`, `general`)
- Auth site URL → `https://www.dfwskpm.org` (+ local/Vercel redirects)
- Email autoconfirm enabled (until custom SMTP is set)
- Temple admin user: `dfwskpsh@gmail.com` (role `admin`)
  - One-time password: `web/.env.supabase.admin` (gitignored — change after first login)

## App env

`web/.env.local` has:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` (scripts only — never `VITE_*`)

## Future schema changes

```bash
cd web
npx supabase migration new describe_change
# edit the new file under supabase/migrations/
SUPABASE_YES=1 npx supabase db push --remote --yes
```

Or run a one-off:

```bash
SUPABASE_YES=1 npx supabase db query --remote --file path/to.sql --yes
```

## Security

Rotate the secret key in Supabase if it was shared in chat. Never put secrets in `VITE_*` or frontend code.
