# Manual técnico — Atlas Digital

Documento para **desenvolvimento, DevOps e integração**: arquitectura em alto nível, ambiente, serviços auxiliares, scripts e **onde está o código**. Complementa o [manual de integrações](./INTEGRACOES-QUEUE-FLOW.md) (prompts, filas, Typebot, `global-config`, etc.).

---

## 1. Visão de componentes

| Componente | Pasta / tecnologia | Função |
|------------|-------------------|--------|
| **Frontend** | `frontend/` — React (CRA), Material-UI | Painel web (`npm start`). |
| **Backend** | `backend/` — Node, Express, TypeScript | API REST, Socket.IO, filas Bull. |
| **Base de dados** | PostgreSQL | Estado principal (tickets, mensagens, empresas…). |
| **Redis** | Porta típica `6379` | Filas **Bull** (mensagens agendadas, campanhas, monitores). **Sem Redis, vários jobs não correm.** |
| **Ficheiros estáticos** | `backend/public/company{id}/` | Mídias, uploads, branding. |

Fluxo típico: browser → `REACT_APP_BACKEND_URL` → Express → Sequelize → Postgres; eventos em tempo real via Socket.IO (namespace `/workspace-{companyId}`).

---

## 2. Variáveis de ambiente (resumo)

**Frontend** (`frontend/.env`): `REACT_APP_BACKEND_URL`, opcional `REACT_APP_SOCKET_URL`.

**Backend** (`backend/.env` ou config): base de dados, `JWT`, e-mail (`MAIL_*` ou override via `GetGlobalConfig` na BD), Redis (`REDIS_URI` ou equivalente conforme `queues.ts`), Mercado Pago (`MP_ACCESS_TOKEN` ou painel `/global-config`), `FRONTEND_URL` (links em e-mails), `VERIFY_TOKEN` (webhook Meta).

Lista exacta: ver ficheiros de exemplo no repositório e `backend/src/config`.

---

## 3. Comandos úteis

| Objectivo | Onde | Comando |
|-----------|------|---------|
| Subir API em desenvolvimento | `backend/` | `npm run dev:server` |
| Build API | `backend/` | `npm run build` → `npm start` |
| Migrações | `backend/` | `npm run db:migrate` |
| Painel web | `frontend/` | `npm start` |
| Limpar conversas (tickets + mensagens + derivações) | `backend/` | Ver secção 6 |

Docker Compose na raiz: Postgres + Redis (ajustar portas alinhadas ao `.env` do backend).

---

## 4. Rotas e ficheiros “fonte da verdade”

| Domínio | Rotas API (exemplos) | Código de entrada |
|---------|----------------------|-------------------|
| Auth | `/auth/login`, `/auth/refresh_token` | `SessionController`, `routes` |
| Tickets / mensagens | vias serviços em `services/` + `wbotMessageListener` | `backend/src/services/WbotServices/` |
| Integrações de fila | `/queueIntegration` | `QueueIntegrationController`, `wbotMessageListener.handleMessageIntegration` |
| Prompts IA | `/prompt` | `PromptController`, `OpenAiService.handleOpenAi` |
| Config global | `/global-config`, `/global-config/public-branding` | `GlobalConfigController`, `GetGlobalConfig` |
| Webhook Meta | `GET/POST /webhook` | `WebHookController` |

Mapa detalhado de integrações: [INTEGRACOES-QUEUE-FLOW.md](./INTEGRACOES-QUEUE-FLOW.md).

---

## 5. Diagnóstico rápido

| Sintoma | Causas frequentes |
|---------|-------------------|
| `ECONNREFUSED 127.0.0.1:6379` | Redis parado — subir `docker compose` ou serviço local. |
| Agendamentos não disparam | Redis + job `ScheduleMonitor` em `queues.ts` (cron Bull). |
| Socket não actualiza lista | Namespace `/workspace-{id}` vs emissões no backend; CORS/origin. |
| E-mail não envia | SMTP em `.env` ou `/global-config`; credenciais e `FRONTEND_URL`. |
| IA não responde | `promptId` na conexão, chave API, plano `useOpenAi`, condições em `wbotMessageListener`. |

---

## 6. Scripts de manutenção

| Script | Descrição |
|--------|-----------|
| `backend/src/scripts/cleanConversations.ts` | Apaga tickets (e tabelas derivadas) numa transacção; env `CONFIRM=YES_I_UNDERSTAND`, opcional `COMPANY_ID`, `DRY_RUN=1`, `INCLUDE_INTERNAL_CHAT=1`. Ver `npm run script:clean-conversations` no `backend/package.json`. |
| `scripts/clean-conversations-postgres.sql` | Versão SQL para `psql` (blocos comentados por segurança). |

**Backup obrigatório** antes de limpar dados.

---

## 7. Segurança e produção

- Não expor Postgres/Redis à internet sem rede privada ou firewall.  
- JWT e segredos só em variáveis de ambiente ou secret manager.  
- HTTPS em produção; alinhar `FRONTEND_URL` e URLs de API.  
- Rever permissões `super` / admin empresa `1` em `GlobalConfigController` e menus.

---

## 8. Ligações

- [Índice da documentação](./README.md)  
- [Manual do operador](./MANUAL-OPERADOR.md)  
- [Integrações, prompts e config global](./INTEGRACOES-QUEUE-FLOW.md)  
- [Recuperação de senha](./RECUPERACAO-SENHA.md)  
- [Guia local/produção](../GUIA-LOCAL-E-PRODUCAO.md) (se existir na raiz do repo)

Quando alterares comportamento no código, actualiza o manual técnico ou o de integrações na mesma *pull request* para a documentação não ficar obsoleta.
