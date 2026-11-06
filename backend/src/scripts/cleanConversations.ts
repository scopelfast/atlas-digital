/**
 * Apaga dados de conversas WhatsApp (tickets + mensagens + derivações).
 *
 * Uso (na pasta backend):
 *   npx ts-node-dev --transpile-only src/scripts/cleanConversations.ts
 *
 * Variáveis de ambiente:
 *   DRY_RUN=1              — só mostra contagens, não apaga
 *   COMPANY_ID=1           — só tickets/mensagens dessa empresa (omitir = todas)
 *   INCLUDE_INTERNAL_CHAT=1 — também apaga Chats / ChatMessages / ChatUsers (chat interno)
 *   CONFIRM=YES_I_UNDERSTAND — obrigatório para executar delete (sem isto, o script termina)
 *
 * Requer as mesmas variáveis de base que o servidor (.env / config/database).
 */

import { Op } from "sequelize";
import sequelize from "../database";
import Message from "../models/Message";
import Ticket from "../models/Ticket";
import UserRating from "../models/UserRating";
import LogTicket from "../models/LogTicket";
import TicketNote from "../models/TicketNote";
import TicketTag from "../models/TicketTag";
import TicketTraking from "../models/TicketTraking";
import Schedule from "../models/Schedule";
import Chat from "../models/Chat";
import ChatUser from "../models/ChatUser";
import ChatMessage from "../models/ChatMessage";

async function main() {
  const dryRun = process.env.DRY_RUN === "1";
  const companyIdRaw = process.env.COMPANY_ID;
  const companyId =
    companyIdRaw !== undefined && companyIdRaw !== ""
      ? parseInt(companyIdRaw, 10)
      : null;
  const internalChat = process.env.INCLUDE_INTERNAL_CHAT === "1";
  const confirmed = process.env.CONFIRM === "YES_I_UNDERSTAND";

  if (!dryRun && !confirmed) {
    console.error(
      "Abortado: defina CONFIRM=YES_I_UNDERSTAND para apagar dados (ou DRY_RUN=1 para simular)."
    );
    process.exit(1);
  }

  const ticketWhere =
    companyId != null && !Number.isNaN(companyId)
      ? { companyId }
      : undefined;

  const tickets = await Ticket.findAll({
    attributes: ["id"],
    where: ticketWhere,
  });
  const ticketIds = tickets.map((t) => t.id);

  console.log(
    `[cleanConversations] Tickets a afetar: ${ticketIds.length}` +
      (companyId != null ? ` (companyId=${companyId})` : " (todas as empresas)")
  );

  if (ticketIds.length === 0 && !internalChat) {
    console.log("Nada a fazer (zero tickets e chat interno não pedido).");
    process.exit(0);
  }

  const countModel = async (label: string, fn: () => Promise<number>) => {
    const n = await fn();
    console.log(`  ${label}: ${n}`);
    return n;
  };

  if (ticketIds.length > 0) {
    await countModel("Messages", () =>
      Message.count({ where: { ticketId: { [Op.in]: ticketIds } } })
    );
    await countModel("UserRatings", () =>
      UserRating.count({ where: { ticketId: { [Op.in]: ticketIds } } })
    );
    await countModel("LogTickets", () =>
      LogTicket.count({ where: { ticketId: { [Op.in]: ticketIds } } })
    );
    await countModel("TicketNotes", () =>
      TicketNote.count({ where: { ticketId: { [Op.in]: ticketIds } } })
    );
    await countModel("TicketTags", () =>
      TicketTag.count({ where: { ticketId: { [Op.in]: ticketIds } } })
    );
    await countModel("TicketTraking", () =>
      TicketTraking.count({ where: { ticketId: { [Op.in]: ticketIds } } })
    );
    await countModel("Schedules com ticketId ligado", () =>
      Schedule.count({ where: { ticketId: { [Op.in]: ticketIds } } })
    );
  }

  if (internalChat) {
    const chatWhere =
      companyId != null && !Number.isNaN(companyId)
        ? { companyId }
        : undefined;
    await countModel("Chats", () => Chat.count({ where: chatWhere }));
  }

  if (dryRun) {
    console.log("DRY_RUN=1 — nenhuma alteração feita.");
    process.exit(0);
  }

  const t = await sequelize.transaction();
  try {
    if (ticketIds.length > 0) {
      await Message.update(
        { quotedMsgId: null },
        {
          where: { ticketId: { [Op.in]: ticketIds } },
          transaction: t,
        }
      );

      await Message.destroy({
        where: { ticketId: { [Op.in]: ticketIds } },
        transaction: t,
      });
      await UserRating.destroy({
        where: { ticketId: { [Op.in]: ticketIds } },
        transaction: t,
      });
      await LogTicket.destroy({
        where: { ticketId: { [Op.in]: ticketIds } },
        transaction: t,
      });
      await TicketNote.destroy({
        where: { ticketId: { [Op.in]: ticketIds } },
        transaction: t,
      });
      await TicketTag.destroy({
        where: { ticketId: { [Op.in]: ticketIds } },
        transaction: t,
      });
      await TicketTraking.destroy({
        where: { ticketId: { [Op.in]: ticketIds } },
        transaction: t,
      });

      await Schedule.update(
        { ticketId: null },
        { where: { ticketId: { [Op.in]: ticketIds } }, transaction: t }
      );

      await Ticket.destroy({
        where: { id: { [Op.in]: ticketIds } },
        transaction: t,
      });
    }

    if (internalChat) {
      const chatWhere =
        companyId != null && !Number.isNaN(companyId)
          ? { companyId }
          : undefined;
      const chats = await Chat.findAll({
        attributes: ["id"],
        where: chatWhere,
        transaction: t,
      });
      const chatIds = chats.map((c) => c.id);
      if (chatIds.length > 0) {
        await ChatMessage.destroy({
          where: { chatId: { [Op.in]: chatIds } },
          transaction: t,
        });
        await ChatUser.destroy({
          where: { chatId: { [Op.in]: chatIds } },
          transaction: t,
        });
        await Chat.destroy({
          where: { id: { [Op.in]: chatIds } },
          transaction: t,
        });
      }
    }

    await t.commit();
    console.log("Concluído com sucesso.");
  } catch (e) {
    await t.rollback();
    console.error(e);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();
