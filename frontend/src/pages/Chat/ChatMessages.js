import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Box,
  IconButton,
  InputAdornment,
  makeStyles,
  Paper,
  TextField,
  Toolbar,
  Typography,
} from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";
import { alpha } from "@material-ui/core/styles";

import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    overflow: "hidden",
    borderRadius: 0,
    height: "100%",
    minHeight: 0,
    backgroundColor: theme.palette.background.paper,
    borderLeft: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down("sm")]: {
      borderLeft: "none",
    },
  },
  header: {
    minHeight: 48,
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor:
      theme.palette.type === "light"
        ? theme.palette.grey[50]
        : alpha(theme.palette.common.white, 0.04),
  },
  headerTitle: {
    flex: 1,
    fontWeight: 600,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  messageList: {
    position: "relative",
    overflowY: "auto",
    flex: 1,
    minHeight: 0,
    ...theme.scrollbarStyles,
    backgroundColor:
      theme.palette.type === "light"
        ? theme.palette.grey[50]
        : alpha(theme.palette.common.white, 0.03),
    padding: theme.spacing(2, 2, 1),
  },
  messagesStack: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.25),
    alignItems: "stretch",
  },
  bubbleOther: {
    alignSelf: "flex-start",
    maxWidth: "min(100%, 420px)",
    padding: theme.spacing(1.25, 1.5),
    borderRadius: 14,
    borderBottomLeftRadius: 4,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow:
      theme.palette.type === "light"
        ? "0 1px 3px rgba(15, 23, 42, 0.08)"
        : "none",
  },
  bubbleOwn: {
    alignSelf: "flex-end",
    maxWidth: "min(100%, 420px)",
    padding: theme.spacing(1.25, 1.5),
    borderRadius: 14,
    borderBottomRightRadius: 4,
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: theme.palette.primary.contrastText,
    boxShadow:
      theme.palette.type === "light"
        ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.35)}`
        : `0 2px 12px ${alpha(theme.palette.common.black, 0.4)}`,
  },
  senderName: {
    fontWeight: 600,
    marginBottom: theme.spacing(0.25),
    opacity: 0.95,
  },
  messageTime: {
    marginTop: theme.spacing(0.5),
    opacity: 0.72,
    display: "block",
  },
  inputBar: {
    padding: theme.spacing(1.5, 2),
    borderTop: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function ChatMessages({
  chat,
  messages,
  handleSendMessage,
  handleLoadMore,
  scrollToBottomRef,
  pageInfo,
  loading,
}) {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const { datetimeToClient } = useDate();
  const baseRef = useRef();

  const [contentMessage, setContentMessage] = useState("");

  const scrollToBottom = () => {
    if (baseRef.current) {
      baseRef.current.scrollIntoView({});
    }
  };

  const unreadMessages = (c) => {
    if (c !== undefined && c.users) {
      const currentUser = c.users.find((u) => u.userId === user.id);
      return currentUser && currentUser.unreads > 0;
    }
    return false;
  };

  useEffect(() => {
    if (chat && unreadMessages(chat) > 0) {
      try {
        api.post(`/chats/${chat.id}/read`, { userId: user.id });
      } catch (err) {}
    }
    scrollToBottomRef.current = scrollToBottom;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat?.id]);

  const handleScroll = (e) => {
    const { scrollTop } = e.currentTarget;
    if (!pageInfo.hasMore || loading) return;
    if (scrollTop < 600) {
      handleLoadMore();
    }
  };

  const send = () => {
    const t = contentMessage.trim();
    if (t !== "") {
      handleSendMessage(t);
      setContentMessage("");
    }
  };

  return (
    <Paper className={classes.mainContainer} elevation={0} square>
      {chat && (
        <Toolbar variant="dense" className={classes.header}>
          <Typography variant="subtitle1" className={classes.headerTitle}>
            {chat.title}
          </Typography>
        </Toolbar>
      )}
      <div onScroll={handleScroll} className={classes.messageList}>
        <div className={classes.messagesStack}>
          {Array.isArray(messages) &&
            messages.map((item, key) => {
              const own = item.senderId === user.id;
              return (
                <Box
                  key={key}
                  className={own ? classes.bubbleOwn : classes.bubbleOther}
                >
                  <Typography
                    variant="caption"
                    className={classes.senderName}
                    color={own ? "inherit" : "textSecondary"}
                  >
                    {item.sender.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    component="div"
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                  >
                    {item.message}
                  </Typography>
                  <Typography
                    variant="caption"
                    className={classes.messageTime}
                    color={own ? "inherit" : "textSecondary"}
                  >
                    {datetimeToClient(item.createdAt)}
                  </Typography>
                </Box>
              );
            })}
        </div>
        <div ref={baseRef} />
      </div>
      <div className={classes.inputBar}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          variant="outlined"
          size="small"
          placeholder="Escreva uma mensagem…"
          value={contentMessage}
          onChange={(e) => setContentMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  color="primary"
                  onClick={send}
                  aria-label="enviar"
                  disabled={contentMessage.trim() === ""}
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </div>
    </Paper>
  );
}
