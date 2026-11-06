import React, { useEffect, useState, useContext } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import brLocale from "date-fns/locale/pt-BR";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { TextField, Paper, Typography, Box, Divider } from "@mui/material";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import api from "../../services/api";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";

import { alpha, useTheme as useThemeV4 } from "@material-ui/core/styles";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export const ChartsDate = () => {
  const themeV4 = useThemeV4();
  const isDark = themeV4.palette.type === "dark";

  const PRIMARY_MAIN = themeV4?.palette?.primary?.main || "#1976d2";
  const PRIMARY_CONTRAST = themeV4?.palette?.primary?.contrastText || "#fff";
  const textPrimary = themeV4.palette.text.primary;
  const textSecondary = themeV4.palette.text.secondary;
  const divider = themeV4.palette.divider;
  const inputBg = themeV4.palette.inputBackground || themeV4.palette.background.paper;

  const [initialDate, setInitialDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [finalDate, setFinalDate] = useState(new Date());
  const [ticketsData, setTicketsData] = useState({ data: [], count: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const companyId = user.companyId;

  useEffect(() => {
    if (companyId) handleGetTicketsInformation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const handleGetTicketsInformation = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(
        `/dashboard/ticketsDay?initialDate=${format(initialDate, "yyyy-MM-dd")}&finalDate=${format(finalDate, "yyyy-MM-dd")}&companyId=${companyId}`
      );
      setTicketsData(data);
    } catch {
      toast.error("Erro ao buscar informações dos tickets");
    } finally {
      setIsLoading(false);
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: themeV4.palette.background.paper,
        titleColor: textPrimary,
        bodyColor: textSecondary,
        borderColor: divider,
        borderWidth: 1,
        boxPadding: 8,
        padding: 10,
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textSecondary },
      },
      y: {
        grid: { color: divider },
        ticks: { color: textSecondary },
      },
    },
  };

  const dataCharts = {
    labels: ticketsData?.data.length > 0 ? ticketsData.data.map(item => (item.hasOwnProperty("horario") ? `${item.horario}:00` : item.data)) : [],
    datasets: [
      {
        label: "Tickets",
        data: ticketsData?.data.length > 0 ? ticketsData.data.map(item => item.total) : [],
        borderColor: PRIMARY_MAIN,
        backgroundColor: isDark ? alpha("#ffffff", 0.08) : alpha("#000000", 0.06),
        tension: 0.4,
        fill: true,
      },
    ],
  };

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
  };

  const filterFieldSx = {
    flex: { xs: "1 1 100%", md: "1 1 260px" },
    minWidth: { xs: "100%", md: 220 },
    maxWidth: { xs: "100%", md: 360 },
  };

  const emptyStateBg = isDark ? alpha("#ffffff", 0.06) : alpha("#000000", 0.04);
  const emptyStateBorder = isDark ? alpha("#ffffff", 0.1) : alpha("#000000", 0.08);

  return (
    <Paper elevation={0} sx={{ p: 0, background: "transparent" }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography
          component="h2"
          variant="h6"
          fontWeight={700}
          gutterBottom
          sx={{ mb: { xs: 1, sm: 0 }, color: textPrimary }}
        >
          {i18n.t("dashboard.users.totalAttendances")}
        </Typography>
        <Box
          sx={{
            ml: 1,
            px: 2,
            py: 1,
            backgroundColor: PRIMARY_MAIN,
            borderRadius: 2,
            color: PRIMARY_CONTRAST,
            fontWeight: "bold",
            boxShadow: isDark
              ? `0 2px 14px ${alpha(PRIMARY_MAIN, 0.35)}`
              : "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {i18n.t("dashboard.users.totalLabel", { count: ticketsData?.count || 0 })}
        </Box>
      </Box>

      <Divider sx={{ my: 3, borderColor: divider }} />

      <Box
        sx={{
          mb: 2.5,
          p: 2,
          borderRadius: 2,
          border: `1px solid ${divider}`,
          bgcolor: isDark ? alpha("#ffffff", 0.03) : alpha("#000000", 0.015),
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          <Box sx={filterFieldSx}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={brLocale}>
              <DatePicker
                value={initialDate}
                onChange={newValue => setInitialDate(newValue)}
                label={i18n.t("dashboard.date.initialDate")}
                renderInput={(params) => (
                  <TextField {...params} fullWidth variant="outlined" size="small" sx={dateTextFieldSx} />
                )}
              />
            </LocalizationProvider>
          </Box>
          <Box sx={filterFieldSx}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={brLocale}>
              <DatePicker
                value={finalDate}
                onChange={newValue => setFinalDate(newValue)}
                label={i18n.t("dashboard.date.finalDate")}
                renderInput={(params) => (
                  <TextField {...params} fullWidth variant="outlined" size="small" sx={dateTextFieldSx} />
                )}
              />
            </LocalizationProvider>
          </Box>
          <Box
            sx={{
              flex: { xs: "1 1 100%", md: "0 0 220px" },
              minWidth: { xs: "100%", md: 200 },
              marginLeft: { xs: 0, md: "auto" },
            }}
          >
            <Button
              onClick={handleGetTicketsInformation}
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : i18n.t("dashboard.buttons.filter")}
            </Button>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          pt: 1,
          borderTop: `1px solid ${divider}`,
        }}
      >
        <Box sx={{ height: { xs: 300, sm: 360 }, position: "relative", mt: 1, overflow: "hidden" }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <CircularProgress />
          </Box>
        ) : ticketsData?.data.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              borderRadius: 2,
              bgcolor: emptyStateBg,
              border: `1px solid ${emptyStateBorder}`,
              px: 2,
            }}
          >
            <Typography sx={{ color: textPrimary, textAlign: "center", fontWeight: 500 }}>
              Nenhum dado disponível para o período selecionado.
            </Typography>
          </Box>
        ) : (
          <Line options={options} data={dataCharts} />
        )}
        </Box>
      </Box>
    </Paper>
  );
};

export default ChartsDate;
