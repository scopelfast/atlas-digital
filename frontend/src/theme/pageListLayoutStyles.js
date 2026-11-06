/**
 * Layout padrão para páginas de listagem (tabela) no painel.
 * Usar com MainContainer: className={layout.pageRoot} no container,
 * e Paper principal com layout.mainPaper.
 */
import { makeStyles } from "@material-ui/core/styles";

export const PAGE_LIST_PADDING = 2;

export const usePageListLayoutStyles = makeStyles((theme) => ({
  pageRoot: {
    width: "100%",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  },
  mainPaper: {
    flex: 1,
    width: "100%",
    padding: theme.spacing(PAGE_LIST_PADDING),
    overflow: "auto",
    overflowX: "auto",
    ...theme.scrollbarStyles,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    borderRadius: theme.shape.borderRadius,
  },
}));
