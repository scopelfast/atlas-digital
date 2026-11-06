# Manual de integrações, prompts e configuração global

**Atlas Digital** — documento técnico de referência: integrações de fila (Dialogflow, N8N, Webhooks, Typebot, Flowbuilder), **prompts** de IA na conexão e **configurações globais** (`/global-config`). Indica *onde* configurar no painel, *como* o backend dispara cada modo e *limitações* actuais do código.

> Índice geral da documentação: [docs/README.md](./README.md) · Para utilizadores do painel: [MANUAL-OPERADOR.md](./MANUAL-OPERADOR.md) · Ambiente e ops: [MANUAL-TECNICO.md](./MANUAL-TECNICO.md)

### Ler primeiro

**Prompts** (`/prompts`, plano `useOpenAi`): cria-se um assistente OpenAI/Gemini e associa-se à **conexão WhatsApp** (`promptId`); responde no início do atendimento, antes da fila, via `handleOpenAi`. **Integrações de fila** (`/queue-integration`, plano `useIntegrations`): registo por tipo **Dialogflow**, **N8N**, **Webhook genérico**, **Typebot** ou **Flowbuilder**, ligado à **fila** e/ou **`integrationId` da conexão**; a orquestração principal está em `wbotMessageListener` e, para fluxos visuais, em `ActionsWebhookService`. **Flowbuilder** é o editor de grafos (`/flowbuilders`) com nós (mensagem, menu, Typebot, OpenAI, etc.). **Webhook** em `/webhook` é só **Meta (Facebook/Instagram)** — não confundir com o tipo “WebHooks” da tabela de integrações. **Configurações globais** (`/global-config`, utilizador **super**): Mercado Pago, SMTP, dias de trial e branding do login — ver secção 12. Detalhes, APIs e ficheiros nas secções abaixo.

---

## 1. Onde configurar no painel

| Área | Rota / menu | API (backend) |
|------|-------------|----------------|
| **Prompts (IA OpenAI / Gemini)** | `http://localhost:3000/prompts` | `GET/POST /prompt`, `GET/PUT/DELETE /prompt/:promptId` |
| **Integrações de fila** | `http://localhost:3000/queue-integration` | `GET/POST/PUT/DELETE /queueIntegration` |
| **Fluxos visuais (Flowbuilder)** | `/flowbuilders`, editor `/flowbuilder/:id` | Fluxos persistidos (modelo `FlowBuilder` / `FlowBuilderModel`) |
| **Ligar integração à fila** | Editar **Fila** → campo de integração | `Queue.integrationId` |
| **Ligar integração à conexão WhatsApp** | Editar **Conexão** → integração / prompt | `Whatsapp.integrationId`, `Whatsapp.promptId` |
| **Webhook Meta (Facebook/Instagram)** | Configuração na Meta + `VERIFY_TOKEN` | `GET/POST /webhook` (não é o mesmo que “WebHooks” da fila) |
| **Configurações globais da plataforma** | `http://localhost:3000/global-config` | `GET/PUT /global-config`, `POST /global-config/upload`, `GET /global-config/public-branding` (público) |

**Permissões de plano:**

- **`/prompts`**: o item de menu **Prompts** só aparece se o plano tiver **`useOpenAi`** (`MainListItems.js` / `getPlanCompany`).
- **`/queue-integration`**: exige **`useIntegrations`**.
- **`/global-config`**: item de menu só para **`user.super`**; quem grava também pode ser **admin da empresa 1** (ver secção 12).

---

## 2. Prompts (`/prompts`) — bot de IA na conexão

Esta área **não** substitui Dialogflow/Typebot/Flowbuilder: é outro canal de automação, baseado em **instruções + API Key + modelo** (OpenAI ou Gemini, conforme chave e nome do modelo em `OpenAiService`).

### 2.1 O que fazer no painel

1. Ir a **`http://localhost:3000/prompts`** e criar um prompt (nome, API Key, texto do prompt, filas associadas, modelo, voz opcional, temperatura, tokens, histórico).
2. Em **Conexões** → editar o WhatsApp → campo **Prompt** (`WhatsAppModal`): escolher o prompt criado. No backend fica `Whatsapp.promptId`.

### 2.2 Quando o backend usa o prompt

Em `wbotMessageListener.ts`, o fluxo típico chama `handleOpenAi` com os dados do prompt quando, entre outras condições, o ticket **ainda não tem fila**, não é grupo, a mensagem não é “fromMe”, não há utilizador no ticket, e a conexão tem **`promptId`** definido (integração “OpenAI na conexão”, antes do menu de filas).

Transferências para humano seguem regras no texto de sistema (ex.: linha com *“Ação: Transferir para o setor de atendimento”*), alinhadas com `OpenAiService.ts`.

### 2.3 Onde está no código

- **Frontend:** `frontend/src/pages/Prompts/index.js`, modal em `frontend/src/components/PromptModal/index.js` (se o projeto usar outro nome de pasta, procurar por `"/prompt"` no `api`).
- **Backend:** `backend/src/routes/promptRouter.ts`, `PromptController`, serviços em `backend/src/services/PromptServices/`, modelo `backend/src/models/Prompt.ts`.
- **Orquestração IA:** `backend/src/services/IntegrationsServices/OpenAiService.ts` (`handleOpenAi`).

### 2.4 Relação com integrações de fila

Prompts e **queue-integration** podem coexistir: o prompt liga-se à **conexão**; Dialogflow/Typebot/N8N/Webhook/Flowbuilder ligam-se sobretudo à **fila** e/ou **`Whatsapp.integrationId`**. A ordem e as condições no `wbotMessageListener` definem qual ramo corre primeiro (ex.: fluxo com Typebot/OpenAI no Flowbuilder vs prompt na conexão).

---

## 3. Modelo de dados (`QueueIntegrations`)

Registo único por empresa (`companyId`) com:

- **`type`**: `dialogflow` | `n8n` | `webhook` | `typebot` | `flowbuilder`
- **`name`**: identificação no painel
- **`projectName`**: projeto Dialogflow; para outros tipos o modal pode igualar a `name` ao gravar
- **`jsonContent`**: credenciais JSON do Google (Dialogflow)
- **`language`**: código do agente Dialogflow (`pt-BR`, `en`, `es`)
- **`urlN8N`**: URL usada por **N8N**, **Webhook genérico** e **base URL do Typebot** (reutilização do campo)
- **Typebot**: `typebotSlug`, `typebotExpires`, `typebotKeywordFinish`, `typebotUnknownMessage`, `typebotDelayMessage`, `typebotKeywordRestart`, `typebotRestartMessage`

---

## 4. Quando o backend chama cada integração

A orquestração principal está em `backend/src/services/WbotServices/wbotMessageListener.ts`, função **`handleMessageIntegration`** e no fluxo de **`verifyQueue`**.

### 4.1 Gatilhos típicos (WhatsApp)

1. **Prompt IA na conexão** (`Whatsapp.promptId`): ramo separado no mesmo listener — ticket **sem fila**, sem utilizador, com `promptId`, etc. → **`handleOpenAi`** (ver secção 2). Não passa por `QueueIntegrations`.
2. **Integração na conexão** (`Whatsapp.integrationId`): ticket **sem fila**, **sem utilizador**, mensagem **do cliente**, não importado, etc. → carrega a integração da conexão e chama `handleMessageIntegration`.
3. **Uma só fila** sem menu de chatbot: em **`verifyQueue`**, se `queues.length === 1` e a fila tem `integrationId` → carrega essa integração e chama `handleMessageIntegration`.
4. **Ticket já em modo integração** (`ticket.useIntegration` + `ticket.integrationId`): continuação do mesmo tipo (ex.: Typebot com sessão ativa).

Há ainda ramos para **Typebot dentro de Flowbuilder** (nó com `typebotIntegration`) e **OpenAI** noutro nó; isso é tratado à parte no mesmo ficheiro.

### 4.2 Comportamento por `type`

| Tipo | O que faz o código |
|------|---------------------|
| **`n8n`** e **`webhook`** | Se existir `urlN8N`, faz **POST** com o corpo JSON da mensagem WhatsApp (`request` / `json: msg`). **Não espera resposta** para responder ao cliente: é envio unidirecional (fire-and-forget). O teu N8N/webhook deve, se quiseres resposta no WhatsApp, usar **API própria do sistema** ou outro canal. |
| **`dialogflow`** | Usa `@google-cloud/dialogflow`: grava `jsonContent` num ficheiro temporário, cria `SessionsClient`, envia texto ou áudio (`sendDialogflowAwswer` + `queryDialogFlow`). Idioma e projeto vêm do registo da integração. Teste de sessão: `POST /queueIntegration/testsession`. |
| **`typebot`** | Usa `urlN8N` como **origem da API Typebot** (ex.: `https://viewer.seudominio.com`). Chamadas: `POST .../api/v1/typebots/{typebotSlug}/startChat` e `POST .../api/v1/sessions/{sessionId}/continueChat`. Variáveis pré-preenchidas: `number`, `pushName`, `remoteJid`. O utilizador pode enviar **`#`** para sair do Typebot e voltar ao menu de filas (comportamento em `typebotListener.ts`). |
| **`flowbuilder`** | Não “interpreta” sozinho o grafo só pelo registo `QueueIntegrations`: entra em **`flowbuilderIntegration`**, que usa **fluxos** (`FlowBuilderModel`), frases de campanha, `flowIdWelcome`, `flowIdNotPhrase` na conexão, e sobretudo **`ActionsWebhookService`** para percorrer nós (mensagem, menu, pergunta, ticket, intervalo, randomizador, Typebot, OpenAI, etc.). **Nota de implementação:** no ramo `flowbuilder` de `handleMessageIntegration`, o código volta a carregar integração com **`ShowQueueIntegrationService(whatsapp.integrationId, ...)`** — convém alinhar **integração da fila** e **`integrationId` da conexão** quando usares Flowbuilder na fila, para não haver ambiguidade. |

---

## 5. Flowbuilder (fluxo visual)

- **Editor:** rotas `/flowbuilders` e `/flowbuilder/:id` no frontend.
- **Execução:** `ActionsWebhookService` (`backend/src/services/WebhookService/ActionsWebhookService.ts`) percorre **nós** e **ligações** do JSON do fluxo.
- **Tipos de nó relevantes** (entre outros): `message`, `question`, `menu`, `ticket`, `interval`, `randomizer`, `singleBlock`, **`typebot`** (bloco com `typebotIntegration`), **`openai`** (bloco com dados tipo OpenAI).

Fluxos de boas-vindas / fallback usam `whatsapp.flowIdWelcome`, `whatsapp.flowIdNotPhrase` dentro de `flowbuilderIntegration`.

---

## 6. Typebot em dois sítios

1. **Integração de fila** `type`: URL base em `urlN8N` + `typebotSlug` + palavras-chave / mensagens de erro / expiração.
2. **Dentro do Flowbuilder**: nó `typebot` com objeto `typebotIntegration` (mesma ideia de sessão API, integrado no grafo).

---

## 7. “WebHooks” — não confundir

| Caminho | Função |
|---------|--------|
| **`QueueIntegrations.type === "webhook"`** + `urlN8N` | POST do payload bruto da mensagem para o URL que definires (automação genérica). |
| **`/webhook` no Express** | Verificação e eventos **Facebook/Instagram** (`WebHookController`), com `VERIFY_TOKEN` e ligação a `Whatsapp.facebookPageUserId`. |

---

## 8. Dialogflow — requisitos

- Conta Google Cloud + agente Dialogflow com **project id** coerente com `projectName` / credenciais.
- **`jsonContent`**: JSON da **service account** (o backend escreve-o em ficheiro temporário e instancia o cliente).
- **`language`**: código passado ao `detectIntent`.
- Dependência npm: `@google-cloud/dialogflow`.

---

## 9. N8N — sugestão de uso

- Criar workflow com nó **Webhook** (POST) que receba o body que o Atlas envia (estrutura Baileys / mensagem WhatsApp).
- Tratar eventos no N8N e, se precisares de **resposta no WhatsApp**, chamar endpoints **da tua instância** (mensagens/tickets) conforme a API interna do projeto — **não** está implementado “reply automático” a partir da resposta HTTP do N8N no `handleMessageIntegration` atual.

---

## 10. Checklist rápido para “usar a capacidade total”

1. Plano com **`useOpenAi`** se quiseres menu **Prompts** + bot IA na conexão (`/prompts`).
2. Plano com **`useIntegrations`** para **`/queue-integration`**.
3. Criar integração em **`/queue-integration`** (tipo desejado).
4. Associar à **fila** (`Queue`) e/ou à **conexão WhatsApp** (`Whatsapp.integrationId`), conforme o fluxo que queres (antes de escolher fila vs depois).
5. **Prompts:** criar em `/prompts` e associar na **conexão** (`Whatsapp.promptId`).
6. **Typebot:** instância acessível a partir do servidor do backend, CORS/rede OK, `typebotSlug` correto.
7. **Dialogflow:** JSON válido, projeto e idioma corretos; testar `testsession`.
8. **Flowbuilder:** publicar fluxo, ligar IDs na conexão (`flowIdWelcome`, etc.) e testar menus / nós Typebot / OpenAI.
9. **Webhook/N8N:** assumir apenas **notificação** ou estender tu próprio com chamadas à API do Atlas.
10. **Super admin:** configurar **`/global-config`** (SMTP, MP, trial, login) para e-mails e branding globais.

---

## 11. Ficheiros-chave (referência de código)

- `frontend/src/pages/Prompts/index.js`, `frontend/src/components/PromptModal/index.js`
- `backend/src/routes/promptRouter.ts`, `backend/src/services/IntegrationsServices/OpenAiService.ts`
- `backend/src/services/WbotServices/wbotMessageListener.ts` — `handleMessageIntegration`, `verifyQueue`, `flowbuilderIntegration`, `handleOpenAi` (prompt na conexão)
- `backend/src/services/TypebotServices/typebotListener.ts` — API Typebot + `#`
- `backend/src/services/QueueIntegrationServices/CreateSessionDialogflow.ts` — cliente Dialogflow
- `backend/src/services/QueueIntegrationServices/QueryDialogflow.ts` — `detectIntent`
- `backend/src/services/WebhookService/ActionsWebhookService.ts` — motor do Flowbuilder
- `backend/src/controllers/QueueIntegrationController.ts` — CRUD + teste Dialogflow
- `backend/src/controllers/WebHookController.ts` — Meta
- `frontend/src/pages/QueueIntegration/index.js` — lista
- `frontend/src/components/QueueIntegrationModal/index.js` — formulário por tipo
- `frontend/src/pages/GlobalConfig/index.js`, `backend/src/controllers/GlobalConfigController.ts`, `backend/src/helpers/GetGlobalConfig.ts`

---

## 12. Configurações globais (`/global-config`)

Página do painel: **`http://localhost:3000/global-config`** (`frontend/src/pages/GlobalConfig/index.js`). Centraliza parâmetros que afectam **toda a plataforma** (pagamentos, e-mail transaccional, trial de novas empresas e aparência do login). O menu lateral mostra **“Configurações Globais”** apenas se o utilizador tiver **`user.super`** (`MainListItems.js`).

### 12.1 Quem pode ver e quem pode gravar

| Acção | Regra no backend (`GlobalConfigController`) |
|--------|---------------------------------------------|
| **GET** `/global-config` | Qualquer utilizador autenticado (`isAuth`). A resposta usa `GetGlobalConfig(req.user.companyId)` — valores efectivos dependem da empresa do token. |
| **PUT** `/global-config` | **Super** **ou** **admin** com **`companyId === 1`**. Outros perfis recebem `403`. |
| **POST** `/global-config/upload` | Mesma regra que o PUT (logo/capa do login). |
| **GET** `/global-config/public-branding` | **Público** (sem login). Usado pelo ecrã de login e por páginas que precisam de logo/capa/link WhatsApp antes da autenticação. |

### 12.2 Abas do painel e campos

1. **Mercado Pago**  
   - **Access Token** (`mpAccessToken`): token da conta principal usada para fluxos que chamam a API do Mercado Pago (ex.: `SubscriptionController` com `GetGlobalConfig()`).  
   - O texto da UI indica que **as empresas clientes** usam esta configuração global, não tokens por empresa neste fluxo.

2. **E-mail (SMTP)**  
   - **Host**, **Porta**, **Secure** (`"true"` / `"false"` — SSL/TLS vs STARTTLS/normal), **E-mail** (utilizador), **Senha de app**, **Remetente (FROM)**.  
   - Usados por `GetGlobalConfig()` em situações como envio de **redefinição de senha** (`SessionController.forgotPassword` + Nodemailer) e qualquer outro código que leia SMTP global.  
   - **Fallback:** se não estiver preenchido na BD, o helper usa variáveis de ambiente (`MAIL_HOST`, `MAIL_PORT`, `MAIL_SECURE`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`).

3. **Trial / assinatura**  
   - **Dias de teste** (`trialExpiration`): número de dias para novas empresas em self-signup / trial.  
   - Ao gravar, o backend **remove** registos antigos `Setting` com `companyId = 1` e `key = APP_TRIALEXPIRATION`, cria **um** registo novo e ainda faz `process.env.APP_TRIALEXPIRATION = ...` em runtime.  
   - **Prioridade de leitura** (em `GetGlobalConfig`): `.env` → campos na tabela **`Companies`** (empresa alvo, por defeito id `1`) → **`Setting`** `APP_TRIALEXPIRATION` para `companyId: 1` (mais recente por `updatedAt`/`id`).  
   - **Nota:** o comentário no código de `update` menciona que o modelo `Company` pode não ter coluna `trialExpiration` para persistir trial na company — o valor efectivo para lógica de negócio passa sobretudo pelo **Setting** + env.

4. **Login / capa**  
   - **Logo** e **imagem de fundo**: upload via **`POST /global-config/upload`** com `multipart/form-data` (`file` + `field` = `loginLogo` ou `loginBackground`). O Multer grava em `public/` (ou subpasta configurada em `upload`); a API devolve URL relativa (ex. `/public/...`); o frontend prefixa com `REACT_APP_BACKEND_URL`.  
   - **Link do WhatsApp** (`loginWhatsapp`): texto livre, ex. `https://wa.me/5541999999999` — usado no botão de WhatsApp / “Chamar suporte” no login.  
   - Estes três valores são guardados na tabela **`Settings`** com chaves **`LOGIN_LOGO_URL`**, **`LOGIN_BACKGROUND_URL`**, **`LOGIN_WHATSAPP_URL`** e `companyId` igual ao do utilizador que gravou (no fluxo típico, empresa 1).  
   - **Endpoint público** `GET /global-config/public-branding`: chama `GetGlobalConfig(1)` e devolve `loginLogo`, `loginBackground`, `loginWhatsapp` com **defaults** se estiverem vazios (`login-logo-default.png`, `login-background-default.png`, `wa.me` genérico em código).

### 12.3 Como `GetGlobalConfig` monta a configuração

Ficheiro: `backend/src/helpers/GetGlobalConfig.ts`.

Ordem de precedência (por campo, com nuances):

1. Base vinda do **`.env`** (`MP_ACCESS_TOKEN`, `MAIL_*`, `APP_TRIALEXPIRATION`, etc.).  
2. Sobreposição com colunas na **`Companies`** para a empresa passada (por omissão **`companyId` 1**): `mpAccessToken`, `smtpHost`, `smtpPort`, `smtpSecure`, `smtpUser`, `smtpPass`, `smtpFrom`, e `trialExpiration` na company se existir no modelo.  
3. **`Setting`** `APP_TRIALEXPIRATION` com **`companyId: 1`** (sobrescreve dias de trial).  
4. **`Setting`** com chaves `LOGIN_*_URL` para o `companyConfigId` pedido (branding).

Assim, podes ter **.env** como rede de segurança em desenvolvimento e **painel** como fonte de verdade em produção, desde que a empresa 1 (e super/admin 1) estejam correctamente configurados.

### 12.4 Fluxo recomendado de configuração

1. Entrar com utilizador **super** (ou admin da empresa **1**).  
2. Abrir **`/global-config`**.  
3. Preencher **SMTP** e testar **esqueci a senha** ou outro e-mail automático.  
4. Se usas **Mercado Pago** para assinaturas, colar o **Access Token** válido.  
5. Ajustar **dias de trial** conforme política comercial.  
6. Opcional: enviar **logo** e **capa** e definir **WhatsApp** de suporte; validar no **login anónimo** (aba anónima) chamando `public-branding` ou só recarregando `/login`.  
7. Clicar **Salvar** (um único botão grava todas as abas — o estado é um único objecto `config` no formulário).

### 12.5 Relação com outras partes deste guia

- **Recuperação de senha** (`docs/RECUPERACAO-SENHA.md`): depende de **SMTP** disponível — muitas vezes o mesmo definido aqui ou no `.env`.  
- **Integrações de fila / prompts**: não são configuradas nesta página; continuam em `/queue-integration` e `/prompts`.  
- **Multi-tenant:** hoje o branding público usa **`GetGlobalConfig(1)`** fixo; evoluir para multi-domínio exigiria alinhar `publicBranding` com hostname ou `companyId` resolvido.

### 12.6 Ficheiros relevantes

- `frontend/src/pages/GlobalConfig/index.js` — UI e tabs.  
- `backend/src/routes/globalConfigRoutes.ts` — rotas + Multer no upload.  
- `backend/src/controllers/GlobalConfigController.ts` — permissões, persistência, `publicBranding`.  
- `backend/src/helpers/GetGlobalConfig.ts` — leitura unificada para o resto do backend.

---

Este documento descreve o comportamento **atual** do repositório; evoluções (ex.: webhook com resposta síncrona) seriam alterações novas de produto.
