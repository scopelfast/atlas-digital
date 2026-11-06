import React from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import brLocale from "date-fns/locale/pt-BR";
import { TextField } from "@mui/material";
import { alpha, useTheme as useThemeV4 } from "@material-ui/core/styles";
import { format, isValid, parse } from "date-fns";

/**
 * Filtro de data (valor string yyyy-MM-dd para APIs), mesmo stack do Dashboard
 * (MUI X DatePicker + ícone do calendário visível no modo escuro — não usa input nativo).
 */
export function FilterDatePickerField({
  label,
  value,
  onChange,
  fullWidth = true,
  className,
  sx: sxProp,
}) {
  const themeV4 = useThemeV4();
  const isDark = themeV4.palette.type === "dark";
  const PRIMARY_MAIN = themeV4?.palette?.primary?.main || "#1976d2";
  const textPrimary = themeV4.palette.text.primary;
  const textSecondary = themeV4.palette.text.secondary;
  const divider = themeV4.palette.divider;
  const inputBg =
    themeV4.palette.inputBackground || themeV4.palette.background.paper;

  const parsed =
    value && typeof value === "string" && value.length >= 8
      ? parse(value, "yyyy-MM-dd", new Date())
      : null;
  const dateValue = parsed && isValid(parsed) ? parsed : null;

  const dateTextFieldSx = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: inputBg,
      color: textPrimary,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: divider,
    },
    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: isDark ? alpha(PRIMARY_MAIN, 0.45) : alpha("#000", 0.23),
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: PRIMARY_MAIN,
    },
    "& .MuiInputLabel-root": {
      color: textSecondary,
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: PRIMARY_MAIN,
    },
    "& .MuiInputAdornment-root .MuiIconButton-root": {
      color: textPrimary,
    },
    "& .MuiInputAdornment-root .MuiIconButton-root:hover": {
      backgroundColor: isDark
        ? alpha(PRIMARY_MAIN, 0.14)
        : alpha(PRIMARY_MAIN, 0.08),
    },
  };

  const mergedSx = sxProp ? [dateTextFieldSx, sxProp] : dateTextFieldSx;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={brLocale}>
      <DatePicker
        value={dateValue}
        onChange={(newValue) => {
          if (newValue && isValid(newValue)) {
            onChange(format(newValue, "yyyy-MM-dd"));
          }
        }}
        label={label}
        inputFormat="dd/MM/yyyy"
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth={fullWidth}
            variant="outlined"
            size="small"
            sx={mergedSx}
            className={className}
          />
        )}
      />
    </LocalizationProvider>
  );
}
