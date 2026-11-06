import React, { useState, useEffect, useRef } from "react";

import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import CircularProgress from "@material-ui/core/CircularProgress";
import CloseIcon from "@material-ui/icons/Close";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import { getFlowBuilderDialogShellStyles } from "../../theme/flowBuilderDialogShellStyles";

const useStyles = makeStyles((theme) => ({
  ...getFlowBuilderDialogShellStyles(theme),
}));

const FlowBuilderTicketModal = ({ open, onSave, data, onUpdate, close }) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const [activeModal, setActiveModal] = useState(false);
  const [queues, setQueues] = useState([]);
  const [selectedQueue, setQueueSelected] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open === "edit" || open === "create") {
      (async () => {
        try {
          setLoading(true);
          const { data: response } = await api.get("/queue");
          setQueues(response);
          if (open === "edit") {
            const queue = response.find(item => item.id === data.data.id);
            if (queue) setQueueSelected(queue.id);
          }
          setActiveModal(true);
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      })();
    }

    return () => {
      isMounted.current = false;
    };
  }, [open, data]);

  const handleClose = () => {
    close(null);
    setActiveModal(false);
  };

  const handleSaveContact = () => {
    if (!selectedQueue) {
      return toast.error("Adicione uma fila");
    }

    const queue = queues.find(item => item.id === selectedQueue);

    if (open === "edit") {
      onUpdate({
        ...data,
        data: queue
      });
    } else if (open === "create") {
      onSave({ data: queue });
    }

    handleClose();
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={activeModal}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        scroll="paper"
        classes={{ paper: classes.dialogPaper }}
      >
        <DialogTitle className={classes.dialogTitle}>
          <div className={classes.titleWrapper}>
            <Typography className={classes.title}>
              {open === "create" ? "Adicionar fila ao fluxo" : "Editar fila"}
            </Typography>
            <Typography className={classes.subtitle}>
              Selecione a fila para transferência
            </Typography>
          </div>

          <IconButton
            onClick={handleClose}
            className={classes.closeButton}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent className={classes.dialogContent} dividers>
          {loading ? (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <Select
              value={selectedQueue || ""}
              onChange={e => setQueueSelected(e.target.value)}
              fullWidth
              variant="outlined"
              displayEmpty
              renderValue={value => {
                if (!value) return "Selecione uma fila";
                const queue = queues.find(q => q.id === value);
                return queue ? queue.name : "";
              }}
            >
              {queues.map(queue => (
                <MenuItem key={queue.id} value={queue.id}>
                  {queue.name}
                </MenuItem>
              ))}
            </Select>
          )}
        </DialogContent>

        <DialogActions className={classes.dialogActions}>
          <Button
            onClick={handleClose}
            variant="outlined"
            className={classes.secondaryButton}
          >
            {i18n.t("contactModal.buttons.cancel")}
          </Button>
          <Button
            onClick={handleSaveContact}
            color="primary"
            variant="contained"
            className={classes.primaryButton}
          >
            {open === "create" ? "Adicionar" : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FlowBuilderTicketModal;
