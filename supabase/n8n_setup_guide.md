# n8n Setup — Agenda Cheia Unified Inbox
# WhatsApp + Instagram via ManyChat Webhooks

---

## Credenciais necessárias

| Variável                  | Onde pegar                                      |
|--------------------------|--------------------------------------------------|
| `SUPABASE_URL`           | Supabase → Settings → API → Project URL          |
| `SUPABASE_SERVICE_KEY`   | Supabase → Settings → API → service_role key     |
| `MANYCHAT_API_KEY`       | ManyChat → Settings → API → API Key              |
| `CRM_USER_ID`            | Supabase → SQL: `SELECT id FROM auth.users LIMIT 1` |
| `N8N_WEBHOOK_URL`        | n8n → Webhook node → URL gerada automaticamente  |

---

## Parte 1 — Configurar ManyChat para enviar ao n8n

### WhatsApp (ManyChat)

1. Acesse **ManyChat → Automation → New Flow**
2. Trigger: **"When a contact sends a message"** (WhatsApp)
3. Adicione uma ação: **"External Request"**
4. Configure:
   - **URL:** `{{N8N_WEBHOOK_URL}}`
   - **Method:** POST
   - **Headers:** `Content-Type: application/json`
   - **Body:**
```json
{
  "platform": "whatsapp",
  "subscriber_id": "{{subscriber id}}",
  "first_name": "{{first name}}",
  "last_name": "{{last name}}",
  "phone": "{{phone}}",
  "text": "{{last input text}}",
  "message_id": "{{message id}}",
  "profile_pic": "{{profile pic url}}"
}
```

### Instagram (ManyChat)

1. Acesse **ManyChat → Automation → New Flow**
2. Trigger: **"When a contact sends a message"** (Instagram)
3. Adicione uma ação: **"External Request"**
4. Configure (mesmo URL do WhatsApp):
   - **Body:**
```json
{
  "platform": "instagram",
  "subscriber_id": "{{subscriber id}}",
  "first_name": "{{first name}}",
  "last_name": "{{last name}}",
  "instagram_username": "{{instagram username}}",
  "text": "{{last input text}}",
  "message_id": "{{message id}}",
  "profile_pic": "{{profile pic url}}"
}
```

---

## Parte 2 — Workflow n8n: Mensagem ENTRANTE

### Fluxo completo no n8n:
```
[Webhook] → [Buscar conversa] → [IF existe?] → [Criar conversa] → [Inserir mensagem] → [Atualizar last_message]
```

---

### Node 1 — Webhook (Trigger)
```
Type: Webhook
HTTP Method: POST
Path: /manychat-incoming
Authentication: None (ou Header Auth para segurança)
```

---

### Node 2 — Buscar conversa existente
```
Type: HTTP Request
Method: GET
URL: {{SUPABASE_URL}}/rest/v1/conversations
Headers:
  apikey: {{SUPABASE_SERVICE_KEY}}
  Authorization: Bearer {{SUPABASE_SERVICE_KEY}}
Query Parameters:
  manychat_subscriber_id=eq.{{ $json.body.subscriber_id }}
  select=id,user_id,unread
```

---

### Node 3 — IF (conversa existe?)
```
Type: IF
Condition: {{ $json.length }} > 0
  TRUE → vai para Node 5 (inserir mensagem)
  FALSE → vai para Node 4 (criar conversa)
```

---

### Node 4 — Criar nova conversa
```
Type: HTTP Request
Method: POST
URL: {{SUPABASE_URL}}/rest/v1/conversations
Headers:
  apikey: {{SUPABASE_SERVICE_KEY}}
  Authorization: Bearer {{SUPABASE_SERVICE_KEY}}
  Content-Type: application/json
  Prefer: return=representation
Body (JSON):
{
  "user_id": "{{CRM_USER_ID}}",
  "lead_name": "{{ $json.body.first_name }} {{ $json.body.last_name }}",
  "lead_avatar": "{{ $json.body.profile_pic }}",
  "canal": "{{ $json.body.platform }}",
  "platform": "{{ $json.body.platform }}",
  "platform_contact_id": "{{ $json.body.phone || $json.body.instagram_username }}",
  "manychat_subscriber_id": "{{ $json.body.subscriber_id }}",
  "contact_phone": "{{ $json.body.phone }}",
  "contact_username": "{{ $json.body.instagram_username }}",
  "modo": "bot",
  "unread": 1,
  "last_message": "{{ $json.body.text }}",
  "last_at": "{{ $now.toISO() }}"
}
```

---

### Node 5 — Inserir mensagem
```
Type: HTTP Request
Method: POST
URL: {{SUPABASE_URL}}/rest/v1/messages
Headers:
  apikey: {{SUPABASE_SERVICE_KEY}}
  Authorization: Bearer {{SUPABASE_SERVICE_KEY}}
  Content-Type: application/json
Body (JSON):
{
  "conversation_id": "{{ $json[0].id }}",
  "user_id": "{{CRM_USER_ID}}",
  "role": "contact",
  "tipo": "texto",
  "conteudo": "{{ $('Webhook').item.json.body.text }}",
  "sender_name": "{{ $('Webhook').item.json.body.first_name }} {{ $('Webhook').item.json.body.last_name }}",
  "sender_avatar": "{{ $('Webhook').item.json.body.profile_pic }}",
  "platform_message_id": "{{ $('Webhook').item.json.body.message_id }}"
}
```

---

### Node 6 — Atualizar last_message + unread
```
Type: HTTP Request
Method: PATCH
URL: {{SUPABASE_URL}}/rest/v1/conversations?id=eq.{{ $json[0].id }}
Headers:
  apikey: {{SUPABASE_SERVICE_KEY}}
  Authorization: Bearer {{SUPABASE_SERVICE_KEY}}
  Content-Type: application/json
Body (JSON):
{
  "last_message": "{{ $('Webhook').item.json.body.text }}",
  "last_at": "{{ $now.toISO() }}",
  "unread": "{{ ($json[0].unread || 0) + 1 }}"
}
```

---

## Parte 3 — Workflow n8n: Mensagem SAINTE (CRM → ManyChat)

### Fluxo:
```
[Supabase Polling] → [Filtrar role=user] → [Buscar conversa] → [IF plataforma] → [Enviar WhatsApp / Instagram]
```

---

### Node 1 — Polling Supabase (a cada 5s)
```
Type: Schedule Trigger ou HTTP Request em loop
Method: GET
URL: {{SUPABASE_URL}}/rest/v1/messages
Headers:
  apikey: {{SUPABASE_SERVICE_KEY}}
  Authorization: Bearer {{SUPABASE_SERVICE_KEY}}
Query Parameters:
  role=eq.user
  created_at=gt.{{ $now.minus(10, 'seconds').toISO() }}
  select=*,conversations(manychat_subscriber_id,platform,platform_contact_id)
  order=created_at.desc
```

> **Dica:** Adiciona um campo `sent_to_platform` (boolean) na tabela `messages`
> e filtra por `sent_to_platform=is.false` para evitar reenvio.

---

### Node 2 — IF plataforma (WhatsApp ou Instagram)
```
Condition: {{ $json.conversations.platform }} === 'whatsapp'
  TRUE → Node WhatsApp
  FALSE → Node Instagram
```

---

### Node 3A — Enviar via ManyChat (WhatsApp)
```
Type: HTTP Request
Method: POST
URL: https://api.manychat.com/whatsapp/sending/sendContent
Headers:
  Authorization: Bearer {{MANYCHAT_API_KEY}}
  Content-Type: application/json
Body (JSON):
{
  "subscriber_id": "{{ $json.conversations.manychat_subscriber_id }}",
  "data": {
    "version": "v2",
    "content": {
      "messages": [
        {
          "type": "text",
          "text": "{{ $json.conteudo }}"
        }
      ]
    }
  }
}
```

---

### Node 3B — Enviar via ManyChat (Instagram)
```
Type: HTTP Request
Method: POST
URL: https://api.manychat.com/fb/sending/sendContent
Headers:
  Authorization: Bearer {{MANYCHAT_API_KEY}}
  Content-Type: application/json
Body (JSON):
{
  "subscriber_id": "{{ $json.conversations.manychat_subscriber_id }}",
  "data": {
    "version": "v2",
    "content": {
      "messages": [
        {
          "type": "text",
          "text": "{{ $json.conteudo }}"
        }
      ]
    }
  }
}
```

---

### Node 4 — Marcar mensagem como enviada (evitar duplicatas)
```
Type: HTTP Request
Method: PATCH
URL: {{SUPABASE_URL}}/rest/v1/messages?id=eq.{{ $json.id }}
Headers:
  apikey: {{SUPABASE_SERVICE_KEY}}
  Authorization: Bearer {{SUPABASE_SERVICE_KEY}}
Body (JSON):
{
  "sent_to_platform": true
}
```

> Para usar isso, adicionar coluna no Supabase:
> `ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sent_to_platform boolean DEFAULT false;`

---

## Parte 4 — Lógica do campo `modo` (Bot / Humano)

O campo `modo` na conversa controla quem responde:

| modo     | Comportamento no n8n                            |
|----------|-------------------------------------------------|
| `bot`    | n8n processa a resposta automaticamente via IA  |
| `humano` | n8n **não envia** — aguarda o operador do CRM   |

No Node 1 do fluxo sainte, adicione filtro:
```
Query: conversations.modo=eq.humano
```
Assim o n8n só retransmite mensagens de conversas em modo humano.

---

## Resumo visual

```
WhatsApp/Instagram
      ↓
   ManyChat
      ↓ (External Request webhook)
     n8n
      ↓ (HTTP REST)
   Supabase ←→ CRM (Realtime)
      ↑
     n8n (polling role=user, modo=humano)
      ↑
   ManyChat API
      ↑
WhatsApp/Instagram
```
