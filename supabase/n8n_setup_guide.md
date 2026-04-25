# n8n Setup — Agenda Cheia Unified Inbox
# WhatsApp Business Cloud API + Instagram Graph API (Meta Oficial)

---

## Credenciais necessárias

| Variável                    | Onde pegar                                                        |
|----------------------------|-------------------------------------------------------------------|
| `SUPABASE_URL`             | Supabase → Settings → API → Project URL                           |
| `SUPABASE_SERVICE_KEY`     | Supabase → Settings → API → service_role key                      |
| `CRM_USER_ID`              | Supabase SQL: `SELECT id FROM auth.users LIMIT 1`                 |
| `META_ACCESS_TOKEN`        | Meta Business → App → WhatsApp → API Setup → Permanent Token     |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta Business → WhatsApp → API Setup → Phone Number ID           |
| `WHATSAPP_BUSINESS_ID`     | Meta Business → WhatsApp → API Setup → WhatsApp Business Account |
| `INSTAGRAM_PAGE_ID`        | Meta Business → Instagram → Page ID conectado                    |
| `META_VERIFY_TOKEN`        | Você define (qualquer string secreta ex: `agenda-cheia-2026`)     |
| `N8N_WEBHOOK_WA_URL`       | URL gerada pelo Webhook node do WhatsApp no n8n                   |
| `N8N_WEBHOOK_IG_URL`       | URL gerada pelo Webhook node do Instagram no n8n                  |

---

## Parte 1 — Configurar Meta App (Pré-requisito)

### 1.1 Criar App no Meta for Developers
1. Acesse **developers.facebook.com → My Apps → Create App**
2. Tipo: **Business**
3. Adicione os produtos: **WhatsApp** e **Messenger (Instagram)**

### 1.2 WhatsApp — Registrar webhook no Meta
1. **WhatsApp → Configuration → Webhook**
2. **Callback URL:** `{{N8N_WEBHOOK_WA_URL}}`
3. **Verify Token:** `{{META_VERIFY_TOKEN}}`
4. **Subscribe:** `messages`, `message_deliveries`, `message_reads`

### 1.3 Instagram — Registrar webhook no Meta
1. **Messenger → Settings → Webhooks**
2. **Callback URL:** `{{N8N_WEBHOOK_IG_URL}}`
3. **Verify Token:** `{{META_VERIFY_TOKEN}}`
4. **Subscribe:** `messages`, `messaging_postbacks`
5. Conecte a **Página do Instagram** ao app

---

## Parte 2 — Workflow n8n: WhatsApp ENTRANTE

### Fluxo:
```
[Webhook WA] → [Verificação Meta] → [Extrair mensagem] → [Buscar/Criar conversa] → [Inserir mensagem] → [Atualizar conversa]
```

---

### Node 1 — Webhook WhatsApp
```
Type: Webhook
HTTP Method: GET + POST (dois métodos)
Path: /whatsapp-incoming
Response Mode: Immediately
```

---

### Node 2 — Verificação do Meta (GET — obrigatório)
```
Type: IF
Condition: {{ $json.query['hub.mode'] }} === 'subscribe'
  TRUE → Respond to Webhook com {{ $json.query['hub.challenge'] }}
  FALSE → continua para Node 3
```

---

### Node 3 — Extrair dados da mensagem
```
Type: Code (JavaScript)
Code:
const entry = $json.body.entry?.[0]
const change = entry?.changes?.[0]?.value
const msg = change?.messages?.[0]
const contact = change?.contacts?.[0]

if (!msg || msg.type !== 'text') return []

return [{
  json: {
    platform: 'whatsapp',
    subscriber_id: msg.from,           // número do contato
    phone: msg.from,
    first_name: contact?.profile?.name || msg.from,
    text: msg.text?.body,
    message_id: msg.id,
    timestamp: msg.timestamp
  }
}]
```

---

### Node 4 — Buscar conversa existente
```
Type: HTTP Request
Method: GET
URL: {{SUPABASE_URL}}/rest/v1/conversations
Headers:
  apikey: {{SUPABASE_SERVICE_KEY}}
  Authorization: Bearer {{SUPABASE_SERVICE_KEY}}
Query Parameters:
  platform_contact_id=eq.{{ $json.phone }}
  platform=eq.whatsapp
  select=id,unread,modo
```

---

### Node 5 — IF conversa existe
```
Type: IF
Condition: {{ $json.length }} > 0
  TRUE  → Node 7 (inserir mensagem)
  FALSE → Node 6 (criar conversa)
```

---

### Node 6 — Criar nova conversa
```
Type: HTTP Request
Method: POST
URL: {{SUPABASE_URL}}/rest/v1/conversations
Headers:
  apikey: {{SUPABASE_SERVICE_KEY}}
  Authorization: Bearer {{SUPABASE_SERVICE_KEY}}
  Content-Type: application/json
  Prefer: return=representation
Body:
{
  "user_id": "{{CRM_USER_ID}}",
  "lead_name": "{{ $('Node 3').item.json.first_name }}",
  "canal": "whatsapp",
  "platform": "whatsapp",
  "platform_contact_id": "{{ $('Node 3').item.json.phone }}",
  "contact_phone": "{{ $('Node 3').item.json.phone }}",
  "modo": "bot",
  "unread": 1,
  "last_message": "{{ $('Node 3').item.json.text }}",
  "last_at": "{{ $now.toISO() }}"
}
```

---

### Node 7 — Inserir mensagem
```
Type: HTTP Request
Method: POST
URL: {{SUPABASE_URL}}/rest/v1/messages
Headers:
  apikey: {{SUPABASE_SERVICE_KEY}}
  Authorization: Bearer {{SUPABASE_SERVICE_KEY}}
  Content-Type: application/json
Body:
{
  "conversation_id": "{{ $json[0].id }}",
  "user_id": "{{CRM_USER_ID}}",
  "role": "contact",
  "tipo": "texto",
  "conteudo": "{{ $('Node 3').item.json.text }}",
  "sender_name": "{{ $('Node 3').item.json.first_name }}",
  "platform_message_id": "{{ $('Node 3').item.json.message_id }}"
}
```

---

### Node 8 — Atualizar conversa
```
Type: HTTP Request
Method: PATCH
URL: {{SUPABASE_URL}}/rest/v1/conversations?id=eq.{{ $json[0].id }}
Headers:
  apikey: {{SUPABASE_SERVICE_KEY}}
  Authorization: Bearer {{SUPABASE_SERVICE_KEY}}
  Content-Type: application/json
Body:
{
  "last_message": "{{ $('Node 3').item.json.text }}",
  "last_at": "{{ $now.toISO() }}",
  "unread": "{{ ($json[0].unread || 0) + 1 }}"
}
```

---

## Parte 3 — Workflow n8n: Instagram ENTRANTE

### Node 1 — Webhook Instagram
```
Type: Webhook
HTTP Method: GET + POST
Path: /instagram-incoming
```

### Node 2 — Verificação Meta (igual ao WhatsApp)

### Node 3 — Extrair dados Instagram
```
Type: Code (JavaScript)
Code:
const entry = $json.body.entry?.[0]
const messaging = entry?.messaging?.[0]

if (!messaging?.message?.text) return []

return [{
  json: {
    platform: 'instagram',
    subscriber_id: messaging.sender.id,
    instagram_user_id: messaging.sender.id,
    text: messaging.message.text,
    message_id: messaging.message.mid,
    first_name: 'Contato Instagram'  // buscar nome via Graph API se necessário
  }
}]
```

> Para buscar o nome do contato Instagram:
> `GET https://graph.facebook.com/{{instagram_user_id}}?fields=name&access_token={{META_ACCESS_TOKEN}}`

### Nodes 4-8 — Iguais ao WhatsApp, só muda `platform: 'instagram'` e `platform_contact_id: instagram_user_id`

---

## Parte 4 — Workflow n8n: Mensagem SAINTE (CRM → Meta API)

### Fluxo:
```
[Polling Supabase] → [Filtrar não enviadas] → [IF plataforma] → [Enviar WhatsApp / Instagram]
```

---

### Node 1 — Polling (a cada 3 segundos)
```
Type: Schedule Trigger (interval: 3s) ou Loop
Method: GET
URL: {{SUPABASE_URL}}/rest/v1/messages
Headers:
  apikey: {{SUPABASE_SERVICE_KEY}}
  Authorization: Bearer {{SUPABASE_SERVICE_KEY}}
Query Parameters:
  role=eq.user
  sent_to_platform=is.false
  select=*,conversations(platform,platform_contact_id,modo)
  order=created_at.asc
  limit=10
```

---

### Node 2 — Filtrar só modo=humano
```
Type: IF
Condition: {{ $json.conversations.modo }} === 'humano'
  TRUE  → envia
  FALSE → ignora (bot cuida)
```

---

### Node 3 — IF plataforma
```
Type: Switch
Value: {{ $json.conversations.platform }}
  'whatsapp'  → Node 4A
  'instagram' → Node 4B
```

---

### Node 4A — Enviar WhatsApp (Meta Cloud API)
```
Type: HTTP Request
Method: POST
URL: https://graph.facebook.com/v19.0/{{WHATSAPP_PHONE_NUMBER_ID}}/messages
Headers:
  Authorization: Bearer {{META_ACCESS_TOKEN}}
  Content-Type: application/json
Body:
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "{{ $json.conversations.platform_contact_id }}",
  "type": "text",
  "text": {
    "preview_url": false,
    "body": "{{ $json.conteudo }}"
  }
}
```

---

### Node 4B — Enviar Instagram (Meta Graph API)
```
Type: HTTP Request
Method: POST
URL: https://graph.facebook.com/v19.0/{{INSTAGRAM_PAGE_ID}}/messages
Headers:
  Authorization: Bearer {{META_ACCESS_TOKEN}}
  Content-Type: application/json
Body:
{
  "recipient": {
    "id": "{{ $json.conversations.platform_contact_id }}"
  },
  "message": {
    "text": "{{ $json.conteudo }}"
  }
}
```

---

### Node 5 — Marcar como enviada
```
Type: HTTP Request
Method: PATCH
URL: {{SUPABASE_URL}}/rest/v1/messages?id=eq.{{ $json.id }}
Headers:
  apikey: {{SUPABASE_SERVICE_KEY}}
  Authorization: Bearer {{SUPABASE_SERVICE_KEY}}
  Content-Type: application/json
Body:
{
  "sent_to_platform": true
}
```

---

## Parte 5 — Lógica Bot / Humano

O switch no CRM controla o campo `modo` na tabela `conversations`:

| modo     | n8n (entrante)              | n8n (sainte)             |
|----------|-----------------------------|--------------------------|
| `bot`    | Passa para agente IA no n8n | n8n NÃO retransmite      |
| `humano` | Só salva no Supabase        | n8n retransmite via Meta |

---

## Resumo do fluxo completo

```
Paciente envia WhatsApp/Instagram
         ↓
    Meta Webhook
         ↓
        n8n
         ↓
      Supabase
         ↓ (Realtime)
        CRM  ←→  Operador responde
         ↓
      Supabase (role=user, sent_to_platform=false)
         ↓
    n8n Polling
         ↓
   Meta Cloud API
         ↓
Paciente recebe resposta
```
