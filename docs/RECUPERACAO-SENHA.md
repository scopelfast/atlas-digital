# Recuperação de senha (“esqueci a senha”)

Documento de referência para configurar, testar e evoluir o fluxo de redefinição de senha no Atlas Digital.

## Visão geral do fluxo

1. O utilizador acede a **Esqueceu a senha?** no login e indica o **email**.
2. O backend gera um **token** (válido ~30 minutos), guarda na base de dados e envia um **email** com link para o frontend.
3. O utilizador abre o link (`/reset-password?token=...`), define a **nova senha** e submete.
4. O backend valida o token, atualiza a password e limpa o token.

## Onde está implementado

| Camada | Ficheiro / rota |
|--------|------------------|
| Rotas auth | `backend/src/routes/authRoutes.ts` — `POST /auth/forgot-password`, `POST /auth/reset-password` |
| Lógica | `backend/src/controllers/SessionController.ts` — `forgotPassword`, `resetPassword` |
| Modelo | `backend/src/models/User.ts` — `passwordResetToken`, `passwordResetExpires` |
| Email SMTP | `GetGlobalConfig()` (usado em `forgotPassword`) |
| UI pedido | `frontend/src/pages/ForgetPassWord/index.js` — rota `/forgot-password` |
| UI nova senha | `frontend/src/pages/ResetPassword/index.js` — rota `/reset-password` |
| Rotas React | `frontend/src/routes/index.js` |
| Link no login | `frontend/src/pages/Login/index.js` → `/forgot-password` |

## Variáveis de ambiente (backend)

- **`FRONTEND_URL`**: URL base onde o utilizador abre a aplicação (ex.: `http://localhost:3000` ou `https://app.exemplo.pt`). O email usa: `{FRONTEND_URL}/reset-password?token={token}`.
- **SMTP**: configurado via `GetGlobalConfig()` (credenciais globais / painel). Sem SMTP válido, o pedido de recuperação falha ao enviar o email.

Confirmar também `frontend/.env`:

- **`REACT_APP_BACKEND_URL`**: API acessível pelo browser (para `api.post("/auth/...")`).

## Contrato das APIs

### `POST /auth/forgot-password`

**Body:** `{ "email": "utilizador@exemplo.com" }`

**Respostas típicas:**

- `200` — Email enviado (no código atual, se o email **não** existir devolve `404` com mensagem explícita).
- `404` — Email não encontrado.
- `500` — Erro ao enviar email (SMTP).

### `POST /auth/reset-password`

**Body:** `{ "token": "...", "newPassword": "..." }`

**Respostas típicas:**

- `200` — Senha redefinida.
- `400` — Token inválido ou expirado.

## Base de dados

Garantir que a tabela de utilizadores tem colunas compatíveis com o modelo (nomes podem variar conforme migrações Sequelize):

- `passwordResetToken` (string, nullable)
- `passwordResetExpires` (datetime, nullable)

Se faltar coluna, criar migração antes de usar em produção.

## Checklist para colocar a funcionar

- [ ] `FRONTEND_URL` no `.env` do backend coincide com o URL real do frontend (inclui `http`/`https` e porta se aplicável).
- [ ] SMTP operacional e credenciais corretas em `GetGlobalConfig`.
- [ ] Migrações aplicadas; colunas de reset existem.
- [ ] Teste manual: pedido → receber email → abrir link → nova senha → login com nova senha.
- [ ] Se o acesso for por IP na LAN, o link do email deve usar um host que o utilizador consiga abrir (evitar `localhost` no email se o utilizador estiver noutro dispositivo).

## Melhorias opcionais (backlog)

- Resposta **uniforme** em `forgot-password` (sempre mensagem genérica) para não revelar emails registados.
- Guardar **hash** do token na BD em vez do token em texto plano.
- Email em **HTML**, branding e traduções (i18n).
- Rate limiting no endpoint de pedido de reset.
- Política mínima de complexidade da `newPassword` alinhada com o resto da app.

## Notas

- “Reativar” conta, neste fluxo, significa **voltar a ter acesso** via nova senha. Contas desativadas por outro mecanismo (flag `inactive`, etc.) podem precisar de regra extra no `resetPassword` ou num fluxo administrativo separado — validar no modelo `User` e requisitos de negócio.
