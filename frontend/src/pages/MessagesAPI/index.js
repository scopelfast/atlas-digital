import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";

import { i18n } from "../../translate/i18n";
import { Button, CircularProgress, Grid, TextField, Typography } from "@material-ui/core";
import { Field, Form, Formik } from "formik";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";

import axios from "axios";
import usePlans from "../../hooks/usePlans";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => {
  const isDark = theme.palette.type === "dark";

  return {
  pageRoot: {
    flex: 1,
    padding: theme.spacing(2),
    paddingBottom: theme.spacing(8),
    marginLeft: 5,
    background: theme.palette.background.default,
  },
  heroCard: {
    padding: theme.spacing(3),
    borderRadius: 16,
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
    boxShadow: isDark ? "none" : "0 2px 10px rgba(15, 23, 42, 0.04)",
  },
  sectionCard: {
    borderRadius: 16,
    border: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(2),
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
    boxShadow: isDark ? "none" : "0 1px 6px rgba(15, 23, 42, 0.04)",
  },
  sectionHeader: {
    padding: theme.spacing(1.5, 2),
    backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  sectionBody: {
    padding: theme.spacing(2),
  },
  elementMargin: {
    marginBottom: theme.spacing(2),
  },
  formContainer: {
    width: "100%",
  },
  textRight: {
    textAlign: "right"
  },
  infoBlock: {
    padding: theme.spacing(2),
    borderRadius: 12,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "#fcfdff",
    height: "100%",
  },
  testBlock: {
    padding: theme.spacing(2),
    borderRadius: 12,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    height: "100%",
  },
  codeBox: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1.5),
    borderRadius: 10,
    backgroundColor: "#0f172a",
    color: "#e2e8f0",
    fontFamily: "Consolas, Monaco, monospace",
    fontSize: 13,
    lineHeight: 1.6,
    overflowX: "auto",
  },
  fileInput: {
    display: "none",
  },
  filePickerRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    flexWrap: "wrap",
  },
  filePickerButton: {
    borderRadius: 10,
    textTransform: "none",
    fontWeight: 600,
    padding: theme.spacing(1, 1.75),
    minWidth: 170,
  },
  fileNameText: {
    color: theme.palette.text.secondary,
    fontSize: 13,
  },
}});

const MessagesAPI = () => {
  const classes = useStyles();
  const history = useHistory();

  const [formMessageTextData,] = useState({ token: '', number: '', body: '', userId: '', queueId: '' })
  const [formMessageMediaData,] = useState({ token: '', number: '', medias: '', body:'', userId: '', queueId: '' })
  const [file, setFile] = useState({})
  const { user } = useContext(AuthContext);

  const { getPlanCompany } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useExternalApi) {
        toast.error("Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.");
        setTimeout(() => {
          history.push(`/`)
        }, 1000);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getEndpoint = () => {
    return process.env.REACT_APP_BACKEND_URL + '/api/messages/send'
  }

  const handleSendTextMessage = async (values) => {
    const { number, body, userId, queueId } = values;
    const data = { number, body, userId, queueId };
    try {
      await axios.request({
        url: getEndpoint(),
        method: 'POST',
        data,
        headers: {
          'Content-type': 'application/json',
          'Authorization': `Bearer ${values.token}` 
        }
      })
      toast.success('Mensagem enviada com sucesso');
    } catch (err) {
      toastError(err);
    }
  }

  const handleSendMediaMessage = async (values) => {
    try {
      const firstFile = file[0];
      if (!firstFile) {
        toast.error("Selecione um arquivo para envio de mídia.");
        return;
      }
      const data = new FormData();
      data.append('number', values.number);
      data.append('body', values.body ? values.body: firstFile.name);
      data.append('userId', values.userId);
      data.append('queueId', values.queueId);
      data.append('medias', firstFile);
      await axios.request({
        url: getEndpoint(),
        method: 'POST',
        data,
        headers: {
          'Content-type': 'multipart/form-data',
          'Authorization': `Bearer ${values.token}`
        }
      })
      toast.success('Mensagem enviada com sucesso');
    } catch (err) {
      toastError(err);
    }
  }

  const renderFormMessageText = () => {
    return (
      <Formik
        initialValues={formMessageTextData}
        enableReinitialize={true}
        onSubmit={(values, actions) => {
          setTimeout(async () => {
            await handleSendTextMessage(values);
            actions.setSubmitting(false);
            actions.resetForm()
          }, 400);
        }}
        className={classes.elementMargin}
      >
        {({ isSubmitting }) => (
          <Form className={classes.formContainer}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.token")}
                  name="token"
                  autoFocus
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.number")}
                  name="number"
                  autoFocus
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.body")}
                  name="body"
                  autoFocus
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                  required
                />
              </Grid>
              <Grid item xs={12}  md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.userId")}
                  name="userId"
                  autoFocus
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                />
              </Grid>
              <Grid item xs={12}  md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.queueId")}
                  name="queueId"
                  autoFocus
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                />
              </Grid>
              <Grid item xs={12} className={classes.textRight}>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {isSubmitting ? (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  ) : 'Enviar'}
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    )
  }

  const renderFormMessageMedia = () => {
    return (
      <Formik
        initialValues={formMessageMediaData}
        enableReinitialize={true}
        onSubmit={(values, actions) => {
          setTimeout(async () => {
            await handleSendMediaMessage(values);
            actions.setSubmitting(false);
            actions.resetForm()
            document.getElementById('medias').files = null
            document.getElementById('medias').value = null
            setFile({})
          }, 400);
        }}
        className={classes.elementMargin}
      >
        {({ isSubmitting }) => (
          <Form className={classes.formContainer}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.mediaMessage.token")}
                  name="token"
                  autoFocus
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.mediaMessage.number")}
                  name="number"
                  autoFocus
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.body")}
                  name="body"
                  autoFocus
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                />
              </Grid>
              <Grid item xs={12}  md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.userId")}
                  name="userId"
                  autoFocus
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                />
              </Grid>
              <Grid item xs={12}  md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.queueId")}
                  name="queueId"
                  autoFocus
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                />
              </Grid>
              <Grid item xs={12}>
                <div className={classes.filePickerRow}>
                  <input
                    type="file"
                    name="medias"
                    id="medias"
                    className={classes.fileInput}
                    onChange={(e) => setFile(e.target.files)}
                  />
                  <label htmlFor="medias">
                    <Button
                      component="span"
                      variant="outlined"
                      color="primary"
                      className={classes.filePickerButton}
                    >
                      Escolher arquivo
                    </Button>
                  </label>
                  <Typography className={classes.fileNameText}>
                    {file && file[0] ? file[0].name : "Nenhum arquivo selecionado"}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={12} className={classes.textRight}>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {isSubmitting ? (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  ) : 'Enviar'}
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    )
  }

  return (
    <Paper
      className={classes.pageRoot}
      variant="outlined"
    >
      <Paper className={classes.heroCard} elevation={0}>
        <Typography variant="h5">{i18n.t("messagesAPI.API.title")}</Typography>
        <Typography variant="body2" color="textSecondary">
          Área de testes da API externa para envio de mensagens de texto e mídia.
        </Typography>
      </Paper>

      <Paper className={classes.sectionCard} elevation={0}>
        <div className={classes.sectionBody}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <div className={classes.infoBlock}>
                <Typography variant="h6" color="primary" gutterBottom>
                  {i18n.t("messagesAPI.API.methods.title")}
                </Typography>
                <Typography component="div">
                  <ol>
                    <li>{i18n.t("messagesAPI.API.methods.messagesText")}</li>
                    <li>{i18n.t("messagesAPI.API.methods.messagesMidia")}</li>
                  </ol>
                </Typography>
              </div>
            </Grid>
            <Grid item xs={12} md={8}>
              <div className={classes.infoBlock}>
                <Typography variant="h6" color="primary" gutterBottom>
                  {i18n.t("messagesAPI.API.instructions.title")}
                </Typography>
                <Typography component="div">
                  <b>{i18n.t("messagesAPI.API.instructions.comments")}</b><br />
                  <ul>
                    <li>{i18n.t("messagesAPI.API.instructions.comments1")}</li>
                    <li>
                      {i18n.t("messagesAPI.API.instructions.comments2")}
                      <ul>
                        <li>{i18n.t("messagesAPI.API.instructions.codeCountry")}</li>
                        <li>{i18n.t("messagesAPI.API.instructions.code")}</li>
                        <li>{i18n.t("messagesAPI.API.instructions.number")}</li>
                      </ul>
                    </li>
                  </ul>
                </Typography>
              </div>
            </Grid>
          </Grid>
        </div>
      </Paper>

      <Paper className={classes.sectionCard} elevation={0}>
        <div className={classes.sectionHeader}>
          <Typography variant="h6" color="primary">
            {i18n.t("messagesAPI.API.text.title")}
          </Typography>
        </div>
        <div className={classes.sectionBody}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <div className={classes.infoBlock}>
                <Typography component="div">
                  <p>{i18n.t("messagesAPI.API.text.instructions")}</p>
                  <b>Endpoint: </b> {getEndpoint()} <br />
                  <b>Método: </b> POST <br />
                  <b>Headers: </b> Authorization Bearer (token registrado) e Content-Type (application/json) <br />
                </Typography>
                <div className={classes.codeBox}>
                  {"{"}<br />
                  "number": "558599999999"<br />
                  "body": "Message"<br />
                  "userId": ID usuário ou ""<br />
                  "queueId": ID Fila ou ""<br />
                  "sendSignature": true/false<br />
                  "closeTicket": true/false<br />
                  {"}"}
                </div>
              </div>
            </Grid>
            <Grid item xs={12} md={6}>
              <div className={classes.testBlock}>
                <Typography className={classes.elementMargin}>
                  <b>Teste de Envio</b>
                </Typography>
                {renderFormMessageText()}
              </div>
            </Grid>
          </Grid>
        </div>
      </Paper>

      <Paper className={classes.sectionCard} elevation={0}>
        <div className={classes.sectionHeader}>
          <Typography variant="h6" color="primary">
            {i18n.t("messagesAPI.API.media.title")}
          </Typography>
        </div>
        <div className={classes.sectionBody}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <div className={classes.infoBlock}>
                <Typography component="div">
                  <p>{i18n.t("messagesAPI.API.media.instructions")}</p>
                  <b>Endpoint: </b> {getEndpoint()} <br />
                  <b>Método: </b> POST <br />
                  <b>Headers: </b> Authorization Bearer (token cadastrado) e Content-Type (multipart/form-data) <br />
                </Typography>
                <div className={classes.codeBox}>
                  FormData:<br />
                  number: 558599999999<br />
                  body: Message<br />
                  userId: ID usuário ou ""<br />
                  queueId: ID da fila ou ""<br />
                  medias: arquivo<br />
                  sendSignature: true/false<br />
                  closeTicket: true/false
                </div>
              </div>
            </Grid>
            <Grid item xs={12} md={6}>
              <div className={classes.testBlock}>
                <Typography className={classes.elementMargin}>
                  <b>Teste de Envio</b>
                </Typography>
                {renderFormMessageMedia()}
              </div>
            </Grid>
          </Grid>
        </div>
      </Paper>
    </Paper>
  );
};

export default MessagesAPI;