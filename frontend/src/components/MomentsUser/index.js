import React, { Fragment, useContext, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";

import { AuthContext } from "../../context/Auth/AuthContext";
import {  ReportProblem, VisibilityOutlined } from "@mui/icons-material";
// import { SocketContext } from "../../context/Socket/SocketContext";
import { toast } from "react-toastify";
import { yellow } from "@mui/material/colors";
import { Avatar, CardHeader, Divider, List, ListItem, ListItemAvatar, ListItemText, Paper, Typography, Card, makeStyles, Container, Badge, Grid, Tooltip } from "@material-ui/core";
import { format, isSameDay, parseISO } from "date-fns";
import { grey } from "@material-ui/core/colors";
import { getBackendUrl } from "../../config";

const backendUrl = getBackendUrl();

const useStyles = makeStyles((theme) => ({
  rootGrid: {
    padding: theme.spacing(1),
  },
  main: {
    display: "flex",
    justifyContent: "space-between",
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  cardHeader: {
    width: "380px",
    height: "78px",
    padding: 10,
    backgroundColor:
      theme.palette.type === "dark"
        ? "rgba(255,255,255,0.06)"
        : theme.palette.grey[100],
    border: `1px solid ${theme.palette.divider}`,
    borderBottom: 0,
    borderRadius: "10px 10px 0 0",
  },
  cardHeaderPending: {
    width: "380px",
    height: "78px",
    padding: 10,
    backgroundColor:
      theme.palette.type === "dark"
        ? "rgba(255,255,255,0.08)"
        : theme.palette.grey[200],
    border: `1px solid ${theme.palette.divider}`,
    borderBottom: 0,
    borderRadius: "10px 10px 0 0",
  },
  card: {
    height: "300px",
    width: "380px",
    margin: "3px",
    borderRadius: "0 0 10px 10px",
    flex: 1,
    maxHeight: "100%",
    overflowY: "scroll",
    ...theme.scrollbarStyles,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor:
      theme.palette.type === "dark"
        ? "rgba(255,255,255,0.02)"
        : theme.palette.background.paper,
  },
  changeWarap: {
    width: '380px',
    padding: 0,
    margin: 0
  },
  pending: {
    color: yellow[600],
    fontSize: '20px'
  },
  connectionTag: {
    background: theme.palette.type === "dark" ? theme.palette.primary.dark : theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    marginRight: 1,
    padding: "1px 6px",
    fontWeight: 'bold',
    borderRadius: 3,
    fontSize: "0.65em",
  },
  lastMessageTime: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    // top: -30,
    marginRight: "1px",
    color: theme.palette.text.secondary,
  },

  lastMessageTimeUnread: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    // top: -30,
    color: theme.palette.success.main,
    fontWeight: "bold",
    marginRight: "1px",
  },
  listItem: {
    borderRadius: 6,
    "&:hover": {
      backgroundColor:
        theme.palette.type === "dark"
          ? "rgba(255,255,255,0.05)"
          : theme.palette.action.hover,
    },
  },
  secondaryText: {
    color: theme.palette.text.secondary,
  },
}));

const DashboardManage = () => {
  const classes = useStyles();
  const history = useHistory();
  //   const socketManager = useContext(SocketContext);
  const { user, socket } = useContext(AuthContext);

  const [tickets, setTickets] = useState([]);
  const [update, setUpdate] = useState(false);
  const [ticketNot, setTicketNot] = useState(0);
  const companyId = user.companyId;


  const userQueueIds = user.queues.map((q) => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);

 

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/usersMoments");
        console.log(data)
        setTickets(data);
        setUpdate(!update);
      } catch (err) {
        if (err.response?.status !== 500) {
          toastError(err);
        } else {
          toast.error(`${i18n.t("frontEndErrors.getUsers")}`);
        }
      }
    })();
  }, []);

  useEffect(() => {
    const companyId = user.companyId;
    console.log("socket painel")
    // const socket = socketManager.GetSocket();
  
    // const onConnect = () => {
    //   socket.emit("joinChatBox", `${ticketId}`);
    // }
    const onAppMessage = (data) => {
      if (data.action === "create" || data.action === "update" || data.action === "delete") {
        (async () => {
          try {
            const { data } = await api.get("/usersMoments");
            setTickets(data);
            setUpdate(!update);
          } catch (err) {
            if (err.response?.status !== 500) {
              toastError(err);
            } else {
              toast.error(`${i18n.t("frontEndErrors.getUsers")}`);
            }
          }
        })();
      }
    }
  
    // socket.on("connect", onConnect);
    socket.on(`company-${companyId}-ticket`, onAppMessage)
    socket.on(`company-${companyId}-appMessage`, onAppMessage);
  
    return () => {
      // socket.off("connect", onConnect);
      socket.off(`company-${companyId}-ticket`, onAppMessage)
      socket.off(`company-${companyId}-appMessage`, onAppMessage);
    };
  }, [socket]);

  const Moments = useMemo(() => {
    // console.log(tickets)
    if (tickets && tickets.length > 0) {
      const ticketsByUser = tickets.reduce((userTickets, ticket) => {
        const user = ticket.user;

        if (user) {
          const userIndex = userTickets.findIndex((group) => group.user.id === user.id);
          if (userIndex === -1) {
            userTickets.push({
              user,
              userTickets: [ticket],
            });
          } else {
            userTickets[userIndex].userTickets.push(ticket);
          }
        }
        return userTickets;
      }, []);

      return ticketsByUser.map((group, index) => (
        <Grid item key={index}>
          <div padding={20} className={classes.main} key={index}>
            <div className={classes.changeWarap}>
              <Paper elevation={3} className={classes.cardHeader}>
                <CardHeader
                  style={{ maxWidth: '380px', width: '100%' }}
                  avatar={<Avatar alt={`${group.user.profileImage}`} src={group.user.profileImage ? `${backendUrl}/public/company${companyId}/user/${group.user.profileImage}` : null} />}
                  title={(
                    <span>{group?.user?.name || "Pendentes"} <br />
                      {`Atendimentos: ${group.userTickets?.length}`}
                    </span>
                  )}
                />
              </Paper>
              <Paper square elevation={1} className={classes.card}>
                {group.userTickets.map((ticket) => (
                  <List style={{ paddingTop: 0 }} key={ticket.id}>
                    <ListItem dense button className={classes.listItem}>
                      <ListItemAvatar>
                        <Avatar alt={`${ticket.contact.urlPicture}`} src={`${ticket.contact.urlPicture}`} />
                      </ListItemAvatar>
                      <ListItemText
                        disableTypography
                        primary={ticket?.contact?.name?.length > 30 ? ticket?.contact?.name.substring(0, 25) + '...' : ticket?.contact?.name}
                        secondary={
                          <Fragment>
                            <div>
                              <Typography
                                style={{ display: 'inline' }}
                                component="span"
                                variant="body2"
                                className={classes.secondaryText}
                              >
                                {`${ticket.lastMessage?.length > 30 ? String(ticket.lastMessage).substring(0, 27) + '...' : ticket.lastMessage}`}
                              </Typography>
                            </div>
                            <Badge className={classes.connectionTag}>{ticket?.whatsapp?.name}</Badge>
                            <Badge style={{ backgroundColor: ticket.queue?.color || "#7c7c7c" }} className={classes.connectionTag}>{ticket.queue?.name.toUpperCase() || "SEM FILA"}</Badge>
                          </Fragment>
                        }
                      />
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
                      {(user.profile === "admin" || ticket.userId === user.id) && (
                        <Tooltip title="Acessar Ticket">
                          <VisibilityOutlined
                            onClick={() => history.push(`/tickets/${ticket.uuid}`)}
                            fontSize="small"
                            style={{
                              color: grey[500],
                              cursor: "pointer",
                              marginRight: 5,
                              bottom: "-15px"
                            }}
                          />
                        </Tooltip>
                      )}
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </List>
                ))}
              </Paper>
            </div>
          </div>
        </Grid>
      )
      );
    } else {
      return null;
    }
  }, [update]);

  const MomentsPending = useMemo(() => {
    if (tickets && tickets.length > 0) {
      const pendingTickets = tickets.filter((ticket) => !ticket.user);

      return (
        <Grid item >
          <div className={classes.main}>
            <div padding={2} className={classes.changeWarap}>
              <Paper elevation={3} className={classes.cardHeaderPending}>
                <CardHeader
                  style={{ maxWidth: '380px', width: '100%' }}
                  avatar={<Avatar />}
                  title={(
                    <span>{"Pendentes"}
                      <ReportProblem className={classes.pending} />
                      <div>
                        Atendimentos: {pendingTickets?.length}
                      </div>
                    </span>
                  )}
                />
              </Paper>
              <Paper square elevation={1} className={classes.card}>
                {pendingTickets.map((ticket) => (
                  <List style={{ paddingTop: 0 }} key={ticket.id}>
                    <ListItem dense button className={classes.listItem}>
                      <ListItemAvatar>
                        <Avatar alt={`${ticket.contact.urlPicture}`} src={`${ticket.contact.urlPicture}`} />
                      </ListItemAvatar>
                      <ListItemText
                        disableTypography
                        primary={ticket?.contact?.name}
                        secondary={
                          <Fragment>
                            <div>
                              <Typography
                                style={{ display: 'inline' }}
                                component="span"
                                variant="body2"
                                className={classes.secondaryText}
                              >
                                {`${ticket.lastMessage?.length > 30 ? String(ticket.lastMessage).substring(0, 27) + '...' : ticket.lastMessage}`}
                              </Typography>
                            </div>
                            <Badge className={classes.connectionTag}>{ticket?.whatsapp?.name}</Badge>
                            <Badge style={{ backgroundColor: ticket.queue?.color || "#7c7c7c" }} className={classes.connectionTag}>{ticket.queue?.name.toUpperCase() || "SEM FILA"}</Badge>
                          </Fragment>
                        }
                      />
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
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </List>
                ))}
              </Paper>
            </div>
          </div>
        </Grid>
      );
    } else {
      return null;
    }
  }, [update]);

  return (
    <Fragment>
      <Grid container spacing={2} className={classes.rootGrid}>
        {Moments}
        {MomentsPending}
      </Grid>
    </Fragment>
  );
};

export default DashboardManage;
