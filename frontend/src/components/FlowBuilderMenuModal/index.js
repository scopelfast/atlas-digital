import React, { useState, useEffect, useRef } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Box from "@material-ui/core/Box";

import CloseIcon from "@material-ui/icons/Close";
import AddCircle from "@material-ui/icons/AddCircle";
import Delete from "@material-ui/icons/Delete";

import { i18n } from "../../translate/i18n";

import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => {
  const isDark = theme.palette.type === "dark";
  return {
    root: {
      display: "flex",
      flexWrap: "wrap",
    },

    dialogPaper: {
      borderRadius: 14,
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: isDark
        ? "0 18px 60px rgba(0, 0, 0, 0.55)"
        : "0 18px 60px rgba(16, 24, 40, 0.18)",
      overflow: "hidden",
      backgroundColor: theme.palette.background.paper,
    },

    dialogTitle: {
      padding: theme.spacing(1.5, 1.75, 1.25),
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.background.paper,
    },

    titleText: {
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
      fontWeight: 600,
      fontSize: 16,
      color: theme.palette.text.primary,
      margin: 0,
    },

    subtitleText: {
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
      fontWeight: 400,
      fontSize: 12.5,
      color: theme.palette.text.secondary,
      marginTop: 2,
    },

    closeBtn: {
      borderRadius: 10,
      border: `1px solid ${theme.palette.divider}`,
      background: theme.palette.inputBackground,
      color: theme.palette.text.secondary,
      width: 36,
      height: 36,
    },

    dialogContent: {
      padding: theme.spacing(1.5),
      background: isDark
        ? `linear-gradient(180deg, ${theme.palette.fancyBackground} 0%, ${theme.palette.background.paper} 100%)`
        : "linear-gradient(180deg, rgba(249,250,251,0.85) 0%, rgba(255,255,255,1) 55%)",
    },

    sectionLabel: {
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
      fontWeight: 500,
      fontSize: 12.5,
      color: theme.palette.text.secondary,
    },

    textField: {
      flex: 1,
      "& .MuiOutlinedInput-root": {
        borderRadius: 12,
        background: theme.palette.inputBackground,
      },
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.divider,
      },
      "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
      },
      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
      },
    },

    optionCard: {
      border: `1px solid ${theme.palette.divider}`,
      background: theme.palette.inputBackground,
      borderRadius: 14,
      padding: theme.spacing(1),
      display: "flex",
      flexDirection: "column",
      gap: theme.spacing(1),
    },

    optionRow: {
      display: "flex",
      gap: theme.spacing(1),
      alignItems: "center",
    },

    iconBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      border: `1px solid ${theme.palette.divider}`,
      background: theme.palette.background.paper,
      color: theme.palette.text.secondary,
    },

    addOptionBtn: {
      borderRadius: 12,
      padding: theme.spacing(0.8, 1.25),
      textTransform: "none",
      fontWeight: 500,
      boxShadow: isDark
        ? "0 10px 22px rgba(0, 0, 0, 0.35)"
        : "0 10px 22px rgba(16, 24, 40, 0.10)",
    },

    dialogActions: {
      padding: theme.spacing(1.25, 1.75),
      borderTop: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.background.paper,
    },

    actionBtn: {
      borderRadius: 12,
      padding: theme.spacing(0.9, 1.5),
      textTransform: "none",
      fontWeight: 500,
      boxShadow: isDark
        ? "0 10px 22px rgba(0, 0, 0, 0.3)"
        : "0 10px 22px rgba(16, 24, 40, 0.10)",
    },

    actionBtnSecondary: {
      borderRadius: 12,
      padding: theme.spacing(0.9, 1.5),
      textTransform: "none",
      fontWeight: 500,
    },

    emptyOptionsHint: {
      border: `1px dashed ${theme.palette.divider}`,
      borderRadius: 14,
      padding: 14,
      color: theme.palette.text.secondary,
      fontSize: 12.5,
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    },

    btnWrapper: {
      position: "relative",
    },

    buttonProgress: {
      color: green[500],
      position: "absolute",
      top: "50%",
      left: "50%",
      marginTop: -12,
      marginLeft: -12,
    },
  };
});

const FlowBuilderMenuModal = ({ open, onSave, onUpdate, data, close }) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const [activeModal, setActiveModal] = useState(false);
  const [textDig, setTextDig] = useState("");
  const [arrayOption, setArrayOption] = useState([]);

  const [labels, setLabels] = useState({
    title: "Adicionar menu ao fluxo",
    btn: "Adicionar",
  });

  useEffect(() => {
    if (open === "edit") {
      setLabels({
        title: "Editar menu",
        btn: "Salvar",
      });
      setTextDig(data?.data?.message || "");
      setArrayOption(data?.data?.arrayOption || []);
      setActiveModal(true);
    } else if (open === "create") {
      setLabels({
        title: "Adicionar menu ao fluxo",
        btn: "Adicionar",
      });
      setTextDig("");
      setArrayOption([]);
      setActiveModal(true);
    } else {
      setActiveModal(false);
    }
  }, [open, data]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleClose = () => {
    close(null);
    setActiveModal(false);
  };

  const handleSave = () => {
    try {
      if (open === "edit") {
        handleClose();
        onUpdate({
          ...data,
          data: { message: textDig, arrayOption: arrayOption },
        });
        return;
      }
      if (open === "create") {
        handleClose();
        onSave({
          message: textDig,
          arrayOption: arrayOption,
        });
      }
    } catch (err) {
      toastError(err);
    }
  };

  const addOption = () => {
    setArrayOption((old) => [...old, { number: old.length + 1, value: "" }]);
  };

  const removeOption = (number) => {
    setArrayOption((old) => old.filter((item) => item.number !== number));
  };

  const updateOptionValue = (index, value) => {
    setArrayOption((old) => {
      const newArr = [...old];
      if (!newArr[index]) return old;
      newArr[index] = { ...newArr[index], value };
      return newArr;
    });
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={activeModal}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        scroll="paper"
        classes={{ paper: classes.dialogPaper }}
      >
        <DialogTitle disableTypography className={classes.dialogTitle}>
          <div>
            <Typography className={classes.titleText}>{labels.title}</Typography>
            <div className={classes.subtitleText}>
              Defina a mensagem e as opções que o usuário poderá escolher.
            </div>
          </div>

          <IconButton
            onClick={handleClose}
            className={classes.closeBtn}
            aria-label="Fechar"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent className={classes.dialogContent}>
          <Box display="flex" flexDirection="column" style={{ gap: 12 }}>
            <Typography className={classes.sectionLabel}>
              Mensagem de explicação do menu
            </Typography>

            <TextField
              rows={4}
              multiline
              variant="outlined"
              value={textDig}
              onChange={(e) => setTextDig(e.target.value)}
              className={classes.textField}
              style={{ width: "100%" }}
              placeholder="Ex: Escolha uma opção abaixo para continuar…"
            />

            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              style={{ marginTop: 4 }}
            >
              <Typography className={classes.sectionLabel}>
                Opções do menu
              </Typography>

              <Button
                onClick={addOption}
                color="primary"
                variant="contained"
                className={classes.addOptionBtn}
                startIcon={<AddCircle />}
              >
                Adicionar
              </Button>
            </Box>

            <Box display="flex" flexDirection="column" style={{ gap: 10 }}>
              {arrayOption.length === 0 && (
                <div className={classes.emptyOptionsHint}>
                  Nenhuma opção adicionada ainda. Clique em <b>Adicionar</b> para
                  criar a primeira opção.
                </div>
              )}

              {arrayOption.map((item, index) => (
                <div className={classes.optionCard} key={item.number}>
                  <Typography className={classes.sectionLabel}>
                    Opção {item.number}
                  </Typography>

                  <div className={classes.optionRow}>
                    <TextField
                      placeholder={"Digite a opção"}
                      variant="outlined"
                      defaultValue={item.value}
                      className={classes.textField}
                      style={{ width: "100%" }}
                      onChange={(event) =>
                        updateOptionValue(index, event.target.value)
                      }
                    />

                    {arrayOption.length === item.number && (
                      <IconButton
                        onClick={() => removeOption(item.number)}
                        className={classes.iconBtn}
                        aria-label="Remover opção"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </div>
                </div>
              ))}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions className={classes.dialogActions}>
          <Button
            onClick={handleClose}
            color="secondary"
            variant="outlined"
            className={classes.actionBtnSecondary}
          >
            {i18n.t("contactModal.buttons.cancel")}
          </Button>

          <Button
            type="button"
            color="primary"
            variant="contained"
            className={`${classes.btnWrapper} ${classes.actionBtn}`}
            onClick={handleSave}
          >
            {labels.btn}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FlowBuilderMenuModal;
