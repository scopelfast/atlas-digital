# Ligações externas e privacidade — mapa no código

Documento de referência: **onde** o Atlas Digital (neste repositório) pode contactar serviços fora da tua infraestrutura ou carregar recursos remotos. Não altera comportamento; serve para auditoria e decisões (firewall, DLP, self‑hosted).

**Última revisão:** inventário por grep/leitura de ficheiros no repo.

---

## 1. GitHub e CDNs relacionados

| O quê | Ficheiro | Notas |
|--------|-----------|--------|
| GeoJSON dos estados (mapa) | `frontend/src/pages/Contacts/index.js` | URLs `cdn.jsdelivr.net` e `raw.githubusercontent.com` (projeto público *click_that_hood*). O **browser** faz o pedido quando essa funcionalidade é usada. |
| Link literal “Star Baileys” | `backend/src/helpers/SendMessageFlow.ts` | URL `https://github.com/adiwajshing/Baileys` como texto de **botão** num fluxo — não é chamada API automática ao GitHub. |

Não existe integração genérica com a **API do GitHub** (issues, clones, etc.) para o core da aplicação.

---

## 2. Backend — chamadas / clientes explícitos

| Destino | Ficheiros / contexto |
|---------|----------------------|
| **Supabase** (`*.supabase.co`) + chave anónima no código | `backend/src/helpers/GetWhatsapp.ts` | Cliente `@supabase/supabase-js`, tabela `cadastros`, comparação com IP e `COMPANY_TOKEN`. Invocado via `GetWhatsapp()` a partir de `backend/src/queues.ts` (cron `handleWhatsapp`). |
| **IP público** | `backend/src/helpers/GetWhatsapp.ts` | `GET https://api.ipify.org?format=json` |
| **OpenAI** | `backend/src/services/MessageServices/TranscribeAudioMessageService.ts` e fluxos IA (`OpenAiService`, `wbotMessageListener`, etc.) | `https://api.openai.com/...` quando configurado. |
| **Google Gemini** | `TranscribeAudioMessageService.ts` | `generativelanguage.googleapis.com` |
| **Facebook / Meta Graph** | `backend/src/services/FacebookServices/graphAPI.ts` | OAuth e Graph API v18. |
| **Mercado Pago** | `backend/src/controllers/SubscriptionController.ts` | `api.mercadopago.com` |
| **WhatsApp (Meta)** | `backend/src/services/WbotServices/wbotMessageListener.ts` (e afins) | URLs tipo `web.whatsapp.net`, `mmg.whatsapp.net`; ligação via Baileys. |
| **Sentry** | `backend/src/app.ts` | `Sentry.init({ dsn: process.env.SENTRY_DSN })` — só envia dados se `SENTRY_DSN` estiver definido. |
| **URLs configuráveis** | Integrações de fila, webhooks, Typebot, N8N, etc. | Destinos definidos no painel / base de dados — não são fixos no código. |

Comentários com URLs (Asaas, Mikweb, chart.googleapis, etc.) aparecem por exemplo em `backend/src/services/WbotServices/ChatBotListener.ts` — **trechos comentados**; confirmar no teu branch se estão activos.

---

## 3. Frontend — browser

| O quê | Ficheiro(s) |
|--------|-------------|
| YouTube (embed / thumbnails) | `frontend/src/pages/Helps/index.js`, `frontend/src/components/ModalYoutubeCors/index.js` |
| Jitsi Meet (link) | `frontend/src/components/MessageInput/index.js` — `https://meet.jit.si/...` |
| WhatsApp (`wa.me`) | `frontend/src/pages/Login/index.js`, `frontend/src/pages/Connections/index.js`, `frontend/src/pages/GlobalConfig/index.js` (exemplos) |
| Imagens fallback login | `frontend/src/pages/Login/index.js` (ex.: domínios em strings de exemplo) |

---

## 4. Variáveis de ambiente relevantes

- `SENTRY_DSN` — activa envio de erros para a cloud Sentry.
- `COMPANY_TOKEN` — usado em `GetWhatsapp.ts` juntamente com o registo no Supabase.
- Chaves de API (OpenAI, Gemini, Meta, Mercado Pago, etc.) — conforme funcionalidades activas.

---

## 5. Leitura rápida “há telemetria?”

- **Sim (fixo no código analisado):** fluxo `GetWhatsapp` → **ipify** + **Supabase** (validação/registo remoto).
- **Condicional:** **Sentry** se `SENTRY_DSN` existir.
- **Por configuração / uso:** WhatsApp, IA, Meta, MP, webhooks, Typebot, N8N, Dialogflow.
- **GitHub:** sobretudo **dados estáticos** (GeoJSON) e **hyperlink** num fluxo — não “sync” com GitHub.

Para desactivar ou substituir o bloco Supabase/ipify, o ponto de entrada lógico é `backend/src/helpers/GetWhatsapp.ts` e a agenda em `backend/src/queues.ts` (`handleWhatsapp` / `GetWhatsapp()`).

---

## 6. Índice da documentação

Ver também: [README.md](./README.md) nesta pasta `docs/`.
