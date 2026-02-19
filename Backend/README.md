# Complaint Backend (Supabase + Express)

This backend is a minimal Express + TypeScript service that uses Supabase as the data store. It implements user signup and login (email/password) for the frontend to consume. Passwords are hashed on the server and JWTs are issued.

Quick start

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:

```bash
cd Backend
npm install
```

3. Run in development:

```bash
npm run dev
```

Supabase table schema (SQL) - create a simple `users` table:

```sql
create table public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  department text,
  role text,
  password_hash text not null,
  created_at timestamptz default now()
);

-- Complaints table
create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null,
  status text not null default 'open',
  priority text,
  raised_by uuid references public.users(id),
  assigned_to uuid references public.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz
);
```

Notes
- This is a simple starting point. When you connect Supabase, make sure the database role used by the server has permission to insert/select on `users`.
- When migrating to production you may choose to use Supabase Auth instead of custom auth; this demo stores users manually and issues server-signed JWTs.
