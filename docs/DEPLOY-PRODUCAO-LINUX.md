# Deploy em produção (Linux) — Atlas Digital

Guia prático para publicar o Atlas Digital em Linux (Ubuntu) com **Nginx + PM2**, sem subir `node_modules` do ambiente local.

---

## Primeiros passos (rápido)

Se já tens servidor Linux pronto e queres só o essencial:

```bash
# backend
cd /var/www/atlas/backend && npm ci --omit=dev && npm run build && npm run db:migrate
pm2 start dist/server.js --name atlas-backend && pm2 save

# frontend
cd /var/www/atlas/frontend && npm ci && npm run build
sudo systemctl reload nginx
```

Depois valida:

- app abre no domínio
- login funciona
- socket conecta
- API responde sem erro

---

## 1) O que subir para o servidor

Suba **código-fonte + arquivos necessários**, e instale dependências no servidor.

### Não subir

- `frontend/node_modules`
- `backend/node_modules`
- `.git`
- caches temporários

### Subir

- `frontend/src`, `frontend/public`, `frontend/package*.json`
- `backend/src`, `backend/package*.json`
- `backend/public` (se já tiver mídias/arquivos importantes)
- arquivos de configuração e docs que desejar manter

---

## 2) Pré-requisitos no servidor (Ubuntu)

```bash
sudo apt update
sudo apt install -y nginx redis-server postgresql postgresql-contrib
```

Node.js (LTS) + PM2:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm i -g pm2
```

Verificação:

```bash
node -v
npm -v
pm2 -v
```

---

## 3) Estrutura recomendada

Exemplo de diretórios:

- `/var/www/atlas/backend`
- `/var/www/atlas/frontend`

Descompacte o projeto nessas pastas.

---

## 4) Banco de dados e Redis

Confirme que Postgres e Redis estão ativos:

```bash
sudo systemctl status postgresql
sudo systemctl status redis-server
```

Crie database/usuário conforme seu `.env` do backend.

---

## 5) Configurar backend

Na pasta do backend:

```bash
cd /var/www/atlas/backend
npm ci --omit=dev
npm run build
```

Crie/ajuste `backend/.env` (exemplo mínimo):

```env
PORT=8090
FRONTEND_URL=https://seu-dominio.com

DB_DIALECT=postgres
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=atlas

JWT_SECRET=troque_este_valor
JWT_REFRESH_SECRET=troque_este_valor_tambem

REDIS_URI=redis://127.0.0.1:6379
```

Se usar recursos adicionais, configure também:

- SMTP (`MAIL_*`)
- Mercado Pago
- OpenAI/Gemini
- Meta/Facebook
- Sentry (`SENTRY_DSN`)

Rode migrações:

```bash
npm run db:migrate
```

Suba backend com PM2:

```bash
pm2 start dist/server.js --name atlas-backend
pm2 save
pm2 startup
```

---

## 6) Configurar frontend

Na pasta do frontend:

```bash
cd /var/www/atlas/frontend
npm ci
npm run build
```

Build final:

- `/var/www/atlas/frontend/build`

Se o projeto usa variáveis `REACT_APP_*`, defina antes do build.

---

## 7) Configurar Nginx (SPA + API + Socket)

Arquivo: `/etc/nginx/sites-available/atlas`

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    root /var/www/atlas/frontend/build;
    index index.html;

    # Frontend SPA
    location / {
        try_files $uri /index.html;
    }

    # API backend
    location /api/ {
        proxy_pass http://127.0.0.1:8090/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Socket.IO
    location /socket.io/ {
        proxy_pass http://127.0.0.1:8090/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Ativar e validar:

```bash
sudo ln -s /etc/nginx/sites-available/atlas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 8) HTTPS com Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

---

## 9) Checklist pós-deploy

- `pm2 status` mostra `atlas-backend` online
- backend responde localmente em `http://127.0.0.1:8090`
- frontend abre pelo domínio
- login funciona
- socket conecta
- envio/recebimento de mensagens funciona
- recuperação de senha (SMTP) funciona
- fluxo de NPS funciona (nota 0..10)

---

## 10) Atualização de versão (rotina)

### Backend

```bash
cd /var/www/atlas/backend
npm ci --omit=dev
npm run build
npm run db:migrate
pm2 restart atlas-backend
```

### Frontend

```bash
cd /var/www/atlas/frontend
npm ci
npm run build
sudo systemctl reload nginx
```

---

## 11) Problemas comuns

- **`ECONNREFUSED` no frontend**: backend não está no ar ou porta errada.
- **Socket não conecta**: revisar bloco `/socket.io/` no Nginx.
- **Build frontend sem variáveis**: definir `REACT_APP_*` antes de `npm run build`.
- **NPS não atualiza**: validar escala **0..10** e resposta numérica do cliente.
- **Projeto “muito grande”**: nunca subir `node_modules` local; instalar no servidor com `npm ci`.

---

## 12) Segurança mínima recomendada

- usar senha forte no Postgres
- firewall liberando apenas portas necessárias (80/443)
- `JWT_SECRET` e demais segredos fora do código
- backups de banco e `backend/public/company*`
- monitorar logs do PM2 e Nginx

