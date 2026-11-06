import React, { useState, useEffect, useRef } from "react";

import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CircularProgress from "@material-ui/core/CircularProgress";
import CloseIcon from "@material-ui/icons/Close";
import Box from "@material-ui/core/Box";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { getFlowBuilderDialogShellStyles } from "../../theme/flowBuilderDialogShellStyles";

const useStyles = makeStyles((theme) => ({
  ...getFlowBuilderDialogShellStyles(theme),
  previewImage: {
    maxWidth: "100%",
    borderRadius: 12,
    border: `1px solid ${theme.palette.divider}`,
  },
  uploadButton: {
    borderRadius: 12,
    textTransform: "none",
  },
  buttonProgress: {
    color: green[500],
  },
}));

const FlowBuilderAddImgModal = ({ open, onSave, onUpdate, data, close }) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const [activeModal, setActiveModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState();
  const [labels, setLabels] = useState({
    title: "Adicionar imagem ao fluxo",
    btn: "Adicionar"
  });
  const [medias, setMedias] = useState([]);

  useEffect(() => {
    if (open === "edit") {
      setLabels({ title: "Editar imagem", btn: "Salvar" });
      setPreview(
        process.env.REACT_APP_BACKEND_URL + "/public/" + data.data.url
      );
      setActiveModal(true);
    } else if (open === "create") {
      setLabels({ title: "Adicionar imagem ao fluxo", btn: "Adicionar" });
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

  const handleSaveContact = async () => {
    if (open === "edit") {
      if (medias.length > 0) {
        try {
          setLoading(true);
          const formData = new FormData();
          formData.append("fromMe", true);
          medias.forEach(media => formData.append("medias", media));
          const { data: res } = await api.post("/flowbuilder/img", formData);
          onUpdate({ ...data, data: { url: res.name } });
          toast.success("Imagem alterada com sucesso!");
        } catch (err) {
          toastError(err);
        } finally {
          setLoading(false);
          handleClose();
        }
      } else {
        onUpdate({ ...data });
        handleClose();
      }
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("fromMe", true);
      medias.forEach(media => formData.append("medias", media));
      const { data: res } = await api.post("/flowbuilder/img", formData);
      onSave({ url: res.name });
      toast.success("Imagem adicionada com sucesso!");
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
      setMedias([]);
      setPreview();
      handleClose();
    }
  };

  const handleChangeMedias = e => {
    if (!e.target.files) return;
    if (e.target.files[0].size > 2000000) {
      toast.error("Arquivo é muito grande! 2MB máximo");
      return;
    }
    const selectedMedias = Array.from(e.target.files);
    setPreview(URL.createObjectURL(e.target.files[0]));
    setMedias(selectedMedias);
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
              Envie uma imagem para o fluxo
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
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className={classes.previewImage}
              />
            )}

            {!loading && (
              <Button
                variant="outlined"
                component="label"
                className={classes.uploadButton}
              >
                Enviar imagem
                <input
                  type="file"
                  accept="image/png, image/jpg, image/jpeg"
                  hidden
                  disabled={loading}
                  onChange={handleChangeMedias}
                />
              </Button>
            )}

            {loading && (
              <Box display="flex" justifyContent="center">
                <CircularProgress size={28} />
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions className={classes.dialogActions}>
          {!loading && (
            <>
              <Button
                onClick={() => {
                  handleClose();
                  setMedias([]);
                  setPreview();
                }}
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
            </>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FlowBuilderAddImgModal;
