-- =============================================================================
-- Limpar conversas WhatsApp (tickets, mensagens e tabelas relacionadas)
-- PostgreSQL — faça BACKUP antes. Nenhum DELETE está ativo por defeito.
--
-- Passos:
-- 1. Escolha UM dos blocos abaixo (empresa OU global), descomente as linhas.
-- 2. Se usar "por empresa", substitua 1 pelo companyId desejado em todos os sítios.
-- 3. Opcional: descomente o bloco "Chat interno".
-- 4. Execute no psql ou cliente SQL.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- A) POR EMPRESA (substitua 1 pelo companyId)
-- -----------------------------------------------------------------------------
/*
UPDATE "Messages" m
SET "quotedMsgId" = NULL
FROM "Tickets" t
WHERE m."ticketId" = t.id AND t."companyId" = 1;

DELETE FROM "Messages" m
USING "Tickets" t
WHERE m."ticketId" = t.id AND t."companyId" = 1;

DELETE FROM "UserRatings" ur
USING "Tickets" t
WHERE ur."ticketId" = t.id AND t."companyId" = 1;

DELETE FROM "LogTickets" l
USING "Tickets" t
WHERE l."ticketId" = t.id AND t."companyId" = 1;

DELETE FROM "TicketNotes" n
USING "Tickets" t
WHERE n."ticketId" = t.id AND t."companyId" = 1;

DELETE FROM "TicketTags" tt
USING "Tickets" t
WHERE tt."ticketId" = t.id AND t."companyId" = 1;

DELETE FROM "TicketTraking" tr
USING "Tickets" t
WHERE tr."ticketId" = t.id AND t."companyId" = 1;

UPDATE "Schedules" s
SET "ticketId" = NULL
FROM "Tickets" t
WHERE s."ticketId" = t.id AND t."companyId" = 1;

DELETE FROM "Tickets" WHERE "companyId" = 1;
*/

-- -----------------------------------------------------------------------------
-- B) GLOBAL — todas as empresas (descomente só se tiver a certeza)
-- -----------------------------------------------------------------------------
/*
UPDATE "Messages" SET "quotedMsgId" = NULL;

DELETE FROM "Messages";
DELETE FROM "UserRatings";
DELETE FROM "LogTickets";
DELETE FROM "TicketNotes";
DELETE FROM "TicketTags";
DELETE FROM "TicketTraking";

UPDATE "Schedules" SET "ticketId" = NULL WHERE "ticketId" IS NOT NULL;

DELETE FROM "Tickets";
*/

-- -----------------------------------------------------------------------------
-- C) OPCIONAL: chat interno (Chats / ChatMessages / ChatUsers)
-- -----------------------------------------------------------------------------
/*
DELETE FROM "ChatMessages";
DELETE FROM "ChatUsers";
DELETE FROM "Chats";
*/

-- Se nada acima estava descomentado, não há alterações úteis:
-- descomente A, B ou C antes do COMMIT.
COMMIT;

-- Após apagar muito volume, opcionalmente realinhar sequências:
-- SELECT setval(pg_get_serial_sequence('"Tickets"', 'id'), COALESCE((SELECT MAX(id) FROM "Tickets"), 1), true);
-- SELECT setval(pg_get_serial_sequence('"Messages"', 'id'), COALESCE((SELECT MAX(id) FROM "Messages"), 1), true);
