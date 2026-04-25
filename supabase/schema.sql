-- ─── Drop existing policies (safe re-run) ─────────────
do $$ begin
  -- profiles
  drop policy if exists "Users can view own profile" on public.profiles;
  drop policy if exists "Users can update own profile" on public.profiles;
  -- leads
  drop policy if exists "Users manage own leads" on public.leads;
  -- conversations
  drop policy if exists "Users manage own conversations" on public.conversations;
  -- messages
  drop policy if exists "Users manage own messages" on public.messages;
  -- appointments
  drop policy if exists "Users manage own appointments" on public.appointments;
end $$;

-- ─── Profiles (linked to auth.users) ─────────────────
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  avatar_url text,
  role text default 'admin',
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- ─── Leads ────────────────────────────────────────────
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  empresa text not null,
  contato text,
  email text,
  telefone text,
  canal text default 'manual',
  valor numeric default 0,
  etapa text default 'novo',
  notas text,
  avatar text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.leads enable row level security;
create policy "Users manage own leads" on public.leads
  for all using (auth.uid() = user_id);

-- ─── Conversations ────────────────────────────────────
create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  lead_id uuid references public.leads on delete set null,
  lead_name text,
  lead_avatar text,
  canal text default 'whatsapp',
  modo text default 'bot',
  unread int default 0,
  last_message text,
  last_at timestamptz default now(),
  created_at timestamptz default now()
);
alter table public.conversations enable row level security;
create policy "Users manage own conversations" on public.conversations
  for all using (auth.uid() = user_id);

-- ─── Messages ─────────────────────────────────────────
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  role text default 'user',
  tipo text default 'texto',
  conteudo text,
  arquivo_url text,
  arquivo_nome text,
  created_at timestamptz default now()
);
alter table public.messages enable row level security;
create policy "Users manage own messages" on public.messages
  for all using (auth.uid() = user_id);

-- ─── Appointments ─────────────────────────────────────
create table if not exists public.appointments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  lead_id uuid references public.leads on delete set null,
  lead_name text,
  titulo text not null,
  tipo text default 'reuniao',
  descricao text,
  inicio timestamptz not null,
  fim timestamptz not null,
  duracao int default 60,
  status text default 'programada',
  google_sync boolean default false,
  google_event_id text,
  created_at timestamptz default now()
);
alter table public.appointments enable row level security;
create policy "Users manage own appointments" on public.appointments
  for all using (auth.uid() = user_id);

-- ─── Auto-update updated_at on leads ──────────────────
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists leads_updated_at on public.leads;
create trigger leads_updated_at
  before update on public.leads
  for each row execute procedure public.handle_updated_at();

-- ─── Auto-create profile on signup ────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
