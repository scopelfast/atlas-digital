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
import Slider from "@material-ui/core/Slider";
import CloseIcon from "@material-ui/icons/Close";

import { i18n } from "../../translate/i18n";
import { getFlowBuilderDialogShellStyles } from "../../theme/flowBuilderDialogShellStyles";

const useStyles = makeStyles((theme) => ({
  ...getFlowBuilderDialogShellStyles(theme),
}));

const FlowBuilderRandomizerModal = ({
  open,
  onSave,
  data,
  onUpdate,
  close
}) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const [percent, setPercent] = useState(0);
  const [activeModal, setActiveModal] = useState(false);

  useEffect(() => {
    if (open === "edit") {
      setPercent(data.data.percent);
      setActiveModal(true);
    } else if (open === "create") {
      setPercent(0);
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

  const handleValue = (event, newValue) => {
    setPercent(newValue);
  };

  const handleSaveContact = () => {
    if (!percent || parseInt(percent) <= 0) {
      return toast.error("Adicione o valor de intervalo");
    }
    if (parseInt(percent) > 120) {
      return toast.error("Máximo de tempo atingido 120 segundos");
    }
    if (open === "edit") {
      onUpdate({
        ...data,
        data: { percent: percent }
      });
    } else if (open === "create") {
      onSave({
        percent: percent
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
              {open === "create"
                ? "Adicionar randomizador ao fluxo"
                : "Editar randomizador"}
            </Typography>
            <Typography className={classes.subtitle}>
              Defina a porcentagem de distribuição
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
          <Box className={classes.dialogSliderRow}>
            <Typography color="textPrimary" component="span">
              {percent}%
            </Typography>
            <Slider
              className={`${classes.dialogSliderGrow} ${classes.dialogSlider}`}
              value={percent}
              valueLabelDisplay="auto"
              onChange={handleValue}
              step={10}
              marks
              min={0}
              max={100}
            />
            <Typography color="textPrimary" component="span">
              {100 - percent}%
            </Typography>
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

export default FlowBuilderRandomizerModal;
