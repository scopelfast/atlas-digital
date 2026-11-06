import React, { useState, useEffect, useContext } from "react";
import clsx from "clsx";
import { alpha, makeStyles, useTheme } from "@material-ui/core/styles";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import Board from "react-trello";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { useHistory } from "react-router-dom";
import { Facebook, Instagram, WhatsApp } from "@material-ui/icons";
import {
  Tooltip,
  Typography,
  Button,
  Box,
  Paper,
  CircularProgress,
} from "@material-ui/core";
import { format, isSameDay, parseISO } from "date-fns";
import { Can } from "../../components/Can";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import { FilterDatePickerField } from "../../components/FilterDatePickerField";
import { usePageListLayoutStyles } from "../../theme/pageListLayoutStyles";

const useStyles = makeStyles((theme) => ({
  boardPaper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    width: "100%",
    backgroundColor:
      theme.palette.type === "light"
        ? theme.palette.grey[50]
        : alpha(theme.palette.background.default, 0.92),
  },
  filterBar: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.25),
    borderRadius: 12,
    backgroundColor:
      theme.palette.type === "light"
        ? alpha(theme.palette.common.white, 0.85)
        : alpha(theme.palette.common.white, 0.03),
    border: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down("xs")]: {
      flexWrap: "wrap",
    },
  },
  /** Datas lado a lado, só a largura necessária */
  filterBarDates: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    gap: theme.spacing(1.5),
    flex: "0 0 auto",
    minWidth: 0,
    [theme.breakpoints.down("xs")]: {
      flexWrap: "wrap",
      width: "100%",
    },
  },
  filterBarSearch: {
    marginLeft: "auto",
    flexShrink: 0,
    alignSelf: "center",
    [theme.breakpoints.down("xs")]: {
      marginLeft: "auto",
      width: "100%",
      display: "flex",
      justifyContent: "flex-end",
    },
  },
  datePickerCompact: {
    width: 182,
    minWidth: 182,
    maxWidth: 200,
    flexShrink: 0,
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      minWidth: 0,
      maxWidth: "none",
    },
    "& .MuiFormLabel-root": {
      color: theme.palette.text.secondary,
    },
    "& .MuiInputBase-input": {
      color: theme.palette.text.primary,
      fontWeight: 500,
    },
  },
  boardScroll: {
    flex: 1,
    minHeight: "min(72vh, 900px)",
    width: "100%",
    overflowX: "auto",
    overflowY: "hidden",
    paddingBottom: theme.spacing(1),
    ...theme.scrollbarStyles,
    "& .react-trello-board": {
      alignItems: "flex-start",
      background: "transparent !important",
      minHeight: 280,
      paddingBottom: theme.spacing(2),
    },
    "& .react-trello-lane": {
      minWidth: 280,
    },
    "& .react-trello-lane header": {
      color: `${theme.palette.text.primary} !important`,
      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)} !important`,
      marginBottom: theme.spacing(1),
      paddingBottom: theme.spacing(0.75),
    },
    "& .react-trello-lane header > span": {
      color: `${theme.palette.text.primary} !important`,
      fontWeight: "700 !important",
      opacity: "1 !important",
      textShadow: "none !important",
    },
    "& .react-trello-lane header .react-trello-lane-title": {
      color: `${theme.palette.text.primary} !important`,
      fontWeight: "700 !important",
      opacity: "1 !important",
      textShadow: "none !important",
    },
    "& .react-trello-lane header .react-trello-lane-right-content": {
      color: `${theme.palette.text.secondary} !important`,
      fontWeight: "700 !important",
      opacity: "1 !important",
    },
    "& .react-trello-card": {
      color: `${theme.palette.text.primary} !important`,
    },
  },
  connectionTag: {
    display: "inline-block",
    backgroundColor:
      theme.palette.type === "light"
        ? theme.palette.grey[800]
        : theme.palette.grey[300],
    color:
      theme.palette.type === "light"
        ? theme.palette.common.white
        : theme.palette.grey[900],
    marginRight: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
    padding: theme.spacing(0.25, 0.75),
    fontWeight: 600,
    borderRadius: 8,
    fontSize: "0.65rem",
  },
  lastMessageTime: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    marginLeft: "auto",
    color: theme.palette.text.secondary,
  },
  lastMessageTimeUnread: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    color: theme.palette.success.main,
    fontWeight: "bold",
    marginLeft: "auto"
  },
  cardButton: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
    borderRadius: 10,
    textTransform: "none",
    fontWeight: 700,
    boxShadow:
      theme.palette.type === "light"
        ? "0 4px 10px rgba(2,136,209,0.22)"
        : "0 4px 12px rgba(0,0,0,0.35)",
  },
  cardMetaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: theme.palette.text.secondary,
    fontSize: "0.78rem",
    marginBottom: theme.spacing(0.5),
  },
  cardTitle: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.75),
    color: theme.palette.text.primary,
    fontWeight: 700,
    lineHeight: 1.2,
  },
  cardTitleText: {
    color: theme.palette.text.primary,
    fontWeight: 700,
    wordBreak: "break-word",
  },
  cardMessage: {
    textAlign: "left",
    fontSize: "0.84rem",
    lineHeight: 1.35,
    color: theme.palette.text.primary,
    minHeight: 36,
    maxHeight: 56,
    overflow: "hidden",
    textOverflow: "ellipsis",
    marginTop: theme.spacing(0.5),
  },
  searchButton: {
    borderRadius: 10,
    textTransform: "none",
    fontWeight: 700,
    minHeight: 36,
    boxShadow:
      theme.palette.type === "light"
        ? "0 4px 12px rgba(2,136,209,0.2)"
        : "0 6px 16px rgba(0,0,0,0.35)",
  },
  emptyState: {
    marginBottom: theme.spacing(2),
    borderRadius: 12,
    border: `1px dashed ${alpha(theme.palette.primary.main, 0.4)}`,
    backgroundColor:
      theme.palette.type === "light"
        ? alpha(theme.palette.primary.main, 0.04)
        : alpha(theme.palette.primary.main, 0.1),
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
      alignItems: "stretch",
    },
  },
  emptyStateText: {
    color: theme.palette.text.primary,
    fontWeight: 500,
  },
  emptyStateActions: {
    display: "flex",
    gap: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      "& > *": {
        flex: 1,
      },
    },
  },
}));

const Kanban = () => {
  const classes = useStyles();
  const layout = usePageListLayoutStyles();
  const theme = useTheme();
  const history = useHistory();
  const { user, socket } = useContext(AuthContext);
  const [tags, setTags] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [ticketNot, setTicketNot] = useState(0);
  const [file, setFile] = useState({ lanes: [] });
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [creatingDefaultColumns, setCreatingDefaultColumns] = useState(false);

  const jsonString = user.queues.map(queue => queue.UserQueue.queueId);

  useEffect(() => {
    fetchTags();
  }, [user]);

  const fetchTags = async () => {
    try {
      const response = await api.get("/tag/kanban/");
      const fetchedTags = response.data.lista || [];
      setTags(fetchedTags);
      fetchTickets();
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTickets = async () => {
    try {
      const { data } = await api.get("/ticket/kanban", {
        params: {
          queueIds: JSON.stringify(jsonString),
          startDate: startDate,
          endDate: endDate,
        }
      });
      setTickets(data.tickets);
    } catch (err) {
      console.log(err);
      setTickets([]);
    }
  };

  useEffect(() => {
    const companyId = user.companyId;
    const onAppMessage = (data) => {
      if (data.action === "create" || data.action === "update" || data.action === "delete") {
        fetchTickets();
      }
    };
    socket.on(`company-${companyId}-ticket`, onAppMessage);
    socket.on(`company-${companyId}-appMessage`, onAppMessage);

    return () => {
      socket.off(`company-${companyId}-ticket`, onAppMessage);
      socket.off(`company-${companyId}-appMessage`, onAppMessage);
    };
  }, [socket, startDate, endDate]);

  const handleSearchClick = () => {
    fetchTickets();
  };

  const IconChannel = (channel) => {
    switch (channel) {
      case "facebook":
        return <Facebook style={{ color: "#3b5998", verticalAlign: "middle", fontSize: "16px" }} />;
      case "instagram":
        return <Instagram style={{ color: "#e1306c", verticalAlign: "middle", fontSize: "16px" }} />;
      case "whatsapp":
        return <WhatsApp style={{ color: "#25d366", verticalAlign: "middle", fontSize: "16px" }} />
      default:
        return "error";
    }
  };

  const popularCards = (jsonString) => {
    const filteredTickets = tickets.filter(ticket => ticket.tags.length === 0);
    const laneSurface = (baseColor = null) => {
      if (!baseColor) {
        return theme.palette.type === "light"
          ? alpha(theme.palette.primary.main, 0.06)
          : alpha(theme.palette.common.white, 0.07);
      }
      return theme.palette.type === "light"
        ? alpha(baseColor, 0.14)
        : alpha(baseColor, 0.24);
    };
    const laneBorder = (baseColor = null) =>
      baseColor
        ? alpha(baseColor, theme.palette.type === "light" ? 0.42 : 0.5)
        : theme.palette.divider;

    const laneChrome = {
      borderRadius: 12,
      marginRight: theme.spacing(2),
      minHeight: 220,
      maxHeight: "72vh",
      border: `1px solid ${alpha(theme.palette.divider, theme.palette.type === "light" ? 0.9 : 1)}`,
      boxShadow:
        theme.palette.type === "light"
          ? "0 6px 16px rgba(15,23,42,0.12)"
          : "0 6px 18px rgba(0,0,0,0.35)",
      backdropFilter: "blur(2px)",
    };

    const normalize = (value = "") =>
      String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();

    const lanePriorityByName = {
      novo: 10,
      "em andamento": 20,
      concluido: 30,
    };

    const sortedTags = [...tags].sort((a, b) => {
      const pa = lanePriorityByName[normalize(a?.name)] ?? 1000;
      const pb = lanePriorityByName[normalize(b?.name)] ?? 1000;
      if (pa !== pb) return pa - pb;
      return Number(a?.id || 0) - Number(b?.id || 0);
    });

    const lanes = [
      {
        id: "lane0",
        title: i18n.t("tagsKanban.laneDefault"),
        label: filteredTickets.length.toString(),
        style: {
          ...laneChrome,
          backgroundColor: laneSurface(),
          borderColor: laneBorder(),
        },
        titleStyle: {
          color: theme.palette.text.primary,
          fontWeight: 700,
        },
        labelStyle: {
          color: theme.palette.text.secondary,
          fontWeight: 700,
        },
        cards: filteredTickets.map(ticket => ({
          id: ticket.id.toString(),
          label: "Ticket nº " + ticket.id.toString(),
          description: (
            <div>
              <div className={classes.cardMetaRow}>
                <span>{ticket.contact.number}</span>
                <Typography
                  className={Number(ticket.unreadMessages) > 0 ? classes.lastMessageTimeUnread : classes.lastMessageTime}
                  component="span"
                  variant="body2"
                >
                  {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                    <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
                  ) : (
                    <>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
                  )}
                </Typography>
              </div>
              <div className={classes.cardMessage}>{ticket.lastMessage || " "}</div>
              <Button
                variant="contained"
                color="primary"
                size="small"
                className={classes.cardButton}
                onClick={() => {
                  handleCardClick(ticket.uuid)
                }}
              >
                Ver Ticket
              </Button>
              <span style={{ marginRight: '8px' }} />
              {ticket?.user && (
                <Box component="span" className={classes.connectionTag}>
                  {ticket.user?.name.toUpperCase()}
                </Box>
              )}
            </div>
          ),
          title: (
            <div className={classes.cardTitle}>
              <Tooltip title={ticket.whatsapp?.name}>
                {IconChannel(ticket.channel)}
              </Tooltip>
              <span className={classes.cardTitleText}>{ticket.contact.name}</span>
            </div>
          ),
          draggable: true,
          href: "/tickets/" + ticket.uuid,
        })),
      },
      ...sortedTags.map(tag => {
        const filteredTickets = tickets.filter(ticket => {
          const tagIds = ticket.tags.map(tag => tag.id);
          return tagIds.includes(tag.id);
        });

        return {
          id: tag.id.toString(),
          title: tag.name,
          label: filteredTickets?.length.toString(),
          cards: filteredTickets.map(ticket => ({
            id: ticket.id.toString(),
            label: "Ticket nº " + ticket.id.toString(),
            description: (
              <div>
                <div className={classes.cardMetaRow}>
                  <span>{ticket.contact.number}</span>
                  <Typography
                    className={Number(ticket.unreadMessages) > 0 ? classes.lastMessageTimeUnread : classes.lastMessageTime}
                    component="span"
                    variant="body2"
                  >
                    {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                      <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
                    ) : (
                      <>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
                    )}
                  </Typography>
                </div>
                <div className={classes.cardMessage}>{ticket.lastMessage || " "}</div>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  className={classes.cardButton}
                  onClick={() => {
                    handleCardClick(ticket.uuid)
                  }}
                >
                  Ver Ticket
                </Button>
                <span style={{ marginRight: '8px' }} />
                {ticket?.user && (
                  <Box component="span" className={classes.connectionTag}>
                    {ticket.user?.name.toUpperCase()}
                  </Box>
                )}
              </div>
            ),
            title: (
              <div className={classes.cardTitle}>
                <Tooltip title={ticket.whatsapp?.name}>
                  {IconChannel(ticket.channel)}
                </Tooltip>
                <span className={classes.cardTitleText}>{ticket.contact.name}</span>
              </div>
            ),
            draggable: true,
            href: "/tickets/" + ticket.uuid,
          })),
          style: {
            ...laneChrome,
            backgroundColor: laneSurface(tag.color),
            borderColor: laneBorder(tag.color),
          },
          titleStyle: {
            color: theme.palette.text.primary,
            fontWeight: 600,
            textShadow: "none",
          },
          labelStyle: {
            color: theme.palette.text.secondary,
            fontWeight: 700,
          },
        };
      }),
    ];

    setFile({ lanes });
  };

  const handleCardClick = (uuid) => {
    history.push('/tickets/' + uuid);
  };

  useEffect(() => {
    popularCards(jsonString);
  }, [tags, tickets]);

  const toNumericId = (value) => {
    const normalized = String(value ?? "")
      .replace(/^lane/i, "")
      .replace(/[^\d]/g, "");
    return normalized ? Number(normalized) : NaN;
  };

  const handleCardMove = async (sourceLaneId, targetLaneId, cardId) => {
    try {
      const ticketId = toNumericId(cardId);
      const targetTagId = toNumericId(targetLaneId);
      if (!Number.isInteger(ticketId) || ticketId <= 0) {
        throw new Error(`ticketId inválido no drag: ${cardId}`);
      }

      // Remove etapa kanban atual do ticket e aplica a nova.
      await api.delete(`/ticket-tags/${ticketId}`);
      if (targetLaneId !== "lane0") {
        if (!Number.isInteger(targetTagId) || targetTagId <= 0) {
          throw new Error(`targetLaneId inválido no drag: ${targetLaneId}`);
        }
        await api.put(`/ticket-tags/${ticketId}/${targetTagId}`);
      }
      toast.success("Etapa do ticket atualizada com sucesso!");
      await fetchTickets(jsonString);
      popularCards(jsonString);
    } catch (err) {
      console.log(err);
      toast.error("Não foi possível mover o ticket de etapa.");
    }
  };

  const handleAddConnectionClick = () => {
    history.push('/tagsKanban');
  };

  const handleCreateDefaultColumns = async () => {
    try {
      setCreatingDefaultColumns(true);
      const defaults = [
        { name: "Novo", color: "#0288d1" },
        { name: "Em andamento", color: "#7b1fa2" },
        { name: "Concluído", color: "#2e7d32" },
      ];
      // Sequencial para manter ordem previsível de criação/ID.
      for (const column of defaults) {
        await api.post("/tags", {
          ...column,
          kanban: 1,
          timeLane: 0,
          nextLaneId: null,
          rollbackLaneId: null,
          greetingMessageLane: "",
        });
      }
      await fetchTags();
      toast.success("Colunas padrão do Kanban criadas com sucesso!");
    } catch (err) {
      console.log(err);
      toast.error("Não foi possível criar as colunas padrão do Kanban.");
    } finally {
      setCreatingDefaultColumns(false);
    }
  };

  const isLight = theme.palette.type === "light";
  const cardStyle = {
    borderRadius: 12,
    boxShadow: isLight
      ? "0 2px 12px rgba(10, 22, 40, 0.1), 0 1px 3px rgba(10, 22, 40, 0.08)"
      : "0 4px 20px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 200, 232, 0.08)",
    backgroundColor: isLight
      ? alpha(theme.palette.common.white, 0.98)
      : alpha(theme.palette.background.paper, 0.96),
    border: isLight
      ? `1px solid ${alpha(theme.palette.primary.main, 0.16)}`
      : `1px solid ${alpha(theme.palette.divider, 0.95)}`,
    marginBottom: 10,
    color: theme.palette.text.primary,
    overflow: "hidden",
    backdropFilter: "blur(1px)",
  };

  return (
    <MainContainer className={layout.pageRoot}>
      <MainHeader>
        <Title>{i18n.t("kanban.title")}</Title>
        <MainHeaderButtonsWrapper>
          <Can
            role={user.profile}
            perform="dashboard:view"
            yes={() => (
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddConnectionClick}
              >
                + Colunas
              </Button>
            )}
          />
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper
        className={clsx(layout.mainPaper, classes.boardPaper)}
        variant="outlined"
      >
        {tags.length === 0 && (
          <Box className={classes.emptyState}>
            <Typography variant="body2" className={classes.emptyStateText}>
              Nenhuma coluna Kanban cadastrada. Crie colunas para organizar os tickets por etapas.
            </Typography>
            <Box className={classes.emptyStateActions}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateDefaultColumns}
                disabled={creatingDefaultColumns}
              >
                {creatingDefaultColumns ? <CircularProgress size={18} color="inherit" /> : "Criar colunas padrão"}
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleAddConnectionClick}
              >
                Gerenciar colunas
              </Button>
            </Box>
          </Box>
        )}
        <Box className={classes.filterBar}>
          <Box className={classes.filterBarDates}>
            <FilterDatePickerField
              label="Data de início"
              value={startDate}
              onChange={setStartDate}
              fullWidth={false}
              className={classes.datePickerCompact}
            />
            <FilterDatePickerField
              label="Data de fim"
              value={endDate}
              onChange={setEndDate}
              fullWidth={false}
              className={classes.datePickerCompact}
            />
          </Box>
          <Box className={classes.filterBarSearch}>
            <Button
              variant="contained"
              color="primary"
              className={classes.searchButton}
              onClick={handleSearchClick}
            >
              Buscar
            </Button>
          </Box>
        </Box>
        <div className={classes.boardScroll}>
          <Board
            data={file}
            onCardMoveAcrossLanes={handleCardMove}
            style={{ backgroundColor: "transparent" }}
            cardStyle={cardStyle}
          />
        </div>
      </Paper>
    </MainContainer>
  );
};

export default Kanban;
