import { i18n } from "../../translate/i18n";

import React, { useState, useEffect, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Button, TextField, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { IconButton, InputAdornment, Switch } from "@mui/material";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import EmailIcon from "@material-ui/icons/Email";
import LockIcon from "@material-ui/icons/Lock";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import { Helmet } from "react-helmet";

import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import defaultLoginLogo from "../../assets/login-logo-default.png";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    width: "100vw",
    height: "100vh",
    background:
      theme.palette.type === "dark"
        ? "radial-gradient(circle at top, rgba(0,188,212,0.08) 0%, rgba(6,14,26,1) 52%)"
        : "radial-gradient(circle at top, rgba(2,136,209,0.06) 0%, rgba(245,249,255,1) 58%)",
    [theme.breakpoints.down("sm")]: { flexDirection: "column" },
  },
  imageSide: {
    flex: 1,
    backgroundSize: "cover",
    backgroundPosition: "center center",
    height: "100%",
  },
  formSide: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
    background: "transparent",
    [theme.breakpoints.down("sm")]: { padding: "20px" },
  },
  formContainer: {
    width: "100%",
    maxWidth: "430px",
    background: theme.palette.background.paper,
    borderRadius: "16px",
    border: `1px solid ${theme.palette.divider}`,
    boxShadow:
      theme.palette.type === "dark"
        ? "0 12px 36px rgba(0,0,0,0.55)"
        : "0 16px 34px rgba(15,23,42,0.14)",
    padding: "32px",
    animation: "$fadeIn 1s ease-in-out",
    [theme.breakpoints.down("sm")]: { maxWidth: "340px", padding: "20px" },
  },
  "@keyframes fadeIn": {
    "0%": { opacity: 0, transform: "translateY(20px)" },
    "100%": { opacity: 1, transform: "translateY(0)" },
  },
  logoImg: {
    display: "block",
    margin: "0 auto 20px",
    maxWidth: "150px",
    height: "auto",
  },
  submitBtn: {
    marginTop: "20px",
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: "10px",
    padding: "12px",
    fontWeight: 800,
    width: "100%",
    textTransform: "none",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
      boxShadow:
        theme.palette.type === "dark"
          ? "0 10px 24px rgba(0,0,0,0.52)"
          : "0 10px 22px rgba(2,136,209,0.36)",
    },
  },
  registerBtn: {
    backgroundColor:
      theme.palette.type === "dark"
        ? "rgba(255,255,255,0.06)"
        : theme.palette.grey[100],
    color: theme.palette.text.primary,
    borderRadius: "10px",
    padding: "12px",
    fontWeight: 700,
    width: "100%",
    marginTop: "10px",
    textTransform: "none",
    border: `1px solid ${theme.palette.divider}`,
    "&:hover": {
      backgroundColor:
        theme.palette.type === "dark"
          ? "rgba(255,255,255,0.1)"
          : theme.palette.grey[200],
    },
  },
  forgotPassword: { marginTop: "15px", textAlign: "center" },
  forgotPasswordLink: {
    color: theme.palette.primary.main,
    textDecoration: "none",
    fontWeight: "500",
    "&:hover": { textDecoration: "underline" },
  },
  rememberMeContainer: {
    display: "flex",
    alignItems: "center",
    marginTop: "8px",
  },
  rememberText: {
    color: theme.palette.text.primary,
    fontWeight: 600,
  },
  whatsappButton: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    backgroundColor: theme.palette.primary.main,
    borderRadius: "50%",
    width: "60px",
    height: "60px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow:
      theme.palette.type === "dark"
        ? "0 8px 18px rgba(0,0,0,0.45)"
        : "0 6px 16px rgba(2,136,209,0.35)",
    cursor: "pointer",
    zIndex: 999,
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
      transform: "scale(1.1)",
    },
  },
  whatsappIcon: {
    fontSize: 34,
    color: "#fff",
  },
  title: {
    fontWeight: 800,
    color: theme.palette.text.primary,
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    color: theme.palette.text.secondary,
    textAlign: "center",
    marginBottom: 8,
  },
  inputRoot: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 10,
      backgroundColor:
        theme.palette.type === "dark"
          ? "rgba(255,255,255,0.03) !important"
          : `${theme.palette.background.paper} !important`,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.divider,
    },
    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.text.secondary,
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
    },
    "& .MuiInputBase-input": {
      color: `${theme.palette.text.primary} !important`,
    },
    "& input:-webkit-autofill": {
      WebkitBoxShadow:
        theme.palette.type === "dark"
          ? "0 0 0 1000px #10243d inset !important"
          : "0 0 0 1000px #ffffff inset !important",
      WebkitTextFillColor: `${theme.palette.text.primary} !important`,
      caretColor: `${theme.palette.text.primary} !important`,
      borderRadius: 10,
      transition: "background-color 9999s ease-in-out 0s",
    },
  },
  fieldLabel: {
    marginTop: 8,
    marginBottom: 6,
    color: theme.palette.text.secondary,
    fontWeight: 600,
    fontSize: "0.9rem",
  },
}));

const backendUrl = process.env.REACT_APP_BACKEND_URL || "";

// resolve URL vinda do backend (relativa ou absoluta) com fallback
const resolveImageUrl = (value, fallback) => {
  if (!value) return fallback;
  if (value.startsWith("http")) return value;
  if (!backendUrl) return value;
  const base = backendUrl.replace(/\/+$/, "");
  const clean = value.replace(/^\/+/, "");
  return `${base}/${clean}`;
};

const Login = () => {
  const classes = useStyles();
  const { handleLogin } = useContext(AuthContext);

  const [user, setUser] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [branding, setBranding] = useState({
    loginLogo: "/logo.jpg",
    loginBackground: "https://soushop.com.br/capa.png",
    loginWhatsapp: "https://wa.me/5500000000000",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userCreationEnabled, setUserCreationEnabled] = useState(true);

  // ========= Tema e aparência da página =============
  useEffect(() => {
    try {
      localStorage.setItem("theme", "light");
    } catch (e) {}
    document.documentElement.classList.remove("dark");
    document.documentElement.setAttribute("data-theme", "light");
    document.body.classList.add("login-page");
    return () => document.body.classList.remove("login-page");
  }, []);

  // ========= Buscar settings globais ============
  useEffect(() => {
  const fetchBranding = async () => {
    try {
      const { data } = await api.get("/global-config/public-branding");

      setBranding({
        loginLogo: data.loginLogo || "/logo.jpg",
        loginBackground:
          data.loginBackground ||
          "https://soushop.com.br/capa.png",
        loginWhatsapp: data.loginWhatsapp || "https://wa.me/5500000000000",
      });
    } catch (err) {
      console.error("Erro ao carregar branding:", err);
    }
  };

  fetchBranding();
}, []);


  // ========== Verificar se cadastro está habilitado ==========
  useEffect(() => {
    const fetchUserCreationStatus = async () => {
      try {
        const { data } = await api.get("/settings/userCreation");
        setUserCreationEnabled(data.userCreation === "enabled");
      } catch (err) {
        setUserCreationEnabled(false);
      }
    };

    fetchUserCreationStatus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const lang = localStorage.getItem("i18nextLng") || "pt";
    i18n.changeLanguage(lang);
    handleLogin(user);
  };

  return (
    <>
      <Helmet>
        <title>Login</title>
      </Helmet>

      <div className={classes.root}>
        {/* ===== Capa dinâmica ===== */}
        <div
          className={classes.imageSide}
          style={{
            backgroundImage: `url('${resolveImageUrl(
              branding.loginBackground,
              "https://soushop.com.br/capa.png"
            )}')`,
          }}
        ></div>

        <div className={classes.formSide}>
          <form className={classes.formContainer} onSubmit={handleSubmit}>
            {/* LOGO DINÂMICO */}
            <img
              src={resolveImageUrl(branding.loginLogo, defaultLoginLogo)}
              alt="Logo"
              className={classes.logoImg}
            />

            {error && <Typography color="error">{error}</Typography>}
            <Typography variant="h5" className={classes.title}>
              {i18n.t("login.title")}
            </Typography>
            <Typography variant="body2" className={classes.subtitle}>
              {i18n.t("login.subtitle")}
            </Typography>

            <Typography className={classes.fieldLabel}>
              {i18n.t("login.form.email")}
            </Typography>
            <TextField
              className={classes.inputRoot}
              variant="outlined"
              fullWidth
              margin="normal"
              type="email"
              placeholder={i18n.t("login.form.email")}
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />

            <Typography className={classes.fieldLabel}>
              {i18n.t("login.form.password")}
            </Typography>
            <TextField
              className={classes.inputRoot}
              variant="outlined"
              fullWidth
              margin="normal"
              placeholder={i18n.t("login.form.password")}
              type={showPassword ? "text" : "password"}
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      style={{ color: "#374151" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <div className={classes.rememberMeContainer}>
              <Switch
                checked={user.remember}
                onChange={(e) =>
                  setUser({ ...user, remember: e.target.checked })
                }
              />
              <Typography className={classes.rememberText}>
                {i18n.t("login.form.remember")}
              </Typography>
            </div>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={classes.submitBtn}
            >
              {i18n.t("login.buttons.submit")}
            </Button>

            {userCreationEnabled && (
              <Button
                component={RouterLink}
                to="/signup"
                variant="contained"
                className={classes.registerBtn}
              >
                {i18n.t("login.buttons.register")}
              </Button>
            )}

            <div className={classes.forgotPassword}>
              <RouterLink
                to="/forgot-password"
                className={classes.forgotPasswordLink}
              >
                {i18n.t("login.buttons.forgot")}
              </RouterLink>
            </div>
          </form>
        </div>

        {/* ===== BOTÃO WHATSAPP DINÂMICO ===== */}
        <div
          className={classes.whatsappButton}
          onClick={() => window.open(branding.loginWhatsapp)}
        >
          <WhatsAppIcon className={classes.whatsappIcon} />
        </div>
      </div>
    </>
  );
};

export default Login;
