import React, { useEffect, useState, useContext } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import brLocale from 'date-fns/locale/pt-BR';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { Grid, TextField, Box, Typography } from '@mui/material';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import api from '../../services/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { alpha, useTheme as useThemeV4 } from "@material-ui/core/styles";
import { i18n } from '../../translate/i18n';
import { AuthContext } from "../../context/Auth/AuthContext";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const ChatsUser = () => {
  const themeV4 = useThemeV4();
  const isDark = themeV4.palette.type === "dark";

  const PRIMARY_MAIN = themeV4?.palette?.primary?.main || '#1976d2';
  const PRIMARY_DARK = themeV4?.palette?.primary?.dark || '#115293';
  const textPrimary = themeV4.palette.text.primary;
  const textSecondary = themeV4.palette.text.secondary;
  const divider = themeV4.palette.divider;
  const inputBg = themeV4.palette.inputBackground || themeV4.palette.background.paper;

  const [initialDate, setInitialDate] = useState(new Date());
  const [finalDate, setFinalDate] = useState(new Date());
  const [ticketsData, setTicketsData] = useState({ data: [] });
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
        `/dashboard/ticketsUsers?initialDate=${format(initialDate, 'yyyy-MM-dd')}&finalDate=${format(finalDate, 'yyyy-MM-dd')}&companyId=${companyId}`
      );
      setTicketsData(data);
    } catch (error) {
      toast.error('Erro ao buscar informações dos tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const rgba = (hex, a = 0.3) => {
    let c = (hex || '').replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const r = parseInt(c.substr(0, 2), 16) || 25;
    const g = parseInt(c.substr(2, 2), 16) || 118;
    const b = parseInt(c.substr(4, 2), 16) || 210;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, title: { display: false } },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: isDark ? alpha("#ffffff", 0.08) : "rgba(0,0,0,0.06)" },
        ticks: { color: textSecondary },
      },
      y: {
        grid: { display: false },
        ticks: { color: textSecondary },
      },
    },
  };

  const dataCharts = {
    labels: ticketsData?.data?.map(item => item.nome) || [],
    datasets: [
      {
        label: 'Tickets',
        data: ticketsData?.data?.map(item => item.quantidade) || [],
        backgroundColor: rgba(PRIMARY_MAIN, 0.35),
        hoverBackgroundColor: PRIMARY_DARK,
        borderRadius: 4,
        barThickness: 20,
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

  const emptyStateBg = isDark ? alpha("#ffffff", 0.06) : alpha("#000000", 0.04);
  const emptyStateBorder = isDark ? alpha("#ffffff", 0.1) : alpha("#000000", 0.08);

  return (
    <Box>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={brLocale}>
            <DatePicker
              value={initialDate}
              onChange={(newValue) => setInitialDate(newValue)}
              label={i18n.t("dashboard.date.initialDate")}
              renderInput={(params) => (
                <TextField {...params} fullWidth size="small" sx={dateTextFieldSx} />
              )}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={brLocale}>
            <DatePicker
              value={finalDate}
              onChange={(newValue) => setFinalDate(newValue)}
              label={i18n.t("dashboard.date.finalDate")}
              renderInput={(params) => (
                <TextField {...params} fullWidth size="small" sx={dateTextFieldSx} />
              )}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} md>
          <Button
            onClick={handleGetTicketsInformation}
            variant="contained"
            color="primary"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : i18n.t("dashboard.buttons.filter")}
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ height: 400, position: 'relative' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : ticketsData?.data?.length > 0 ? (
          <Bar options={options} data={dataCharts} />
        ) : (
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
              Nenhum dado para exibir.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};
