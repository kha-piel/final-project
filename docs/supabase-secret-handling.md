# Supabase Secret Handling

## What to store where

- Store browser-safe values in `web-app/.env.local`:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Store server-only secrets in the repo root `.env` or another ignored local file:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_DB_URL`

Do not put `service_role` keys in frontend code, checked-in config, or any `VITE_*` variable.

## Git protection

This repo now includes a local pre-commit hook at `.githooks/pre-commit`.

Install it once:

```powershell
.\scripts\install-git-hooks.ps1
```

The hook blocks commits containing common secret patterns such as:

- `SUPABASE_SERVICE_ROLE_KEY`
- `service_role`
- `postgres://`
- `postgresql://`

## Important

If a secret was pasted into chat, screenshots, or any committed file, rotate it in Supabase after use.
