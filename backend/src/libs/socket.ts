import { Server as SocketIO } from "socket.io";
import { Server } from "http";
import AppError from "../errors/AppError";
import logger from "../utils/logger";
import { instrument } from "@socket.io/admin-ui";
import { z } from "zod";
import jwt from "jsonwebtoken";

// Define namespaces permitidos
const ALLOWED_NAMESPACES = /^\/workspace-\d+$/;

// Esquemas de validação
const ticketIdSchema = z.string().uuid();
const statusSchema = z.enum(["open", "closed", "pending"]);

/** Token de acesso REST (CreateTokens): id, companyId, profile, usarname — não usa userId UUID */
const accessTokenPayloadSchema = z
  .object({
    id: z.union([z.number(), z.string()]),
    companyId: z.union([z.number(), z.string()]).optional(),
    profile: z.string().optional(),
    usarname: z.string().optional(),
    username: z.string().optional(),
    iat: z.number().optional(),
    exp: z.number().optional()
  })
  .passthrough();

// Origens CORS permitidas (localhost e 127.0.0.1 são Origins diferentes no browser)
const DEFAULT_FRONTEND_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"];

function mergeFrontendOrigins(): string[] {
  const fromEnv = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map((url) => url.trim()).filter(Boolean)
    : [];
  return [...new Set([...DEFAULT_FRONTEND_ORIGINS, ...fromEnv])];
}

const MERGED_ALLOW_LIST = mergeFrontendOrigins();

/** Em produção, regex LAN só se SOCKET_CORS_DEV_LAN=true (evita CORS aberto na internet). */
const ALLOW_LAN_PRIVATE_ORIGIN =
  process.env.NODE_ENV !== "production" || process.env.SOCKET_CORS_DEV_LAN === "true";

/** http://<RFC1918>:3000 — típico CRA em dev na rede local */
const LAN_PRIVATE_ORIGIN_REGEX =
  /^http:\/\/(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}):3000$/;

function isSocketOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;
  if (MERGED_ALLOW_LIST.includes(origin)) return true;
  if (ALLOW_LAN_PRIVATE_ORIGIN && LAN_PRIVATE_ORIGIN_REGEX.test(origin)) return true;
  return false;
}

// Ajuste da classe AppError para compatibilidade com Error
class SocketCompatibleAppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
    this.name = "AppError";
    // Garante que a stack trace seja capturada
    Error.captureStackTrace?.(this, SocketCompatibleAppError);
  }
}

let io: SocketIO;

export const initIO = (httpServer: Server): SocketIO => {
  io = new SocketIO(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isSocketOriginAllowed(origin)) {
          callback(null, true);
        } else {
          logger.warn(`Origem não autorizada: ${origin}`);
          callback(new SocketCompatibleAppError("Violação da política CORS", 403));
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
    maxHttpBufferSize: 1e6, // Limita payload a 1MB
    pingTimeout: 20000,
    pingInterval: 25000,
  });

  // Middleware de autenticação JWT
  io.use((socket, next) => {
    const token = socket.handshake.query.token as string;
    if (!token) {
      logger.warn("Tentativa de conexão sem token");
      return next(new SocketCompatibleAppError("Token ausente", 401));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
      const validatedPayload = accessTokenPayloadSchema.parse(decoded);
      socket.data.user = validatedPayload;
      next();
    } catch (err) {
      logger.warn("Token inválido");
      return next(new SocketCompatibleAppError("Token inválido", 401));
    }
  });

  // Admin UI apenas em desenvolvimento
  const isAdminEnabled = process.env.SOCKET_ADMIN === "true" && process.env.NODE_ENV !== "production";
  if (isAdminEnabled && process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
    try {
      instrument(io, {
        auth: {
          type: "basic",
          username: process.env.ADMIN_USERNAME,
          password: process.env.ADMIN_PASSWORD,
        },
        mode: "development",
        readonly: true,
      });
      logger.info("Socket.IO Admin UI inicializado em modo de desenvolvimento");
    } catch (error) {
      logger.error("Falha ao inicializar Socket.IO Admin UI", error);
    }
  } else if (isAdminEnabled) {
    logger.warn("Credenciais de administrador ausentes, Admin UI não inicializado");
  }

  // Namespaces dinâmicos com validação
  const workspaces = io.of((name, auth, next) => {
    if (ALLOWED_NAMESPACES.test(name)) {
      next(null, true);
    } else {
      logger.warn(`Tentativa de conexão a namespace inválido: ${name}`);
      next(new SocketCompatibleAppError("Namespace inválido", 403), false);
    }
  });

  workspaces.on("connection", (socket) => {
    const clientIp = socket.handshake.address;

    // Query userId = id numérico do utilizador (igual ao frontend), não UUID
    const rawUserId = socket.handshake.query.userId;
    let userId: string | undefined;
    if (rawUserId !== undefined && rawUserId !== null && String(rawUserId) !== "") {
      const s = String(rawUserId);
      if (!/^\d+$/.test(s)) {
        socket.disconnect(true);
        logger.warn(`userId inválido de ${clientIp}`);
        return;
      }
      userId = s;
    }

    logger.info(`Cliente conectado ao namespace ${socket.nsp.name} (IP: ${clientIp})`);

    /** O front usa muitas vezes emit(...) sem ack; não invocar se não for função */
    const ackIfFn = (cb: unknown, err?: string): void => {
      if (typeof cb !== "function") return;
      const fn = cb as (e?: string) => void;
      if (err !== undefined) fn(err);
      else fn();
    };

    socket.on("joinChatBox", (ticketId: string, callback?: (error?: string) => void) => {
      try {
        const validatedTicketId = ticketIdSchema.parse(ticketId);
        socket.join(validatedTicketId);
        logger.info(`Cliente entrou no canal de ticket ${validatedTicketId} no namespace ${socket.nsp.name}`);
        ackIfFn(callback);
      } catch (error) {
        logger.warn(`ticketId inválido: ${ticketId}`);
        ackIfFn(callback, "ID de ticket inválido");
      }
    });

    socket.on("joinNotification", (...args: unknown[]) => {
      socket.join("notification");
      logger.info(`Cliente entrou no canal de notificações no namespace ${socket.nsp.name}`);
      const ack = args.filter((a) => typeof a === "function").pop();
      ackIfFn(ack);
    });

    socket.on("joinTickets", (status: string, callback?: (error?: string) => void) => {
      try {
        const validatedStatus = statusSchema.parse(status);
        socket.join(validatedStatus);
        logger.info(`Cliente entrou no canal ${validatedStatus} no namespace ${socket.nsp.name}`);
        ackIfFn(callback);
      } catch (error) {
        logger.warn(`Status inválido: ${status}`);
        ackIfFn(callback, "Status inválido");
      }
    });

    socket.on("joinTicketsLeave", (status: string, callback?: (error?: string) => void) => {
      try {
        const validatedStatus = statusSchema.parse(status);
        socket.leave(validatedStatus);
        logger.info(`Cliente saiu do canal ${validatedStatus} no namespace ${socket.nsp.name}`);
        ackIfFn(callback);
      } catch (error) {
        logger.warn(`Status inválido: ${status}`);
        ackIfFn(callback, "Status inválido");
      }
    });

    socket.on("joinChatBoxLeave", (ticketId: string, callback?: (error?: string) => void) => {
      try {
        const validatedTicketId = ticketIdSchema.parse(ticketId);
        socket.leave(validatedTicketId);
        logger.info(`Cliente saiu do canal de ticket ${validatedTicketId} no namespace ${socket.nsp.name}`);
        ackIfFn(callback);
      } catch (error) {
        logger.warn(`ticketId inválido: ${ticketId}`);
        ackIfFn(callback, "ID de ticket inválido");
      }
    });

    socket.on("disconnect", () => {
      logger.info(`Cliente desconectado do namespace ${socket.nsp.name} (IP: ${clientIp})`);
    });

    socket.on("error", (error) => {
      logger.error(`Erro no socket do namespace ${socket.nsp.name}: ${error.message}`);
    });
  });

  return io;
};

export const getIO = (): SocketIO => {
  if (!io) {
    throw new SocketCompatibleAppError("Socket IO não inicializado", 500);
  }
  return io;
};