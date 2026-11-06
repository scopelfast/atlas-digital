import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, FieldArray, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import CircularProgress from "@material-ui/core/CircularProgress";
import Compressor from "compressorjs";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import AccessTime from "@material-ui/icons/AccessTime";
import Delete from "@material-ui/icons/Delete";
import Image from "@material-ui/icons/Image";
import Message from "@material-ui/icons/Message";
import MicNone from "@material-ui/icons/MicNone";
import Videocam from "@material-ui/icons/Videocam";
import Description from "@material-ui/icons/Description";
import { capitalize } from "../../utils/capitalize";
import {
  Box,
  Checkbox,
  Divider,
  Typography,
} from "@material-ui/core";

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
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },

  titleWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },

  title: {
    fontSize: 16,
    fontWeight: 600,
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont",
    color: theme.palette.text.primary,
  },

  subtitle: {
    fontSize: 12.5,
    color: theme.palette.text.secondary,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.inputBackground,
  },

  dialogContent: {
    padding: 16,
    background: isDark
      ? `linear-gradient(180deg, ${theme.palette.fancyBackground} 0%, ${theme.palette.background.paper} 100%)`
      : "linear-gradient(180deg, rgba(249,250,251,0.6) 0%, rgba(255,255,255,1) 100%)",
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      backgroundColor: theme.palette.inputBackground,
    },
  },

  dialogActions: {
    padding: "14px 20px",
    borderTop: `1px solid ${theme.palette.divider}`,
    gap: 10,
    backgroundColor: theme.palette.background.paper,
  },

  primaryButton: {
    borderRadius: 12,
    textTransform: "none",
    boxShadow: isDark
      ? "0 6px 18px rgba(0, 200, 232, 0.2)"
      : "0 6px 18px rgba(59, 130, 246, 0.25)",
  },

  secondaryButton: {
    borderRadius: 12,
    textTransform: "none",
  },

  blockShell: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 7,
    padding: theme.spacing(0.75),
    position: "relative",
    backgroundColor:
      theme.palette.type === "dark"
        ? "rgba(0, 200, 232, 0.04)"
        : "rgba(0, 0, 0, 0.02)",
  },

  variablesPanel: {
    width: "100%",
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 12,
    padding: theme.spacing(1.5),
    backgroundColor:
      theme.palette.type === "dark"
        ? "rgba(0, 200, 232, 0.06)"
        : "rgba(0, 0, 0, 0.02)",
  },

  variablesTitle: {
    fontWeight: 600,
    color: theme.palette.text.primary,
  },

  variablesCaption: {
    color: theme.palette.text.secondary,
    fontSize: "0.75rem",
  },

  variableDesc: {
    color: theme.palette.text.secondary,
    fontSize: "0.8125rem",
  },

  variableDescStrong: {
    color: theme.palette.text.primary,
  },

  scrollBody: {
    gap: 8,
    overflow: "auto",
    height: "70vh",
    scrollBehavior: "smooth",
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
  },

  toolbarRow: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  toolbarIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },

  loadingOuter: {
    gap: 8,
    padding: 16,
    height: "70vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingInner: {
    textAlign: "center",
    color: theme.palette.text.secondary,
  },

  mutedHint: {
    marginTop: 6,
    fontSize: 12,
    color: theme.palette.text.secondary,
    textAlign: "center",
  },

  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
  },

  extraAttr: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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

const FlowBuilderSingleBlockModal = ({
  open,
  onSave,
  onUpdate,
  data,
  close,
}) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const [activeModal, setActiveModal] = useState(false);
  const [medias, setMedias] = useState([]);
  const [elements, setElements] = useState([]);
  const [elementsSeq, setElementsSeq] = useState([]);
  const [elementsSeqEdit, setElementsSeqEdit] = useState([]);
  const [elementsEdit, setElementsEdit] = useState([]);
  const [loading, setLoading] = useState(false);
  const [variables, setVariables] = useState([]);

  const [activeMessageId, setActiveMessageId] = useState(null);

  const [numberMessages, setNumberMessages] = useState(0);
  const [numberMessagesLast, setNumberMessagesLast] = useState(0);

  const [numberInterval, setNumberInterval] = useState(0);
  const [numberIntervalLast, setNumberIntervalLast] = useState(0);
  
  const [numberImg, setNumberImg] = useState(0);
  const [numberImgLast, setNumberImgLast] = useState(0);
  const [previewImg, setPreviewImg] = useState([]);
  
  const [numberAudio, setNumberAudio] = useState(0);
  const [numberAudioLast, setNumberAudioLast] = useState(0);
  const [previewAudios, setPreviewAudios] = useState([]);
  
  const [numberVideo, setNumberVideo] = useState(0);
  const [numberVideoLast, setNumberVideoLast] = useState(0);
  const [previewVideos, setPreviewVideos] = useState([]);

  const [numberDocument, setNumberDocument] = useState(0);
  const [numberDocumentLast, setNumberDocumentLast] = useState(0);
  const [previewDocuments, setPreviewDocuments] = useState([]);

  const [labels, setLabels] = useState({
    title: "Adicionar conteúdo ao fluxo",
    btn: "Adicionar",
  });

  const handleElements = (newNameFiles) => {
    let elementsSequence = [];

    const newArrMessage = elementsSeq.filter((item) => item.includes("message"));
    const newArrInterval = elementsSeq.filter((item) => item.includes("interval"));
    const newArrImg = elementsSeq.filter((item) => item.includes("img"));
    const newArrAudio = elementsSeq.filter((item) => item.includes("audio"));
    const newArrVideo = elementsSeq.filter((item) => item.includes("video"));
    const newArrDocument = elementsSeq.filter((item) => item.includes("document"));

    for (let i = 0; i < numberMessages; i++) {
      const value = document.querySelector(`.${newArrMessage[i]}`).querySelector(".MuiInputBase-input").value;
      if (!value) {
        toast.error("Campos de mensagem vazio!");
        setLoading(false);
        throw "";
      }
      elementsSequence.push({
        type: "message",
        value: value,
        number: newArrMessage[i],
      });
    }

    for (let i = 0; i < numberInterval; i++) {
      const value = document.querySelector(`.${newArrInterval[i]}`).querySelector(".MuiInputBase-input").value;
      if (parseInt(value) === 0 || parseInt(value) > 120) {
        toast.error("Intervalo não pode ser 0 ou maior que 120!");
        setLoading(false);
        throw "";
      }
      elementsSequence.push({
        type: "interval",
        value: value,
        number: newArrInterval[i],
      });
    }

    for (let i = 0; i < numberImg; i++) {
      const onlyImg = newNameFiles !== null && newNameFiles.filter((file) => file.includes("png") || file.includes("jpg") || file.includes("jpeg"));
      const onlyImgNameOriginal = medias.filter((file) => file.name.includes("png") || file.name.includes("jpg") || file.name.includes("jpeg"));
      if (elementsSeqEdit.includes(newArrImg[i])) {
        const itemSelectedEdit = elementsEdit.filter((item) => item.number === newArrImg[i])[0];
        elementsSequence.push({ type: "img", value: itemSelectedEdit.value, original: itemSelectedEdit.original, number: itemSelectedEdit.number });
      } else {
        let indexElem = elementsSeqEdit.filter((item) => item.includes("img")).length > 0 ? elementsSeqEdit.filter((item) => item.includes("img")).length - i : i;
        elementsSequence.push({ type: "img", value: onlyImg[indexElem], original: onlyImgNameOriginal[indexElem].name, number: newArrImg[i] });
      }
    }

    for (let i = 0; i < numberAudio; i++) {
      const onlyAudio = newNameFiles !== null && newNameFiles.filter((file) => file.includes("mp3") || file.includes("ogg") || file.includes("mpeg") || file.includes("opus"));
      const onlyAudioNameOriginal = medias.filter((file) => file.name.includes("mp3") || file.name.includes("ogg") || file.name.includes("mpeg") || file.name.includes("opus"));
      if (elementsSeqEdit.includes(newArrAudio[i])) {
        const itemSelectedEdit = elementsEdit.filter((item) => item.number === newArrAudio[i])[0];
        elementsSequence.push({ type: "audio", value: itemSelectedEdit.value, original: itemSelectedEdit.original, number: itemSelectedEdit.number, record: document.querySelector(`.check${newArrAudio[i]}`).querySelector(".PrivateSwitchBase-input").checked });
      } else {
        let indexElem = elementsSeqEdit.filter((item) => item.includes("audio")).length > 0 ? elementsSeqEdit.filter((item) => item.includes("audio")).length - i : i;
        elementsSequence.push({ type: "audio", value: onlyAudio[indexElem], original: onlyAudioNameOriginal[indexElem].name, number: newArrAudio[i], record: document.querySelector(`.check${newArrAudio[i]}`).querySelector(".PrivateSwitchBase-input").checked });
      }
    }

    for (let i = 0; i < numberVideo; i++) {
      const onlyVideo = newNameFiles !== null && newNameFiles.filter((file) => file.includes("mp4") || file.includes("avi"));
      const onlyVideoNameOriginal = medias.filter((file) => file.name.includes("mp4") || file.name.includes("avi"));
      if (elementsSeqEdit.includes(newArrVideo[i])) {
        const itemSelectedEdit = elementsEdit.filter((item) => item.number === newArrVideo[i])[0];
        elementsSequence.push({ type: "video", value: itemSelectedEdit.value, original: itemSelectedEdit.original, number: itemSelectedEdit.number });
      } else {
        let indexElem = elementsSeqEdit.filter((item) => item.includes("video")).length > 0 ? elementsSeqEdit.filter((item) => item.includes("video")).length - i : i;
        elementsSequence.push({ type: "video", value: onlyVideo[indexElem], original: onlyVideoNameOriginal[indexElem].name, number: newArrVideo[i] });
      }
    }

    for (let i = 0; i < numberDocument; i++) {
      const onlyDocument = newNameFiles !== null && newNameFiles.filter((file) => file.includes("pdf") || file.includes("doc") || file.includes("docx") || file.includes("xls") || file.includes("xlsx") || file.includes("txt") || file.includes("csv"));
      const onlyDocumentNameOriginal = medias.filter((file) => file.name.includes("pdf") || file.name.includes("doc") || file.name.includes("docx") || file.name.includes("xls") || file.name.includes("xlsx") || file.name.includes("txt") || file.name.includes("csv"));
      if (elementsSeqEdit.includes(newArrDocument[i])) {
        const itemSelectedEdit = elementsEdit.filter((item) => item.number === newArrDocument[i])[0];
        elementsSequence.push({ type: "document", value: itemSelectedEdit.value, original: itemSelectedEdit.original, number: itemSelectedEdit.number });
      } else {
        let indexElem = elementsSeqEdit.filter((item) => item.includes("document")).length > 0 ? elementsSeqEdit.filter((item) => item.includes("document")).length - i : i;
        elementsSequence.push({ type: "document", value: onlyDocument[indexElem], original: onlyDocumentNameOriginal[indexElem].name, number: newArrDocument[i] });
      }
    }

    return elementsSequence;
  };

  const deleteElementsTypeOne = (id, type) => {
    if (type === "message") {
      setNumberMessages((old) => old - 1);
      setElementsSeq((old) => old.filter((item) => item !== `message${id}`));
      setElementsSeqEdit((old) => old.filter((item) => item !== `message${id}`));
      document.querySelector(`.stackMessage${id}`).remove();
    }
    if (type === "interval") {
      setNumberInterval((old) => old - 1);
      setElementsSeq((old) => old.filter((item) => item !== `interval${id}`));
      setElementsSeqEdit((old) => old.filter((item) => item !== `interval${id}`));
      document.querySelector(`.stackInterval${id}`).remove();
    }
    if (type === "img") {
      setNumberImg((old) => old - 1);
      setPreviewImg((old) => {
        setMedias((oldMedia) => {
          try {
            return oldMedia.filter((mediaItem) => mediaItem.name !== old.filter((item) => item.number === id)[0].name);
          } catch (e) {
            return oldMedia;
          }
        });
        return old.filter((item) => item.number !== id);
      });
      setElementsSeq((old) => old.filter((item) => item !== `img${id}`));
      setElementsSeqEdit((old) => old.filter((item) => item !== `img${id}`));
      document.querySelector(`.stackImg${id}`).remove();
    }
    if (type === "audio") {
      setNumberAudio((old) => old - 1);
      setPreviewAudios((old) => {
        setMedias((oldMedia) => {
          try {
            return oldMedia.filter((mediaItem) => mediaItem.name !== old.filter((item) => item.number === id)[0].name);
          } catch (e) {
            return oldMedia;
          }
        });
        return old.filter((item) => item.number !== id);
      });
      setElementsSeq((old) => old.filter((item) => item !== `audio${id}`));
      setElementsSeqEdit((old) => old.filter((item) => item !== `audio${id}`));
      document.querySelector(`.stackAudio${id}`).remove();
    }
    if (type === "video") {
      setNumberVideo((old) => old - 1);
      setPreviewVideos((old) => {
        setMedias((oldMedia) => {
          try {
            return oldMedia.filter((mediaItem) => mediaItem.name !== old.filter((item) => item.number === id)[0].name);
          } catch (e) {
            return oldMedia;
          }
        });
        return old.filter((item) => item.number !== id);
      });
      setElementsSeq((old) => old.filter((item) => item !== `video${id}`));
      setElementsSeqEdit((old) => old.filter((item) => item !== `video${id}`));
      document.querySelector(`.stackVideo${id}`).remove();
    }
    if (type === "document") {
      setNumberDocument((old) => old - 1);
      setPreviewDocuments((old) => {
        setMedias((oldMedia) => {
          try {
            return oldMedia.filter((mediaItem) => mediaItem.name !== old.filter((item) => item.number === id)[0].name);
          } catch (e) {
            return oldMedia;
          }
        });
        return old.filter((item) => item.number !== id);
      });
      setElementsSeq((old) => old.filter((item) => item !== `document${id}`));
      setElementsSeqEdit((old) => old.filter((item) => item !== `document${id}`));
      document.querySelector(`.stackDocument${id}`).remove();
    }
  };
  
  const handleChangeMediasImg = (e, number) => {
    if (!e.target.files) return;
    if (e.target.files[0].size > 2000000) {
      toast.error("Arquivo é muito grande! 2MB máximo");
      return;
    }
    const imgBlob = URL.createObjectURL(e.target.files[0]);
    setPreviewImg((old) => [...old, { number: number, url: imgBlob, name: e.target.files[0].name }]);
    setElementsSeqEdit(old => old.filter(item => item !== `img${number}`));
    const selectedMedias = Array.from(e.target.files);
    setMedias((old) => [...old, selectedMedias[0]]);
    document.querySelector(`.img${number}`).src = imgBlob;
  };

  const handleChangeAudios = (e, number) => {
    if (!e.target.files) return;
    if (e.target.files[0].size > 5000000) {
      toast.error("Arquivo é muito grande! 5MB máximo");
      return;
    }
    const audioBlob = URL.createObjectURL(e.target.files[0]);
    setPreviewAudios((old) => [...old, { number: number, url: audioBlob, name: e.target.files[0].name }]);
    setElementsSeqEdit(old => old.filter(item => item !== `audio${number}`));
    const selectedMedias = Array.from(e.target.files);
    setMedias((old) => [...old, selectedMedias[0]]);
    document.querySelector(`.audio${number}`).innerHTML = `<audio controls><source src="${audioBlob}" type="audio/mp3" />seu navegador não suporta HTML5</audio>`;
  };

  const handleChangeVideos = (e, number) => {
    if (!e.target.files) return;
    if (e.target.files[0].size > 20000000) {
      toast.error("Arquivo é muito grande! 20MB máximo");
      return;
    }
    const videoBlob = URL.createObjectURL(e.target.files[0]);
    setPreviewVideos((old) => [...old, { number: number, url: videoBlob, name: e.target.files[0].name }]);
    setElementsSeqEdit(old => old.filter(item => item !== `video${number}`));
    var divConteudo = document.createElement("div");
    const selectedMedias = Array.from(e.target.files);
    setMedias((old) => [...old, selectedMedias[0]]);
    divConteudo.innerHTML = `<video controls style="width: 200px;"><source src="${videoBlob}" type="video/mp4" />seu navegador não suporta HTML5</video>`;
    document.querySelector(`.video${number}`).appendChild(divConteudo);
  };

  const handleChangeDocuments = (e, number) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (file.size > 15000000) {
      toast.error("Arquivo é muito grande! 15MB máximo");
      return;
    }
    setPreviewDocuments((old) => [...old, { number: number, name: file.name }]);
    setElementsSeqEdit(old => old.filter(item => item !== `document${number}`));
    const selectedMedias = Array.from(e.target.files);
    setMedias((old) => [...old, selectedMedias[0]]);
    document.querySelector(`.document${number}`).textContent = file.name;
  };
  
  const imgLayout = (number, valueDefault = "") => (
    <Box className={`${classes.blockShell} stackImg${number}`} key={`stackImg${number}`}>
      <Box style={{ position: "absolute", right: 6 }}>
        <Delete style={{ cursor: "pointer" }} onClick={() => deleteElementsTypeOne(number, "img")} />
      </Box>
      <Typography align="center">Imagem</Typography>
      <Box display="flex" justifyContent="center">
        <img src={valueDefault.length > 0 ? process.env.REACT_APP_BACKEND_URL + "/public/" + valueDefault : ""} className={`img${number}`} style={{ width: "200px" }} alt="" />
      </Box>
      <Button variant="contained" component="label" className={`btnImg${number}`}>Enviar imagem<input type="file" accept="image/png, image/jpg, image/jpeg" hidden onChange={(e) => handleChangeMediasImg(e, number)} /></Button>
      <Typography className={classes.mutedHint}>
        Tamanho máximo permitido: 2MB
      </Typography>
    </Box>
  );

  const audioLayout = (number, valueDefault = "", valueRecordDefault = "") => (
    <Box className={`${classes.blockShell} stackAudio${number}`} key={`stackAudio${number}`}>
      <Box style={{ position: "absolute", right: 6 }}>
        <Delete style={{ cursor: "pointer" }} onClick={() => deleteElementsTypeOne(number, "audio")} />
      </Box>
      <Typography align="center">Audio</Typography>
      <div className={`audio${number}`} style={{ display: "flex", justifyContent: "center" }}>{valueDefault.length > 0 && (<audio controls><source src={process.env.REACT_APP_BACKEND_URL + "/public/" + valueDefault} type="audio/mp3" />seu navegador não suporta HTML5</audio>)}</div>
      <Button variant="contained" component="label" className={`btnAudio${number}`}>Enviar audio<input type="file" accept="audio/ogg, audio/mp3, audio/opus" hidden onChange={(e) => handleChangeAudios(e, number)} /></Button>
      <Box display="flex" flexDirection="row" justifyContent="center" alignItems="center" style={{ gap: 8 }}>
        <Checkbox className={`checkaudio${number}`} defaultChecked={valueRecordDefault === "ok" ? false : true} color="primary" />
        <Typography>Enviar como audio gravado na hora</Typography>
      </Box>
    </Box>
  );

  const videoLayout = (number, valueDefault = "") => (
    <Box className={`${classes.blockShell} stackVideo${number}`} key={`stackVideo${number}`}>
      <Box style={{ position: "absolute", right: 6 }}>
        <Delete style={{ cursor: "pointer" }} onClick={() => deleteElementsTypeOne(number, "video")} />
      </Box>
      <Typography align="center">Video</Typography>
      <div className={`video${number}`} style={{ display: "flex", justifyContent: "center" }}>{valueDefault.length > 0 && (<video controls style={{ width: "200px" }}><source src={process.env.REACT_APP_BACKEND_URL + "/public/" + valueDefault} type="video/mp4" />seu navegador não suporta HTML5</video>)}</div>
      <Button variant="contained" component="label" className={`btnVideo${number}`}>Enviar video<input type="file" accept="video/mp4" hidden onChange={(e) => handleChangeVideos(e, number)} /></Button>
    </Box>
  );

  const documentLayout = (number, valueDefault = "") => (
    <Box className={`${classes.blockShell} stackDocument${number}`} key={`stackDocument${number}`}>
      <Box style={{ position: "absolute", right: 6 }}>
        <Delete style={{ cursor: "pointer" }} onClick={() => deleteElementsTypeOne(number, "document")} />
      </Box>
      <Typography align="center">Documento</Typography>
      <Box display="flex" flexDirection="row" justifyContent="center" alignItems="center" style={{ gap: 8, marginTop: 8, marginBottom: 8 }}>
        <Description fontSize="small" />
        <Typography className={`document${number}`}>{valueDefault.length > 0 ? valueDefault : "Nenhum arquivo selecionado"}</Typography>
      </Box>
      <Button variant="contained" component="label" className={`btnDocument${number}`}>Enviar Documento<input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv" hidden onChange={(e) => handleChangeDocuments(e, number)} /></Button>
    </Box>
  );

  const messageLayout = (number, valueDefault = "") => (
    <Box className={`${classes.blockShell} stackMessage${number}`} key={`stackMessage${number}`}>
      <Box style={{ position: "absolute", right: 6 }}>
        <Delete style={{ cursor: "pointer" }} onClick={() => deleteElementsTypeOne(number, "message")} />
      </Box>
      <Typography align="center">Texto</Typography>
      <TextField label={"Mensagem"} defaultValue={valueDefault} multiline rows={7} className={`message${number}`} name="text" variant="outlined" margin="dense" style={{ width: "100%" }} onFocus={() => setActiveMessageId(number)} />
    </Box>
  );

  const intervalLayout = (number, valueDefault = 0) => (
    <Box className={`${classes.blockShell} stackInterval${number}`} key={`stackInterval${number}`}>
      <Box style={{ position: "absolute", right: 6 }}>
        <Delete style={{ cursor: "pointer" }} onClick={() => deleteElementsTypeOne(number, "interval")} />
      </Box>
      <Typography align="center">Intervalo</Typography>
      <TextField label={"Tempo em segundos"} className={`interval${number}`} defaultValue={valueDefault} type="number" InputProps={{ inputProps: { min: 0, max: 120 } }} variant="outlined" margin="dense" style={{ width: "100%" }} />
    </Box>
  );

  useEffect(() => {
    const localVariables = localStorage.getItem("variables");
    if (localVariables) {
      try {
        setVariables(normalizeVariables(JSON.parse(localVariables)));
      } catch (e) {
        setVariables(DEFAULT_VARIABLES);
      }
    } else {
      setVariables(DEFAULT_VARIABLES);
    }

    if (open === "edit") {
      setLabels({ title: "Editar conteúdo", btn: "Salvar" });
      setElementsSeq(data.data.seq);
      setElementsSeqEdit(data.data.seq);
      setElementsEdit(data.data.elements);
      if (data) {
        const elementsEditLoc = data.data.elements;
        const sequence = data.data.seq;
        sequence.map((item) => {
          const itemNode = elementsEditLoc.filter((inode) => inode.number === item)[0];
          if (itemNode.type === "message") {
            const numberLoc = parseInt(item.replace("message", ""));
            setElements((elm) => [...elm, messageLayout(numberLoc, itemNode.value)]);
            setNumberMessages((old) => {
              const arsOnly = sequence.filter((item) => item.includes("message"));
              const arrNumberMax = arsOnly.map((item) => parseInt(item.replace("message", "")));
              setNumberMessagesLast(Math.max.apply(null, arrNumberMax) + 1);
              return old + 1;
            });
          }
          if (itemNode.type === "interval") {
            const numberLoc = parseInt(item.replace("interval", ""));
            setElements((elm) => [...elm, intervalLayout(numberLoc, itemNode.value)]);
            setNumberInterval((old) => {
              const arsOnly = sequence.filter((item) => item.includes("interval"));
              const arrNumberMax = arsOnly.map((item) => parseInt(item.replace("interval", "")));
              setNumberIntervalLast(Math.max.apply(null, arrNumberMax) + 1);
              return old + 1;
            });
          }
          if (itemNode.type === "audio") {
            const numberLoc = parseInt(item.replace("audio", ""));
            setElements((elm) => [...elm, audioLayout(numberLoc, itemNode.value, itemNode.record ? "" : "ok")]);
            setNumberAudio((old) => {
              const arsOnly = sequence.filter((item) => item.includes("audio"));
              const arrNumberMax = arsOnly.map((item) => parseInt(item.replace("audio", "")));
              setNumberAudioLast(Math.max.apply(null, arrNumberMax) + 1);
              return old + 1;
            });
          }
          if (itemNode.type === "img") {
            const numberLoc = parseInt(item.replace("img", ""));
            setElements((elm) => [...elm, imgLayout(numberLoc, itemNode.value)]);
            setNumberImg((old) => {
              const arsOnly = sequence.filter((item) => item.includes("img"));
              const arrNumberMax = arsOnly.map((item) => parseInt(item.replace("img", "")));
              setNumberImgLast(Math.max.apply(null, arrNumberMax) + 1);
              return old + 1;
            });
          }
          if (itemNode.type === "video") {
            const numberLoc = parseInt(item.replace("video", ""));
            setElements((elm) => [...elm, videoLayout(numberLoc, itemNode.value)]);
            setNumberVideo((old) => {
              const arsOnly = sequence.filter((item) => item.includes("video"));
              const arrNumberMax = arsOnly.map((item) => parseInt(item.replace("video", "")));
              setNumberVideoLast(Math.max.apply(null, arrNumberMax) + 1);
              return old + 1;
            });
          }
          if (itemNode.type === "document") {
            const numberLoc = parseInt(item.replace("document", ""));
            setElements((elm) => [...elm, documentLayout(numberLoc, itemNode.original)]);
            setNumberDocument((old) => {
              const arsOnly = sequence.filter((item) => item.includes("document"));
              const arrNumberMax = arsOnly.map((item) => parseInt(item.replace("document", "")));
              setNumberDocumentLast(Math.max.apply(null, arrNumberMax) + 1);
              return old + 1;
            });
          }
        });
      }
      setActiveModal(true);
    }
    if (open === "create") {
      setLabels({ title: "Adicionar menu ao fluxo", btn: "Adicionar" });
      setActiveModal(true);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleClose = async () => {
    close(null);
    setActiveModal(false);
    setTimeout(() => {
      setMedias([]);
      setPreviewImg([]);
      setPreviewAudios([]);
      setPreviewVideos([]);
      setElements([]);
      setElementsSeq([]);
      setElementsEdit([]);
      setElementsSeqEdit([]);
      setNumberMessages(0);
      setNumberMessagesLast(0);
      setNumberInterval(0);
      setNumberIntervalLast(0);
      setNumberAudio(0);
      setNumberAudioLast(0);
      setNumberVideo(0);
      setNumberVideoLast(0);
      setNumberImg(0);
      setNumberImgLast(0);
      setNumberDocument(0);
      setNumberDocumentLast(0);
      setPreviewDocuments([]);
    }, 500);
  };
  
  const verifyButtonsUpload = () => {
    const newArrImg = elementsSeq.filter(item => item.includes("img"));
    const newArrAudio = elementsSeq.filter(item => item.includes("audio"));
    const newArrVideo = elementsSeq.filter(item => item.includes("video"));
    const newArrDocument = elementsSeq.filter(item => item.includes("document"));

    for (let i = 0; i < numberImg; i++) {
      const id = newArrImg[i].replace('img', '');
      const imgTag = document.querySelector(`.img${id}`);
      if (imgTag && !imgTag.src.includes('blob') && !imgTag.src.includes('/public/')) {
        return true;
      }
    }
    for (let i = 0; i < numberAudio; i++) {
      const id = newArrAudio[i].replace('audio', '');
      const audioDiv = document.querySelector(`.audio${id}`);
      if (audioDiv && audioDiv.innerHTML.trim() === "") {
        return true;
      }
    }
    for (let i = 0; i < numberVideo; i++) {
      const id = newArrVideo[i].replace('video', '');
      const videoDiv = document.querySelector(`.video${id}`);
      if (videoDiv && videoDiv.innerHTML.trim() === "") {
        return true;
      }
    }
    for (let i = 0; i < numberDocument; i++) {
        const id = newArrDocument[i].replace('document', '');
        const docText = document.querySelector(`.document${id}`).textContent;
        if (docText === "Nenhum arquivo selecionado") {
            return true;
        }
    }
    return false;
  };
  
  const handleSaveNode = async () => {
    if (open === "edit") {
      setLoading(true);
      const formData = new FormData();
      medias.forEach(async (media, idx) => {
        const file = media;
        if (!file) return;
        if (media?.type.split("/")[0] == "image") {
          new Compressor(file, {
            quality: 0.7,
            async success(media) {
              formData.append("medias", media);
              formData.append("body", media.name);
            },
            error(err) {
              alert("erro");
              console.log(err.message);
            },
          });
        } else {
          formData.append("medias", media);
          formData.append("body", media.name);
        }
      });
      setTimeout(async () => {
        if ((numberAudio === 0 && numberVideo === 0 && numberImg === 0 && numberDocument === 0) || medias.length === 0) {
          try {
            const mountData = { seq: elementsSeq, elements: handleElements(null) };
            onUpdate({ ...data, data: mountData });
            toast.success("Conteúdo adicionada com sucesso!");
            handleClose();
            setLoading(false);
            return;
          } catch (e) {
            console.log(e);
            setLoading(false);
          }
          return;
        }
        const verify = verifyButtonsUpload();
        if (verify) {
          setLoading(false);
          return toast.error("Delete os cards vazios ou envie os arquivos pendentes.");
        }
        await api.post("/flowbuilder/content", formData)
          .then(async (res) => {
            const mountData = { seq: elementsSeq, elements: handleElements(res.data) };
            onUpdate({ ...data, data: mountData });
            toast.success("Conteúdo adicionada com sucesso!");
            await handleClose();
            setLoading(false);
          })
          .catch((error) => {
            console.log(error);
          });
      }, 1500);
    } else if (open === "create") {
      setLoading(true);
      const formData = new FormData();
      medias.forEach(async (media, idx) => {
        const file = media;
        if (!file) return;
        if (media?.type.split("/")[0] == "image") {
          new Compressor(file, {
            quality: 0.7,
            async success(media) {
              formData.append("medias", media);
              formData.append("body", media.name);
            },
            error(err) {
              alert("erro");
              console.log(err.message);
            },
          });
        } else {
          formData.append("medias", media);
          formData.append("body", media.name);
        }
      });
      setTimeout(async () => {
        if (numberAudio === 0 && numberVideo === 0 && numberImg === 0 && numberDocument === 0) {
          try {
            const mountData = { seq: elementsSeq, elements: handleElements(null) };
            onSave({ ...mountData });
            toast.success("Conteúdo adicionada com sucesso!");
            handleClose();
            setLoading(false);
            return;
          } catch (e) {
            setLoading(false);
          }
        }
        const verify = verifyButtonsUpload();
        if (verify) {
          setLoading(false);
          return toast.error("Delete os cards vazios ou envie os arquivos pendentes.");
        }
        await api.post("/flowbuilder/content", formData)
          .then((res) => {
            const mountData = { seq: elementsSeq, elements: handleElements(res.data) };
            onSave({ ...mountData });
            toast.success("Conteúdo adicionada com sucesso!");
            handleClose();
            setLoading(false);
          })
          .catch((error) => {
            console.log(error);
          });
      }, 1500);
    }
  };

  const scrollToBottom = (className) => {
    const element = document.querySelector(className);
    element.scrollTop = element.scrollHeight;
  };

  const VARIABLE_LABELS = {
    firstName: "Primeiro nome do contato",
    name: "Nome completo do contato",
    userName: "Nome do atendente",
    ms: "Saudação automática (Bom dia, Boa tarde, Boa noite)",
    protocol: "Número do protocolo",
    date: "Data atual",
    hour: "Hora atual",
    ticket_id: "Número do chamado",
    queue: "Setor / fila do atendimento",
    connection: "Conexão (WhatsApp)"
  };

  const DEFAULT_VARIABLES = Object.keys(VARIABLE_LABELS).map((key) => ({
    key,
    label: VARIABLE_LABELS[key],
  }));

  
  const variableList = React.useMemo(() => {
    // Mostra sempre as variáveis do sistema com descrição amigável (Typebot-style).
    // Se existirem variáveis personalizadas salvas, adiciona abaixo sem duplicar.
    const custom =
      (variables || []).filter((v) => v && v.key && !VARIABLE_LABELS[v.key]) || [];
    const merged = [...DEFAULT_VARIABLES];
    custom.forEach((v) => merged.push({ key: v.key, label: v.label || v.key }));
    return merged;
  }, [variables]);
const normalizeVariables = (raw) => {
    // Accepts:
    //  - ["firstName", "name", ...]
    //  - [{ key: "firstName", label: "..." }, ...]
    if (!raw) return DEFAULT_VARIABLES;

    if (Array.isArray(raw)) {
      if (raw.length === 0) return DEFAULT_VARIABLES;

      if (typeof raw[0] === "string") {
        return raw.map((key) => ({
          key,
          label: VARIABLE_LABELS[key] || key,
        }));
      }

      if (typeof raw[0] === "object") {
        return raw
          .filter((v) => v && (v.key || v.name))
          .map((v) => {
            const key = v.key || v.name;
            return { key, label: v.label || VARIABLE_LABELS[key] || key };
          });
      }
    }

    return DEFAULT_VARIABLES;
  };

  const variableFormatter = (key) => `{{${key}}}`;

  const insertAtCursor = (el, text) => {
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const before = el.value.slice(0, start);
    const after = el.value.slice(end);
    el.value = before + text + after;

    const pos = start + text.length;
    try {
      el.setSelectionRange(pos, pos);
    } catch (e) {}
    el.focus();
  };

  const handleInsertVariable = (key) => {
    const token = variableFormatter(key) + " ";
    const targetId = activeMessageId ?? (() => {
      // fallback to first message block in the sequence
      const first = elementsSeq.find((x) => x.includes("message"));
      if (!first) return null;
      return parseInt(first.replace("message", ""));
    })();

    if (targetId === null || targetId === undefined) {
      toast.info("Adicione um bloco de texto para inserir variáveis.");
      return;
    }

    const root = document.querySelector(`.message${targetId}`);
    const input = root?.querySelector("textarea") || root?.querySelector("input");
    if (!input) {
      toast.error("Não foi possível inserir a variável no texto.");
      return;
    }
    insertAtCursor(input, token);
  };

  return (
    <div>
      <Dialog
        open={activeModal}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        scroll="paper"
        classes={{ paper: classes.dialogPaper }}
      >
        {!loading && (
          <DialogTitle id="form-dialog-title" className={classes.dialogTitle}>
            <div className={classes.titleWrapper}>
              <Typography className={classes.title}>
                {labels.title}
              </Typography>
              <Typography className={classes.subtitle}>
                Monte os blocos de conteúdo do fluxo
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
        )}
        <Box display="flex" flexDirection="column" flex={1} minHeight={0}>
          <Box
            className={`body-card ${classes.dialogContent} ${classes.scrollBody}`}
            style={{ display: loading ? "none" : "flex" }}
          >
            {elements.map((item, idx) => (
              <React.Fragment key={idx}>{item}</React.Fragment>
            ))}
            <Box className={classes.toolbarRow}>
              <Button variant="contained" color="primary" onClick={() => {
                setElements((old) => [...old, messageLayout(numberMessagesLast)]);
                setNumberMessages((old) => { setElementsSeq((oldEleme) => [...oldEleme, `message${numberMessagesLast}`]); return old + 1; });
                setNumberMessagesLast((old) => old + 1);
                setTimeout(() => { scrollToBottom(".body-card"); }, 100);
              }}><Message className={classes.toolbarIcon} />Texto</Button>
              <Button variant="contained" color="primary" onClick={() => {
                setElements((old) => [...old, intervalLayout(numberIntervalLast)]);
                setNumberInterval((old) => { setElementsSeq((oldEleme) => [...oldEleme, `interval${numberIntervalLast}`]); return old + 1; });
                setNumberIntervalLast((old) => old + 1);
                setTimeout(() => { scrollToBottom(".body-card"); }, 100);
              }}><AccessTime className={classes.toolbarIcon} />Intervalo</Button>
              <Button variant="contained" color="primary" onClick={() => {
                setElements((old) => [...old, imgLayout(numberImgLast)]);
                setNumberImg((old) => { setElementsSeq((oldEleme) => [...oldEleme, `img${numberImgLast}`]); return old + 1; });
                setNumberImgLast((old) => old + 1);
                setTimeout(() => { scrollToBottom(".body-card"); }, 100);
              }}><Image className={classes.toolbarIcon} />Imagem</Button>
              <Button variant="contained" color="primary" onClick={() => {
                setElements((old) => [...old, audioLayout(numberAudioLast)]);
                setNumberAudio((old) => { setElementsSeq((oldEleme) => [...oldEleme, `audio${numberAudioLast}`]); return old + 1; });
                setNumberAudioLast((old) => old + 1);
                setTimeout(() => { scrollToBottom(".body-card"); }, 100);
              }}><MicNone className={classes.toolbarIcon} />Audio</Button>
              <Button variant="contained" color="primary" onClick={() => {
                setElements((old) => [...old, videoLayout(numberVideoLast)]);
                setNumberVideo((old) => { setElementsSeq((oldEleme) => [...oldEleme, `video${numberVideoLast}`]); return old + 1; });
                setNumberVideoLast((old) => old + 1);
                setTimeout(() => { scrollToBottom(".body-card"); }, 100);
              }}><Videocam className={classes.toolbarIcon} />Video</Button>
              <Button variant="contained" color="primary" onClick={() => {
                  setElements((old) => [...old, documentLayout(numberDocumentLast)]);
                  setNumberDocument((old) => {
                    setElementsSeq((oldEleme) => [...oldEleme, `document${numberDocumentLast}`]);
                    return old + 1;
                  });
                  setNumberDocumentLast((old) => old + 1);
                  setTimeout(() => { scrollToBottom(".body-card"); }, 100);
              }}><Description className={classes.toolbarIcon} />Documento</Button>
            </Box>
            <Divider />
            <Box className={classes.variablesPanel}>
              <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" style={{ marginBottom: 8 }}>
                <Typography className={classes.variablesTitle}>Variáveis</Typography>
                <Typography className={classes.variablesCaption}>
                  Clique para inserir no texto
                </Typography>
              </Box>

              <Box display="flex" flexDirection="row" flexWrap="wrap" style={{ gap: 8, marginBottom: 8 }}>
                {variableList &&
                  variableList.map((v) => (
                    <Button
                      key={v.key}
                      variant="outlined"
                      size="small"
                      onClick={() => handleInsertVariable(v.key)}
                      style={{
                        borderRadius: 999,
                        textTransform: "none",
                        paddingLeft: 10,
                        paddingRight: 10,
                      }}
                    >
                      {variableFormatter(v.key)}
                    </Button>
                  ))}
              </Box>

              <Box style={{ maxHeight: 140, overflow: "auto" }}>
                {variableList &&
                  variableList.map((v) => (
                    <Typography key={`desc-${v.key}`} variant="body2" className={classes.variableDesc}>
                      <strong className={classes.variableDescStrong}>{variableFormatter(v.key)}</strong> — {v.label}
                    </Typography>
                  ))}
              </Box>
            </Box>
          </Box>

          <DialogActions className={classes.dialogActions}>
            <Button onClick={handleClose} variant="outlined" className={classes.secondaryButton} style={{ display: loading ? "none" : undefined }}>{i18n.t("contactModal.buttons.cancel")}</Button>
            <Button type="submit" color="primary" variant="contained" className={classes.primaryButton} onClick={() => handleSaveNode()} style={{ display: loading ? "none" : undefined }}>{`${labels.btn}`}</Button>
          </DialogActions>
        </Box>
        {loading && (
          <Box className={classes.loadingOuter}>
            <Box className={classes.loadingInner}>
              <Typography>Subindo os arquivos e criando o conteúdo...</Typography>
              <Box style={{ alignSelf: "center", marginTop: 12 }}><CircularProgress /></Box>
            </Box>
          </Box>
        )}
      </Dialog>
    </div>
  );
};

export default FlowBuilderSingleBlockModal;