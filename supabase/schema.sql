-- =====================================================================
-- Run this whole file in Supabase > SQL Editor (once).
-- =====================================================================

-- ---------- PROFILES ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text check (char_length(full_name) <= 100),
  avatar_url text,
  role text not null default 'visitor' check (role in ('admin','visitor')),
  created_at timestamptz not null default now()
);

-- Admin check. SECURITY DEFINER avoids recursive RLS on profiles.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Every new auth user becomes a 'visitor'. Client metadata can NEVER set the role.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, left(coalesce(new.raw_user_meta_data->>'full_name',''), 100));
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- Block role changes from the API. Only the SQL Editor (auth.uid() is null) may change roles.
create or replace function public.prevent_role_change()
returns trigger language plpgsql as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null then
    raise exception 'Role cannot be changed from the client';
  end if;
  return new;
end; $$;

create trigger profiles_lock_role
  before update on public.profiles for each row execute function public.prevent_role_change();

alter table public.profiles enable row level security;
create policy "own or admin read profile" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "own profile update" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
-- No insert/delete policies: only the trigger creates profiles.

-- ---------- PORTFOLIO CONTENT TABLES ----------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  description text not null check (char_length(description) <= 600),
  details text check (char_length(details) <= 5000),
  tech text[] not null default '{}',
  status text not null default 'In Progress',
  github_url text, demo_url text, image_url text,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create table public.skills (
  id uuid primary key default gen_random_uuid(),
  category text not null, name text not null,
  level_label text default 'Learning',
  visible boolean not null default true, sort_order int not null default 0
);
create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  name text not null, provider text not null,
  issue_date date, credential_url text, image_url text,
  visible boolean not null default true
);
create table public.education (
  id uuid primary key default gen_random_uuid(),
  institution text not null, degree text not null, specialization text,
  start_date text, end_date text, coursework text[] default '{}',
  visible boolean not null default true
);
create table public.site_settings (
  key text primary key, value jsonb not null
);

-- Public reads only published/visible rows; admin reads and writes everything.
do $$
declare t text; vis text;
begin
  for t, vis in values ('projects','published'),('skills','visible'),
                       ('certifications','visible'),('education','visible') loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "public read" on public.%I for select using (%I or public.is_admin())', t, vis);
    execute format('create policy "admin insert" on public.%I for insert with check (public.is_admin())', t);
    execute format('create policy "admin update" on public.%I for update using (public.is_admin()) with check (public.is_admin())', t);
    execute format('create policy "admin delete" on public.%I for delete using (public.is_admin())', t);
  end loop;
end $$;

alter table public.site_settings enable row level security;
create policy "public read" on public.site_settings for select using (true);
create policy "admin write" on public.site_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- MESSAGES (contact system) ----------
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  subject text not null check (char_length(subject) between 1 and 150),
  message text not null check (char_length(message) between 10 and 3000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;
-- Anyone may send; a logged-in sender cannot impersonate another user_id.
create policy "anyone can send" on public.messages for insert
  with check (user_id is null or user_id = auth.uid());
create policy "admin read" on public.messages for select using (public.is_admin());
create policy "admin update" on public.messages for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete" on public.messages for delete using (public.is_admin());

-- ---------- BOOKMARKS ----------
create table public.bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, project_id)
);
alter table public.bookmarks enable row level security;
create policy "own read" on public.bookmarks for select using (user_id = auth.uid());
create policy "own insert" on public.bookmarks for insert with check (user_id = auth.uid());
create policy "own delete" on public.bookmarks for delete using (user_id = auth.uid());

-- ---------- STORAGE (project images) ----------
insert into storage.buckets (id, name, public) values ('project-images','project-images',true)
  on conflict do nothing;
create policy "public read images" on storage.objects for select using (bucket_id = 'project-images');
create policy "admin upload images" on storage.objects for insert
  with check (bucket_id = 'project-images' and public.is_admin());
create policy "admin update images" on storage.objects for update
  using (bucket_id = 'project-images' and public.is_admin());
create policy "admin delete images" on storage.objects for delete
  using (bucket_id = 'project-images' and public.is_admin());

-- =====================================================================
-- CREATE THE FIRST ADMIN (safe method):
-- 1. Sign up normally through the site's Register page and verify your email.
-- 2. In the SQL Editor run (replace the email with yours):
--    update public.profiles set role = 'admin'
--    where id = (select id from auth.users where email = 'YOUR_EMAIL');
-- No admin password exists in code, and the API cannot grant admin.
-- =====================================================================
