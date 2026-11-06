📋 **Guia completo (local + produção):** [GUIA-LOCAL-E-PRODUCAO.md](./GUIA-LOCAL-E-PRODUCAO.md)

📚 **Documentação didática (operador + técnico + integrações):** [docs/README.md](./docs/README.md)

🚀 **Deploy em produção Linux (Nginx + PM2):** [docs/DEPLOY-PRODUCAO-LINUX.md](./docs/DEPLOY-PRODUCAO-LINUX.md)

---

📋 REQUISITOS


✅ UBUNTU 22.04 (OBRIGATÓRIO)
💾 4 CPU / 4 GB RAM
💿 100 GB de armazenamento SSD


🌐 CRIAR SUBDOMÍNIO E APONTAR PARA O IP DA VPS

🔗 URL DO FRONTEND:
➡️ app.seudominio.com

🔗 URL DO BACKEND:
➡️ api.seudominio.com


🔍 CHECAR A PROPAGAÇÃO DO DOMÍNIO
🌐 Acesse: https://dnschecker.org


📁 COPIAR A PASTA zappro PARA O ROOT E EXECUTAR O COMANDO ABAIXO:

🔐 cd ./zappro && sudo chmod +x zappro && sudo ./zappro


🔐 CREDENCIAIS DE ACESSO INICIAIS:
👤 Login: admin@admin.com
🔑 Senha: adminpro