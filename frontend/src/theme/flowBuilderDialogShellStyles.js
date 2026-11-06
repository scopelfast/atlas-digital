/**
 * Casca visual partilhada pelos modais do Flow Builder (Atlas — claro/escuro).
 * Usar com: makeStyles((theme) => ({ ...getFlowBuilderDialogShellStyles(theme), ...extras }))
 */
export function getFlowBuilderDialogShellStyles(theme) {
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
      color: isDark ? "rgba(255,255,255,0.72)" : theme.palette.text.secondary,
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
      padding: 20,
      background: isDark
        ? `linear-gradient(180deg, ${theme.palette.fancyBackground} 0%, ${theme.palette.background.paper} 100%)`
        : "linear-gradient(180deg, rgba(249,250,251,0.6) 0%, rgba(255,255,255,1) 100%)",
      color: theme.palette.text.primary,

      "& .MuiFormControl-root": {
        marginTop: theme.spacing(0.75),
        marginBottom: theme.spacing(0.75),
      },

      "& .MuiInputLabel-outlined": {
        fontSize: 13,
        color: isDark ? "rgba(255,255,255,0.82)" : theme.palette.text.secondary,
      },

      "& .MuiInputLabel-outlined.Mui-focused": {
        color: theme.palette.primary.main,
      },

      "& .MuiFormLabel-root": {
        color: isDark ? "rgba(255,255,255,0.82)" : theme.palette.text.secondary,
      },

      "& .MuiInputLabel-root": {
        color: isDark ? "rgba(255,255,255,0.82)" : theme.palette.text.secondary,
      },

      "& .MuiOutlinedInput-root": {
        borderRadius: 12,
        backgroundColor: theme.palette.inputBackground,
      },

      "& .MuiOutlinedInput-input": {
        color: theme.palette.text.primary,
      },

      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.divider,
      },

      "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: isDark
          ? "rgba(0, 200, 232, 0.35)"
          : "rgba(17, 24, 39, 0.22)",
      },

      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
      },

      "& .MuiFormHelperText-root": {
        marginLeft: 2,
        color: isDark ? "rgba(255,255,255,0.72)" : theme.palette.text.secondary,
      },

      /* Chrome autofill: evita fundo azul-claro em modo escuro */
      ...(isDark && {
        "& .MuiOutlinedInput-input:-webkit-autofill": {
          WebkitBoxShadow: `0 0 0 1000px ${theme.palette.inputBackground} inset`,
          WebkitTextFillColor: `${theme.palette.text.primary} !important`,
          caretColor: theme.palette.text.primary,
          borderRadius: 12,
        },
      }),

      "& .MuiSelect-icon": {
        color: isDark ? "rgba(255,255,255,0.75)" : theme.palette.text.secondary,
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

    /** Paper transparente à volta do DialogContent (ex.: Typebot + Formik) */
    formPaper: {
      backgroundColor: "transparent",
      background: "transparent",
      boxShadow: "none",
    },

    /** Linha do randomizador: % + slider + % */
    dialogSliderRow: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      minHeight: 120,
      gap: theme.spacing(2),
      flexWrap: "wrap",
    },

    dialogSliderGrow: {
      flex: 1,
      minWidth: 160,
    },

    dialogSlider: {
      color: theme.palette.primary.main,
      "& .MuiSlider-rail": {
        opacity: isDark ? 0.4 : 0.26,
        backgroundColor: isDark ? "rgba(255,255,255,0.28)" : undefined,
      },
      "& .MuiSlider-track": {
        backgroundColor: theme.palette.primary.main,
      },
      "& .MuiSlider-thumb": {
        backgroundColor: theme.palette.primary.main,
      },
    },
  };
}
