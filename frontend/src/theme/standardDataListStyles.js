/**
 * Estilos partilhados para tabelas de dados (listagens administrativas).
 * Importar `useStandardDataListStyles` nos componentes que renderizam Table + Paper.
 */
import { makeStyles } from "@material-ui/core/styles";

export const useStandardDataListStyles = makeStyles((theme) => ({
  listPaper: {
    width: "100%",
    overflowX: "auto",
    ...theme.scrollbarStyles,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0, 0, 0.5, 0),
  },
  standardTable: {
    width: "100%",
    minWidth: 520,
  },
  headRow: {
    "& .MuiTableCell-head": {
      fontWeight: 600,
      fontSize: "0.8125rem",
      backgroundColor:
        theme.palette.type === "light"
          ? theme.palette.grey[100]
          : "rgba(0, 200, 232, 0.09)",
      borderBottom: `1px solid ${theme.palette.divider}`,
      whiteSpace: "nowrap",
    },
  },
  bodyRow: {
    "&:nth-of-type(even)": {
      backgroundColor:
        theme.palette.type === "light"
          ? "rgba(0, 0, 0, 0.02)"
          : "rgba(255, 255, 255, 0.03)",
    },
    "&:hover": {
      backgroundColor:
        theme.palette.type === "light"
          ? "rgba(0, 119, 156, 0.06)"
          : "rgba(0, 200, 232, 0.07)",
    },
  },
}));
