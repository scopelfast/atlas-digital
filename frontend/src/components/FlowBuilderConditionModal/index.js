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
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Box from "@material-ui/core/Box";
import CloseIcon from "@material-ui/icons/Close";

import { i18n } from "../../translate/i18n";
import { getFlowBuilderDialogShellStyles } from "../../theme/flowBuilderDialogShellStyles";

const useStyles = makeStyles((theme) => ({
  ...getFlowBuilderDialogShellStyles(theme),
}));

const FlowBuilderConditionModal = ({ open, onSave, onUpdate, data, close }) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const [activeModal, setActiveModal] = useState(false);
  const [rule, setRule] = useState();
  const [textDig, setTextDig] = useState();
  const [valueCondition, setValueCondition] = useState();

  const [labels, setLabels] = useState({
    title: "Adicionar condição ao fluxo",
    btn: "Adicionar"
  });

  useEffect(() => {
    if (open === "edit") {
      setLabels({ title: "Editar condição", btn: "Salvar" });
      setTextDig(data.data.key);
      setRule(data.data.condition);
      setValueCondition(data.data.value);
      setActiveModal(true);
    } else if (open === "create") {
      setLabels({ title: "Adicionar condição ao fluxo", btn: "Adicionar" });
      setTextDig();
      setRule();
      setValueCondition();
      setActiveModal(true);
    } else {
      setActiveModal(false);
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
    if (open === "edit") {
      handleClose();
      onUpdate({
        ...data,
        data: { key: textDig, condition: rule, value: valueCondition }
      });
    } else if (open === "create") {
      handleClose();
      onSave({
        key: textDig,
        condition: rule,
        value: valueCondition
      });
    }
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
            <Typography className={classes.title}>{labels.title}</Typography>
            <Typography className={classes.subtitle}>
              Configure a lógica de condição
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
              label="Campo da condição"
              helperText="Digite apenas uma chave"
              variant="outlined"
              value={textDig || ""}
              onChange={e => setTextDig(e.target.value)}
              fullWidth
            />

            <FormControl variant="outlined" fullWidth>
              <InputLabel id="fb-condition-rule-label">Regra de validação</InputLabel>
              <Select
                labelId="fb-condition-rule-label"
                value={rule || ""}
                label="Regra de validação"
                onChange={e => setRule(e.target.value)}
              >
                <MenuItem value={1}>==</MenuItem>
                <MenuItem value={2}>&gt;=</MenuItem>
                <MenuItem value={3}>&lt;=</MenuItem>
                <MenuItem value={4}>&lt;</MenuItem>
                <MenuItem value={5}>&gt;</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Valor da condição"
              variant="outlined"
              value={valueCondition || ""}
              onChange={e => setValueCondition(e.target.value)}
              fullWidth
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
            variant="contained"
            color="primary"
            className={classes.primaryButton}
          >
            {labels.btn}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FlowBuilderConditionModal;
