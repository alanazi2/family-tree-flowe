# Family Tree Flow (React + Supabase + ReactFlow)

## 1) Create Supabase project
- Create a new Supabase project
- Go to: Project Settings → API
- Copy:
  - Project URL
  - anon public key

## 2) Create tables + RLS
- Open SQL Editor in Supabase
- Run: `supabase/schema.sql`

## 3) Configure env
Create `.env` in project root:

VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

## 4) Run
```bash
npm install
npm run dev
