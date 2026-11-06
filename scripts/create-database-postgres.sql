-- Executar como superutilizador PostgreSQL (ex.: usuário postgres).
-- Windows (PowerShell, após instalar PostgreSQL e adicionar ao PATH):
--   psql -U postgres -f scripts/create-database-postgres.sql
-- Linux:
--   sudo -u postgres psql -f scripts/create-database-postgres.sql

-- Ajuste a senha se não usar os valores do docker-compose / .env.example

CREATE USER atlas WITH PASSWORD 'atlas_dev_secret';
CREATE DATABASE atlas_digital OWNER atlas;
GRANT ALL PRIVILEGES ON DATABASE atlas_digital TO atlas;
