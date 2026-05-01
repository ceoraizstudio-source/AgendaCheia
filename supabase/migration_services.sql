-- Tabela de serviços oferecidos por cada cliente
CREATE TABLE IF NOT EXISTS services (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome        text NOT NULL,
  descricao   text,
  preco       numeric(10,2) DEFAULT 0,
  ativo       boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "services_owner" ON services
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Adiciona coluna de serviço de interesse nos leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS servico text;
