import {
  Box,
  Button,
  Container,
  CssBaseline,
  Grid,
  Link,
  TextField,
  Typography,
  Fade,
  Grow,
  LinearProgress,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    background:
      theme.palette.type === "dark"
        ? "radial-gradient(circle at top, rgba(0,188,212,0.12) 0%, rgba(6,14,26,1) 52%)"
        : "radial-gradient(circle at top, rgba(2,136,209,0.08) 0%, rgba(245,249,255,1) 58%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(3, 2),
  },
  container: {
    position: "relative",
    zIndex: 1,
  },
  formBox: {
    background: theme.palette.background.paper,
    borderRadius: 16,
    padding: theme.spacing(4),
    boxShadow:
      theme.palette.type === "dark"
        ? "0 12px 36px rgba(0,0,0,0.55)"
        : "0 16px 34px rgba(15,23,42,0.14)",
    border: `1px solid ${theme.palette.divider}`,
    maxWidth: 460,
    width: "100%",
  },
  title: {
    color: theme.palette.text.primary,
    fontWeight: 800,
    marginBottom: theme.spacing(0.5),
    textAlign: "center",
    letterSpacing: "-0.01em",
  },
  subtitle: {
    textAlign: "center",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
  },
  form: {
    width: "100%",
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 10,
      transition: "all 0.2s ease",
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
      },
    },
  },
  submitButton: {
    margin: theme.spacing(3, 0, 2),
    padding: theme.spacing(1.35),
    borderRadius: 10,
    textTransform: "none",
    fontWeight: 800,
    fontSize: "1rem",
    position: "relative",
    overflow: "hidden",
    boxShadow:
      theme.palette.type === "dark"
        ? "0 8px 20px rgba(0,0,0,0.45)"
        : "0 6px 18px rgba(2,136,209,0.3)",
    "&:hover": {
      boxShadow:
        theme.palette.type === "dark"
          ? "0 10px 24px rgba(0,0,0,0.52)"
          : "0 10px 22px rgba(2,136,209,0.36)",
    },
  },
  loadingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '4px',
    '& .MuiLinearProgress-bar': {
      background: 'rgba(255, 255, 255, 0.8)',
    },
  },
  sentAnimation: {
    position: "relative",
    background: "linear-gradient(45deg,rgb(23, 80, 45),rgb(17, 75, 40))",
    '&:after': {
      content: '"✉️"',
      position: "absolute",
      fontSize: "24px",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      animation: "flyAway 1s ease-out forwards",
    },
  },
  link: {
    color: theme.palette.text.secondary,
    textDecoration: "none",
    transition: "all 0.2s ease",
    "&:hover": {
      color: theme.palette.primary.main,
      transform: "translateX(3px)",
    },
  },
  '@keyframes flyAway': {
    '0%': { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
    '100%': { transform: 'translate(-50%, -150%) scale(0.5)', opacity: 0 },
  },
}));

const EsqueciSenha = () => {
  const classes = useStyles();
  const [email, setEmail] = useState("");
  const [visivel, setVisivel] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  React.useEffect(() => {
    setVisivel(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setEnviando(false);
      setEnviado(true);
      toast.success("Link de redefinição de senha enviado com sucesso");
      setTimeout(() => setEnviado(false), 2000); // Reset após 2 segundos
    } catch (err) {
      setEnviando(false);
      toastError(err);
    }
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Fade in={visivel} timeout={1000}>
        <Container className={classes.container} maxWidth="xs">
          <Grow in={visivel} timeout={1200}>
            <Box className={classes.formBox}>
              <Typography variant="h4" className={classes.title}>
                Redefinir Senha
              </Typography>
              <Typography variant="body2" className={classes.subtitle}>
                Informe seu e-mail para receber o link de redefinicao.
              </Typography>
              <form className={classes.form} noValidate onSubmit={handleSubmit}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Digite seu e-mail"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={classes.textField}
                  disabled={enviando}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={`${classes.submitButton} ${enviado ? classes.sentAnimation : ''}`}
                  disabled={enviando || enviado}
                >
                  {enviando ? "Enviando..." : enviado ? "Enviado!" : "Enviar Link de Redefinição"}
                  {enviando && (
                    <LinearProgress className={classes.loadingBar} />
                  )}
                </Button>
                <Grid container justifyContent="center">
                  <Grid item>
                    <Link
                      component={RouterLink}
                      to="/login"
                      className={classes.link}
                    >
                      Voltar ao Login
                    </Link>
                  </Grid>
                </Grid>
              </form>
            </Box>
          </Grow>
        </Container>
      </Fade>
    </div>
  );
};

export default EsqueciSenha;
