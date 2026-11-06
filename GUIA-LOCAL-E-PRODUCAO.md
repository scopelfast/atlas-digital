# Atlas Digital — desenvolvimento local e produção

Este guia cobre **rodar na tua máquina** (prioridade para quem está a desenvolver) e, no final, **colocar no ar** num servidor.

---

## Parte 1 — Desenvolvimento local (Windows / geral)

### O que precisas instalado

- **Node.js** (LTS recomendado)
- **PostgreSQL** (ex.: 18 no Windows)
- **Redis** à escuta na porta **6379** (obrigatório para filas Bull e sessão WhatsApp/Baileys)
- Opcional: **Docker Desktop** — na raiz existe `docker-compose.yml` com PostgreSQL + Redis só para desenvolvimento

### 1. Base de dados PostgreSQL

- Copia `backend/.env.example` para `backend/.env` e ajusta `DB_*` (nome da base, utilizador, password).
- **Windows (PowerShell):** com a password do superutilizador `postgres`, podes automatizar role, base, migrações e seeds:

  ```powershell
  $env:PG_POSTGRES_PASSWORD = "a_tua_senha_postgres"
  Set-Location C:\caminho\para\atlas-digital
  .\scripts\Setup-AtlasDigitalDatabase.ps1
  ```

- Alternativa manual: SQL em `scripts/create-database-postgres.sql` (executar no pgAdmin como `postgres`) e depois, na pasta `backend`:

  ```bash
  npm install --legacy-peer-deps
  npm run build
  npm run db:migrate
  npm run db:seed
  ```

- Utilizador inicial após seed (no código do seed): **admin@admin.com** / **123456** (o README antigo menciona outra senha; confirma sempre o que está em `backend/src/database/seeds/`).

### 2. Redis local

Sem Redis verás erros do tipo `ECONNREFUSED 127.0.0.1:6379`.

- Se tiveres Docker: `docker compose up -d` na raiz (sobe Postgres + Redis; alinha `DB_*` no `.env` com o compose).
- Ou instala Redis para Windows / WSL / outro serviço na **6379**, coerente com `REDIS_URI` no `backend/.env`.

### 3. Backend (`backend/.env`)

- `BACKEND_URL` e `FRONTEND_URL` devem refletir onde vais abrir API e painel (ex. `http://localhost:8080` e `http://localhost:3000`).
- `JWT_SECRET` e `JWT_REFRESH_SECRET`: usa strings longas e aleatórias (não uses placeholders em ambiente partilhado).
- Se mudares `PORT`, atualiza também o URL do frontend abaixo.

### 4. Frontend

- Na pasta `frontend` existe `.npmrc` com `legacy-peer-deps=true` para evitar conflitos de peer dependencies ao correr `npm install`.
- O `package.json` do frontend define **`"proxy": "http://localhost:8090"`** (ajusta se mudares a porta da API). Com isso, em desenvolvimento podes usar **`REACT_APP_BACKEND_URL` vazio**: os pedidos HTTP vão para `http://localhost:3000/...` e o dev server reencaminha para o backend. Assim o cookie **httpOnly** do refresh token (`jrt`) fica em **first-party** e o `POST /auth/refresh_token` deixa de falhar com 401 por causa do **SameSite** entre portas diferentes.
- `frontend/.env` típico em dev (o repositório inclui exemplo):

  ```env
  REACT_APP_BACKEND_URL=
  REACT_APP_SOCKET_URL=http://localhost:8090
  ```

  O **Socket.IO** continua a ligar directamente ao host/porta do backend (`REACT_APP_SOCKET_URL`). Em produção, define `REACT_APP_BACKEND_URL` e `REACT_APP_SOCKET_URL` com o URL HTTPS real da API (sem proxy).

- Instalação e arranque:

  ```bash
  cd frontend
  npm install
  npm start
  ```

### 5. Arrancar o backend

```bash
cd backend
npm install --legacy-peer-deps
npm run dev:server
```

Ou, com TypeScript já compilado: `npm run build` e `npm start`.

### 6. Problemas frequentes (local)

| Sintoma | O que fazer |
|--------|-------------|
| `EADDRINUSE ... :8080` | Já há outro processo na 8080 (muitas vezes um `node` antigo). `netstat -ano \| findstr :8080` → `taskkill /PID <pid> /F` (em PowerShell **como administrador** se der “Acesso negado”). Alternativa: mudar `PORT`, `BACKEND_URL` no `backend/.env` e `REACT_APP_BACKEND_URL` no `frontend/.env` para a mesma porta (ex.: **8090**). |
| `ECONNREFUSED ... :6379` | Arranca o Redis. |
| `npm install` no frontend falha (peer deps) | Usa `frontend/.npmrc` ou `npm install --legacy-peer-deps`. |
| pgAdmin / `postgres` password failed | Password errada ou credenciais em cache; recria a ligação no pgAdmin ou usa o utilizador da app (`DB_USER` / `DB_PASS`) na base `DB_NAME`. |
| `Unexpected token 'e', "eyJhbGciOi"... is not valid JSON` no React | Token antigo no `localStorage` sem formato JSON; o código já aceita os dois formatos. Limpa o site (DevTools → Application → Local Storage → apagar `token`) e volta a fazer login. |

---

## Parte 2 — Colocar no ar (produção)

### Requisitos típicos (README original do projeto)

- **Ubuntu 22.04** na VPS (recomendado pelo instalador)
- **~4 vCPU, ~4 GB RAM**, disco SSD (~100 GB indicado)
- **Dois subdomínios** a apontar para o IP da VPS:
  - Frontend: `app.seudominio.com`
  - API: `api.seudominio.com`
- Verificar propagação DNS (ex.: [dnschecker.org](https://dnschecker.org))

### Instalador `zappro`

Na raiz do projeto existe a pasta `zappro` com script interativo:

```bash
cd ./zappro && sudo chmod +x zappro && sudo ./zappro
```

O script pede URLs, portas, limites de conexões WhatsApp, utilizadores, etc. **Nota:** o fluxo histórico deste instalador pode estar ligado a pacotes tipo Whaticket (zip); se o teu deploy for **apenas o repositório Git**, valida no servidor se precisas de adaptar o script ou fazer deploy manual (git clone, `npm run build`, PM2, Nginx, Certbot).

### Checklist mínima em produção

- `BACKEND_URL` / `FRONTEND_URL` em **HTTPS** com os domínios reais.
- PostgreSQL e Redis **não expostos** à internet sem necessidade; Redis com password se acessível na rede.
- JWT e passwords da base **fortes e únicas**.
- **Frontend:** `npm run build` com `REACT_APP_BACKEND_URL=https://api.seudominio.com` definido **antes** do build (valores `REACT_APP_*` ficam “congelados” no build do Create React App).
- Firewall: **80**, **443** (e SSH); Nginx como reverse proxy; certificados **Let’s Encrypt** (Certbot).

### Credenciais iniciais

O README antigo referia **admin@admin.com** / **adminpro**; em instalações com os seeds deste repo o utilizador seed usa password **123456**. **Altera a password** logo após o primeiro login em produção.

---

## Ficheiros úteis

| Ficheiro | Função |
|----------|--------|
| `backend/.env.example` | Modelo de variáveis do backend |
| `frontend/.npmrc` | `legacy-peer-deps` para `npm install` |
| `docker-compose.yml` | Postgres + Redis locais |
| `scripts/Setup-AtlasDigitalDatabase.ps1` | Setup DB no Windows (PowerShell) |
| `scripts/create-database-postgres.sql` | SQL manual (pgAdmin / psql) |
| `zappro/` | Instalador para VPS (Ubuntu) |

---

*Documento gerado para alinhar desenvolvimento local e deploy; ajusta caminhos e passwords ao teu ambiente.*
