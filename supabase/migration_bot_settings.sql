-- ─── Add integrations table (if not exists) ──────────
create table if not exists public.integrations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  -- Meta / WhatsApp
  meta_access_token text,
  whatsapp_phone_number_id text,
  whatsapp_business_id text,
  instagram_page_id text,
  meta_verify_token text default 'agenda-cheia-2026',
  meta_connected boolean default false,
  -- ManyChat / TikTok
  manychat_api_key text,
  manychat_connected boolean default false,
  -- Gemini
  gemini_api_key text,
  -- Bot / Agente IA settings
  bot_name text default 'Assistente',
  bot_prompt text default 'Você é um assistente de vendas profissional. Seu objetivo é qualificar leads, responder dúvidas sobre os serviços e agendar reuniões. Seja sempre cordial, objetivo e profissional.',
  bot_respond_after_hours boolean default true,
  bot_escalate_human boolean default true,
  bot_schedule_start text default '08:00',
  bot_schedule_end text default '18:00',
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.integrations enable row level security;

drop policy if exists "Users manage own integrations" on public.integrations;
create policy "Users manage own integrations" on public.integrations
  for all using (auth.uid() = user_id);

-- Add bot columns to existing integrations table if they don't exist
alter table public.integrations add column if not exists bot_name text default 'Assistente';
alter table public.integrations add column if not exists bot_prompt text default 'Você é um assistente de vendas profissional. Seu objetivo é qualificar leads, responder dúvidas sobre os serviços e agendar reuniões. Seja sempre cordial, objetivo e profissional.';
alter table public.integrations add column if not exists bot_respond_after_hours boolean default true;
alter table public.integrations add column if not exists bot_escalate_human boolean default true;
alter table public.integrations add column if not exists bot_schedule_start text default '08:00';
alter table public.integrations add column if not exists bot_schedule_end text default '18:00';
alter table public.integrations add column if not exists gemini_api_key text;
