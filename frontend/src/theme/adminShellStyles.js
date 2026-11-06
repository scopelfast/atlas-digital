/**
 * Shell partilhado: páginas de configuração com abas (ex.: /settings, /global-config).
 * Mantém o mesmo aspeto e largura sem alterar lógica de negócio.
 */
import { makeStyles } from "@material-ui/core/styles";

/** Mixin reutilizável na barra de Tabs (também em Options.js com sub-abas). */
export function adminShellTabBarMixin(theme) {
  const radius =
    typeof theme.shape?.borderRadius === "number" ? theme.shape.borderRadius : 8;
  return {
    backgroundColor:
      theme.palette.type === "light"
        ? theme.palette.grey[200]
        : theme.palette.grey[800],
    borderRadius: radius,
    width: "100%",
    "& .MuiTabs-flexContainer": {
      justifyContent: "flex-start",
    },
  };
}

export const useAdminShellStyles = makeStyles((theme) => ({
  shellRoot: {
    flex: 1,
    backgroundColor: theme.palette.background.paper,
  },
  mainPaper: {
    ...theme.scrollbarStyles,
    overflowY: "auto",
    flex: 1,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  },
  tabBar: adminShellTabBarMixin(theme),
  innerPaper: {
    ...theme.scrollbarStyles,
    overflowY: "auto",
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "flex-start",
    width: "100%",
    flex: 1,
    minHeight: 0,
    boxShadow: "none",
  },
  contentFull: {
    width: "100%",
    maxWidth: "100%",
  },
  formFull: {
    width: "100%",
  },
}));
