import React, { useState, useEffect, useRef } from "react";

import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Box from "@material-ui/core/Box";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

import { i18n } from "../../translate/i18n";
import { getFlowBuilderDialogShellStyles } from "../../theme/flowBuilderDialogShellStyles";

const useStyles = makeStyles((theme) => ({
  ...getFlowBuilderDialogShellStyles(theme),
}));

const FlowBuilderIntervalModal = ({ open, onSave, data, onUpdate, close }) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const [timerSec, setTimerSec] = useState(0);
  const [activeModal, setActiveModal] = useState(false);

  useEffect(() => {
    if (open === "edit") {
      setTimerSec(data.data.sec);
      setActiveModal(true);
    } else if (open === "create") {
      setTimerSec(0);
      setActiveModal(true);
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
    if (!timerSec || parseInt(timerSec) <= 0) {
      return toast.error("Adicione o valor de intervalo");
    }
    if (parseInt(timerSec) > 120) {
      return toast.error("Máximo de tempo atingido 120 segundos");
    }

    if (open === "edit") {
      onUpdate({
        ...data,
        data: { sec: timerSec }
      });
    } else if (open === "create") {
      onSave({
        sec: timerSec
      });
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
              {open === "create" ? "Adicionar intervalo ao fluxo" : "Editar intervalo"}
            </Typography>
            <Typography className={classes.subtitle}>
              Defina o tempo de espera em segundos
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
          <Box style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <TextField
              label="Tempo em segundos"
              type="number"
              value={timerSec}
              onChange={e => setTimerSec(e.target.value)}
              variant="outlined"
              margin="dense"
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: 0, max: 120 }}
            />
          </Box>
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

export default FlowBuilderIntervalModal;
