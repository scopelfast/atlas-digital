import React, { useState, useEffect, useRef } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
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

const FlowBuilderAddTextModal = ({ open, onSave, onUpdate, data, close }) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const [activeModal, setActiveModal] = useState(false);
  const [textDig, setTextDig] = useState("");

  const [labels, setLabels] = useState({
    title: "Adicionar mensagem ao fluxo",
    btn: "Adicionar"
  });

  useEffect(() => {
    if (open === "edit") {
      setLabels({ title: "Editar mensagem ao fluxo", btn: "Salvar" });
      setTextDig(data.data.label);
      setActiveModal(true);
    } else if (open === "create") {
      setLabels({ title: "Adicionar mensagem ao fluxo", btn: "Adicionar" });
      setTextDig("");
      setActiveModal(true);
    } else {
      setActiveModal(false);
    }
  }, [open, data]);

  useEffect(() => () => { isMounted.current = false; }, []);

  const handleClose = () => {
    close(null);
    setActiveModal(false);
  };

  const handleSaveContact = () => {
    if (open === "edit") {
      onUpdate({
        ...data,
        data: { label: textDig }
      });
    } else if (open === "create") {
      onSave({
        text: textDig
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
              {labels.title}
            </Typography>
            <Typography className={classes.subtitle}>
              Defina a mensagem que será enviada
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
          <TextField
            label="Mensagem"
            multiline
            rows={7}
            variant="outlined"
            value={textDig}
            margin="dense"
            onChange={e => setTextDig(e.target.value)}
            fullWidth
          />
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
            {labels.btn}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FlowBuilderAddTextModal;
