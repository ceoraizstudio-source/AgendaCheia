# Guia de Integração n8n — Agenda Cheia Unified Inbox

## Credenciais Supabase para o n8n

```
SUPABASE_URL=https://kdiarlpcsgkfijgxgvmu.supabase.co
SUPABASE_SERVICE_KEY=<pegar em Settings → API → service_role key>
```

> ⚠️ Use SEMPRE a `service_role` key no n8n — nunca a `anon` key.
> A service_role bypassa o RLS e pode escrever em qualquer tabela.

---

## Fluxo 1 — ManyChat → n8n → Supabase (mensagem entrante)

### Webhook n8n recebe do ManyChat:
```json
{
  "subscriber_id": "123456",
  "first_name": "João",
  "last_name": "Silva",
  "platform": "whatsapp",
  "phone": "+5511999999999",
  "text": "Olá, quero agendar uma consulta"
}
```

### n8n Step 1 — Buscar ou criar conversa:
```
HTTP Request Node:
  Method: GET
  URL: {{SUPABASE_URL}}/rest/v1/conversations
  Headers:
    apikey: {{SUPABASE_SERVICE_KEY}}
    Authorization: Bearer {{SUPABASE_SERVICE_KEY}}
  Query params:
    manychat_subscriber_id=eq.{{subscriber_id}}
    select=id,user_id
```

### n8n Step 2 — Se não existe, criar conversa:
```
HTTP Request Node:
  Method: POST
  URL: {{SUPABASE_URL}}/rest/v1/conversations
  Headers:
    apikey: {{SUPABASE_SERVICE_KEY}}
    Authorization: Bearer {{SUPABASE_SERVICE_KEY}}
    Prefer: return=representation
  Body (JSON):
  {
    "user_id": "<UUID do dono do CRM>",
    "lead_name": "{{first_name}} {{last_name}}",
    "canal": "{{platform}}",
    "platform": "{{platform}}",
    "platform_contact_id": "{{phone ou subscriber_id}}",
    "manychat_subscriber_id": "{{subscriber_id}}",
    "contact_phone": "{{phone}}",
    "modo": "bot",
    "last_message": "{{text}}",
    "last_at": "{{$now}}"
  }
```

### n8n Step 3 — Inserir mensagem:
```
HTTP Request Node:
  Method: POST
  URL: {{SUPABASE_URL}}/rest/v1/messages
  Headers:
    apikey: {{SUPABASE_SERVICE_KEY}}
    Authorization: Bearer {{SUPABASE_SERVICE_KEY}}
  Body (JSON):
  {
    "conversation_id": "{{conversation_id}}",
    "user_id": "<UUID do dono do CRM>",
    "role": "contact",
    "tipo": "texto",
    "conteudo": "{{text}}",
    "sender_name": "{{first_name}} {{last_name}}",
    "platform_message_id": "{{message_id_do_manychat}}"
  }
```

### n8n Step 4 — Atualizar last_message na conversa:
```
HTTP Request Node:
  Method: PATCH
  URL: {{SUPABASE_URL}}/rest/v1/conversations?id=eq.{{conversation_id}}
  Headers:
    apikey: {{SUPABASE_SERVICE_KEY}}
    Authorization: Bearer {{SUPABASE_SERVICE_KEY}}
  Body (JSON):
  {
    "last_message": "{{text}}",
    "last_at": "{{$now}}",
    "unread": 1
  }
```

---

## Fluxo 2 — Supabase → n8n → ManyChat (mensagem sainte do CRM)

### n8n Trigger — Supabase Realtime ou Polling:

**Opção A (Realtime via Websocket):**
Usar o node "Supabase Trigger" do n8n (se disponível) ou configurar polling.

**Opção B (Polling a cada 5s):**
```
HTTP Request:
  GET {{SUPABASE_URL}}/rest/v1/messages
  Query params:
    role=eq.user
    created_at=gt.{{ultimo_check}}
    select=*,conversations(manychat_subscriber_id,platform)
    order=created_at.desc
    limit=10
```

### n8n Step — Enviar via ManyChat API:
```
HTTP Request Node:
  Method: POST
  URL: https://api.manychat.com/fb/sending/sendContent
  Headers:
    Authorization: Bearer {{MANYCHAT_API_KEY}}
  Body:
  {
    "subscriber_id": "{{manychat_subscriber_id}}",
    "data": {
      "version": "v2",
      "content": {
        "messages": [
          {
            "type": "text",
            "text": "{{conteudo}}"
          }
        ]
      }
    }
  }
```

---

## Roles das mensagens no Supabase

| role      | Quem enviou          | Posição no chat |
|-----------|---------------------|-----------------|
| `user`    | Operador do CRM     | Direita (laranja) |
| `contact` | Paciente/Lead       | Esquerda (cinza) |
| `bot`     | Bot automático      | Esquerda (cinza) |

---

## Campos da tabela `conversations`

| Campo                   | Descrição                              |
|------------------------|----------------------------------------|
| `platform`             | whatsapp / instagram / tiktok          |
| `platform_contact_id`  | Número/ID do contato na plataforma     |
| `manychat_subscriber_id` | ID do subscriber no ManyChat         |
| `contact_phone`        | Número de telefone (WhatsApp)          |
| `contact_username`     | Username (Instagram/TikTok)            |
| `canal`                | Canal exibido no CRM (badge)           |
| `modo`                 | bot / humano (controla quem responde)  |

---

## UUID do dono do CRM

Para pegar o UUID do usuário que vai ser dono das conversas:
```sql
SELECT id, email FROM auth.users LIMIT 5;
```
