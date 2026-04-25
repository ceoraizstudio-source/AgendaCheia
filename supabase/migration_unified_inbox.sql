-- ─── Unified Inbox — colunas para integração n8n/ManyChat ────────────────────

-- Adiciona colunas de plataforma nas conversas
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS platform text DEFAULT 'whatsapp',
  ADD COLUMN IF NOT EXISTS platform_contact_id text,
  ADD COLUMN IF NOT EXISTS manychat_subscriber_id text,
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS contact_username text;

-- Index para busca rápida por contato (n8n vai usar isso para upsert)
CREATE INDEX IF NOT EXISTS idx_conversations_platform_contact
  ON public.conversations (platform, platform_contact_id);

CREATE INDEX IF NOT EXISTS idx_conversations_manychat
  ON public.conversations (manychat_subscriber_id);

-- Adiciona colunas extras nas mensagens
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS platform_message_id text,
  ADD COLUMN IF NOT EXISTS sender_name text,
  ADD COLUMN IF NOT EXISTS sender_avatar text;

-- Index para evitar duplicatas (n8n pode enviar o mesmo evento 2x)
CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_platform_id
  ON public.messages (platform_message_id)
  WHERE platform_message_id IS NOT NULL;

-- ─── Ativar Realtime ──────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- ─── RLS: permite service_role escrever sem restrição ────────────────────────
-- (service_role já bypassa RLS por padrão — nada a fazer)

-- ─── View de suporte para o n8n ───────────────────────────────────────────────
-- Retorna a conversa com o user_id do dono para o n8n poder inserir mensagens
CREATE OR REPLACE VIEW public.conversations_with_owner AS
  SELECT
    c.*,
    p.email AS owner_email
  FROM public.conversations c
  JOIN public.profiles p ON p.id = c.user_id;
