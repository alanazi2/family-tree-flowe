-- Enable uuid generation
create extension if not exists "pgcrypto";

-- Families
create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists families_owner_id_idx on public.families(owner_id);

-- Persons
create table if not exists public.persons (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  gender text not null check (gender in ('male','female','unknown')),
  birth_date date null,
  created_at timestamptz not null default now()
);

create index if not exists persons_family_id_idx on public.persons(family_id);

-- Relationships
create table if not exists public.relationships (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  parent_id uuid not null references public.persons(id) on delete cascade,
  child_id uuid not null references public.persons(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint relationships_unique unique (family_id, parent_id, child_id),
  constraint relationships_no_self check (parent_id <> child_id)
);

create index if not exists relationships_family_id_idx on public.relationships(family_id);
create index if not exists relationships_parent_id_idx on public.relationships(parent_id);
create index if not exists relationships_child_id_idx on public.relationships(child_id);

-- Ensure relationship is within same family:
-- (ملاحظة: الـ FK ما يضمن "نفس العائلة" تلقائياً، فنضيف trigger)
create or replace function public.ensure_relationship_same_family()
returns trigger
language plpgsql
as $$
declare
  parent_family uuid;
  child_family uuid;
begin
  select family_id into parent_family from public.persons where id = new.parent_id;
  select family_id into child_family from public.persons where id = new.child_id;

  if parent_family is null or child_family is null then
    raise exception 'Parent or child does not exist';
  end if;

  if parent_family <> new.family_id or child_family <> new.family_id then
    raise exception 'Relationship must be within the same family';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_relationship_same_family on public.relationships;
create trigger trg_relationship_same_family
before insert or update on public.relationships
for each row execute function public.ensure_relationship_same_family();

-- RLS
alter table public.families enable row level security;
alter table public.persons enable row level security;
alter table public.relationships enable row level security;

-- Families policies
drop policy if exists "families_select_own" on public.families;
create policy "families_select_own"
on public.families for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists "families_insert_own" on public.families;
create policy "families_insert_own"
on public.families for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "families_update_own" on public.families;
create policy "families_update_own"
on public.families for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "families_delete_own" on public.families;
create policy "families_delete_own"
on public.families for delete
to authenticated
using (owner_id = auth.uid());

-- Persons policies (allowed if family owner is current user)
drop policy if exists "persons_select_owned_family" on public.persons;
create policy "persons_select_owned_family"
on public.persons for select
to authenticated
using (
  exists (
    select 1 from public.families f
    where f.id = persons.family_id
      and f.owner_id = auth.uid()
  )
);

drop policy if exists "persons_insert_owned_family" on public.persons;
create policy "persons_insert_owned_family"
on public.persons for insert
to authenticated
with check (
  exists (
    select 1 from public.families f
    where f.id = persons.family_id
      and f.owner_id = auth.uid()
  )
);

drop policy if exists "persons_update_owned_family" on public.persons;
create policy "persons_update_owned_family"
on public.persons for update
to authenticated
using (
  exists (
    select 1 from public.families f
    where f.id = persons.family_id
      and f.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.families f
    where f.id = persons.family_id
      and f.owner_id = auth.uid()
  )
);

drop policy if exists "persons_delete_owned_family" on public.persons;
create policy "persons_delete_owned_family"
on public.persons for delete
to authenticated
using (
  exists (
    select 1 from public.families f
    where f.id = persons.family_id
      and f.owner_id = auth.uid()
  )
);

-- Relationships policies (allowed if family owner is current user)
drop policy if exists "relationships_select_owned_family" on public.relationships;
create policy "relationships_select_owned_family"
on public.relationships for select
to authenticated
using (
  exists (
    select 1 from public.families f
    where f.id = relationships.family_id
      and f.owner_id = auth.uid()
  )
);

drop policy if exists "relationships_insert_owned_family" on public.relationships;
create policy "relationships_insert_owned_family"
on public.relationships for insert
to authenticated
with check (
  exists (
    select 1 from public.families f
    where f.id = relationships.family_id
      and f.owner_id = auth.uid()
  )
);

drop policy if exists "relationships_delete_owned_family" on public.relationships;
create policy "relationships_delete_owned_family"
on public.relationships for delete
to authenticated
using (
  exists (
    select 1 from public.families f
    where f.id = relationships.family_id
      and f.owner_id = auth.uid()
  )
);

-- RPC بسيط لعرض جداول public (للوحة الإدارة)
create or replace function public.list_public_tables()
returns table (table_name text)
language sql
security definer
as $$
  select tablename::text
  from pg_tables
  where schemaname = 'public'
  order by tablename;
$$;

-- RLS للبروفايل (لو ما كان موجود)
alter table if exists public.user_profiles enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='user_profiles' and policyname='Users can read their profile') then
    create policy "Users can read their profile"
      on public.user_profiles for select
      using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='user_profiles' and policyname='Users can upsert their profile') then
    create policy "Users can upsert their profile"
      on public.user_profiles for insert
      with check (auth.uid() = user_id);
  end if;
end $$;