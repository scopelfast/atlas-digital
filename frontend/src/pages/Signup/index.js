import React, { useState, useEffect } from "react";
import qs from "query-string";
import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form, Field } from "formik";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import usePlans from "../../hooks/usePlans";
import { i18n } from "../../translate/i18n";
import { FormControl } from "@material-ui/core";
import { MenuItem, Select } from "@material-ui/core";
import { openApi } from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      theme.palette.type === "dark"
        ? "radial-gradient(circle at top, rgba(0,188,212,0.12) 0%, rgba(6,14,26,1) 52%)"
        : "radial-gradient(circle at top, rgba(2,136,209,0.08) 0%, rgba(245,249,255,1) 58%)",
    padding: theme.spacing(3, 2),
  },
  paper: {
    width: "100%",
    maxWidth: 560,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: theme.palette.background.paper,
    padding: theme.spacing(4, 4, 3),
    borderRadius: 16,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow:
      theme.palette.type === "dark"
        ? "0 12px 36px rgba(0,0,0,0.55)"
        : "0 16px 34px rgba(15,23,42,0.14)",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
    width: 56,
    height: 56,
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(2),
  },
  title: {
    marginBottom: theme.spacing(0.5),
    fontWeight: 800,
    letterSpacing: "-0.01em",
  },
  subtitle: {
    marginBottom: theme.spacing(1.5),
    color: theme.palette.text.secondary,
    textAlign: "center",
  },
  fieldRoot: {
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
    "& .MuiSelect-icon": {
      color: `${theme.palette.text.primary} !important`,
    },
    "& .MuiSelect-root": {
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
    marginBottom: 6,
    color: theme.palette.text.secondary,
    fontWeight: 600,
    fontSize: "0.9rem",
  },
  planMenuItem: {
    whiteSpace: "normal",
    lineHeight: 1.35,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    fontWeight: 800,
    borderRadius: 10,
    minHeight: 44,
    textTransform: "none",
    boxShadow:
      theme.palette.type === "dark"
        ? "0 8px 20px rgba(0,0,0,0.45)"
        : "0 6px 18px rgba(2,136,209,0.3)",
  },
}));

const UserSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Obrigatório"),
  companyName: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Obrigatório"),
  password: Yup.string().min(5, "Too Short!").max(50, "Too Long!"),
  email: Yup.string().email("Invalid email").required("Obrigatório"),
  phone: Yup.string().required("Obrigatório"),
});

const SignUp = () => {
  const classes = useStyles();
  const history = useHistory();
  const { getPlanList } = usePlans();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userCreationEnabled, setUserCreationEnabled] = useState(true);

  let companyId = null;
  const params = qs.parse(window.location.search);
  if (params.companyId !== undefined) {
    companyId = params.companyId;
  }

  const initialState = {
    name: "",
    email: "",
    password: "",
    phone: "",
    companyId,
    companyName: "",
    planId: "",
  };

  const [user] = useState(initialState);

  const backendUrl =
    process.env.REACT_APP_BACKEND_URL === "https://localhost:8090"
      ? "https://localhost:8090"
      : process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const fetchUserCreationStatus = async () => {
      try {
        const response = await fetch(`${backendUrl}/settings/userCreation`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user creation status");
        }

        const data = await response.json();
        const isEnabled = data.userCreation === "enabled";
        setUserCreationEnabled(isEnabled);

        if (!isEnabled) {
          toast.info("Cadastro de novos usuários está desabilitado.");
          history.push("/login");
        }
      } catch (err) {
        console.error("Erro ao verificar userCreation:", err);
        setUserCreationEnabled(false);
        toast.error("Erro ao verificar permissão de cadastro.");
        history.push("/login");
      }
    };

    fetchUserCreationStatus();
  }, [backendUrl, history]);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const planList = await getPlanList({ listPublic: "false" });
      setPlans(planList);
      setLoading(false);
    };
    fetchData();
  }, [getPlanList]);

  const handleSignUp = async (values) => {
    try {
      await openApi.post("/auth/signup", values);
      toast.success(i18n.t("signup.toasts.success"));
      history.push("/login");
    } catch (err) {
      toastError(err);
    }
  };

  if (!userCreationEnabled) {
    return null;
  }

  return (
    <>
      <CssBaseline />
      <div className={classes.root}>
      <Container component="main" maxWidth="sm">
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5" className={classes.title}>
          {i18n.t("signup.title")}
        </Typography>
        <Typography variant="body2" className={classes.subtitle}>
          Preencha os dados abaixo para criar sua conta e iniciar a configuracao da empresa.
        </Typography>
        <Formik
          initialValues={user}
          enableReinitialize={true}
          validationSchema={UserSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSignUp(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting }) => (
            <Form className={classes.form}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography className={classes.fieldLabel}>
                    {i18n.t("signup.form.company")}
                  </Typography>
                  <Field
                    as={TextField}
                    className={classes.fieldRoot}
                    variant="outlined"
                    fullWidth
                    id="companyName"
                    placeholder={i18n.t("signup.form.company")}
                    error={touched.companyName && Boolean(errors.companyName)}
                    helperText={touched.companyName && errors.companyName}
                    name="companyName"
                    autoComplete="companyName"
                    autoFocus
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography className={classes.fieldLabel}>
                    {i18n.t("signup.form.name")}
                  </Typography>
                  <Field
                    as={TextField}
                    className={classes.fieldRoot}
                    autoComplete="name"
                    name="name"
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="outlined"
                    fullWidth
                    id="name"
                    placeholder={i18n.t("signup.form.name")}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography className={classes.fieldLabel}>
                    {i18n.t("signup.form.email")}
                  </Typography>
                  <Field
                    as={TextField}
                    className={classes.fieldRoot}
                    variant="outlined"
                    fullWidth
                    id="email"
                    placeholder={i18n.t("signup.form.email")}
                    name="email"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    autoComplete="email"
                    inputProps={{ style: { textTransform: "lowercase" } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography className={classes.fieldLabel}>
                    {i18n.t("signup.form.password")}
                  </Typography>
                  <Field
                    as={TextField}
                    className={classes.fieldRoot}
                    variant="outlined"
                    fullWidth
                    name="password"
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    placeholder={i18n.t("signup.form.password")}
                    type="password"
                    id="password"
                    autoComplete="current-password"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography className={classes.fieldLabel}>
                    {i18n.t("signup.form.phone")}
                  </Typography>
                  <Field
                    as={TextField}
                    className={classes.fieldRoot}
                    variant="outlined"
                    fullWidth
                    id="phone"
                    placeholder={i18n.t("signup.form.phone")}
                    name="phone"
                    autoComplete="phone"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography className={classes.fieldLabel}>Plano</Typography>
                  <FormControl fullWidth variant="outlined" className={classes.fieldRoot}>
                    <Field
                      as={Select}
                      id="plan-selection"
                      name="planId"
                      displayEmpty
                      required
                    >
                      <MenuItem value="" disabled>
                        Selecione um plano
                      </MenuItem>
                      {(Array.isArray(plans) ? plans : []).map((plan, key) => (
                        <MenuItem key={key} value={plan.id} className={classes.planMenuItem}>
                          {plan.name} - Atendentes: {plan.users} - WhatsApp: {plan.connections} - Filas: {plan.queues} - R$ {plan.amount}
                        </MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                {i18n.t("signup.buttons.submit")}
              </Button>
              <Grid container justifyContent="center">
                <Grid item>
                  <Link
                    href="#"
                    variant="body2"
                    component={RouterLink}
                    to="/login"
                  >
                    {i18n.t("signup.buttons.login")}
                  </Link>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </div>
      <Box mt={1}></Box>
    </Container>
    </div>
    </>
  );
};

export default SignUp;
