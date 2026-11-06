import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Paper,
  Stack,
  Tab,
  Tabs,
  Grid,
  Divider
} from "@mui/material";
import Button from "@material-ui/core/Button";
import {
  SaveAlt,
  Groups,
  Call as CallIcon,
  HourglassEmpty as HourglassEmptyIcon,
  CheckCircle as CheckCircleIcon,
  RecordVoiceOver as RecordVoiceOverIcon,
  GroupAdd as GroupAddIcon,
  Star,
} from "@mui/icons-material";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { isArray } from "lodash";
import { AuthContext } from "../../context/Auth/AuthContext";
import useDashboard from "../../hooks/useDashboard";
import TableAttendantsStatus from "../../components/Dashboard/TableAttendantsStatus";
import { ChatsUser } from "./ChartsUser";
import ChartDonut from "./ChartDonut";
import { ChartsDate } from "./ChartsDate";
import ForbiddenPage from "../../components/ForbiddenPage";
import { i18n } from "../../translate/i18n";

import { alpha, useTheme as useThemeV4 } from "@material-ui/core/styles";

const Dashboard = () => {
  const t = useThemeV4();
  const isDark = t.palette.type === "dark";
  const r = t.shape.borderRadius ?? 12;

  const PRIMARY_MAIN = t.palette.primary.main;

  const paperBg = t.palette.background.paper;
  const pageBg = t.palette.fancyBackground || t.palette.background.default;
  const divider = t.palette.divider;
  const textSecondary = t.palette.text.secondary;
  const textPrimary = t.palette.text.primary;

  const cardShadow = isDark
    ? "0 4px 22px rgba(0, 0, 0, 0.45)"
    : "0 2px 18px rgba(15, 23, 42, 0.07)";
  const cardShadowHover = isDark
    ? "0 14px 40px rgba(0, 0, 0, 0.55)"
    : "0 14px 36px rgba(15, 23, 42, 0.12)";

  const StatCard = ({ title, value, icon, color }) => (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        borderRadius: `${r}px`,
        border: `1px solid ${divider}`,
        bgcolor: isDark ? alpha("#ffffff", 0.06) : paperBg,
        boxShadow: cardShadow,
        transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: cardShadowHover,
          borderColor: alpha(color, isDark ? 0.55 : 0.35),
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          borderRadius: `${r}px ${r}px 0 0`,
          background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.65)} 100%)`,
        },
      }}
    >
      <CardContent sx={{ pt: 3, pb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="overline"
              sx={{
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: textSecondary,
                lineHeight: 1.2,
                display: "block",
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: textPrimary,
                mt: 0.5,
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
              }}
            >
              {value}
            </Typography>
          </Box>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              flexShrink: 0,
              bgcolor: alpha(color, isDark ? 0.22 : 0.14),
              color,
              boxShadow: `0 8px 22px ${alpha(color, isDark ? 0.4 : 0.28)}`,
            }}
          >
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );

  const NpsMetricCard = ({ title, value, color }) => (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        textAlign: "center",
        p: 2.5,
        borderRadius: `${r}px`,
        border: `1px solid ${divider}`,
        bgcolor: isDark ? alpha("#ffffff", 0.05) : paperBg,
        backgroundImage: isDark
          ? `linear-gradient(160deg, ${alpha("#ffffff", 0.06)} 0%, transparent 55%)`
          : `linear-gradient(160deg, ${alpha(color, 0.07)} 0%, ${paperBg} 45%)`,
        boxShadow: isDark ? "0 2px 14px rgba(0,0,0,0.35)" : "0 2px 12px rgba(15,23,42,0.06)",
      }}
    >
      <Typography variant="overline" sx={{ color: textSecondary, fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="h3" fontWeight="800" sx={{ color, my: 1, letterSpacing: "-0.02em" }}>
        {value}%
      </Typography>
      <Box
        sx={{
          height: 8,
          borderRadius: 999,
          overflow: "hidden",
          bgcolor: isDark ? alpha("#ffffff", 0.1) : alpha("#000000", 0.08),
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: `${Math.min(100, Math.max(0, value))}%`,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.85)} 100%)`,
            transition: "width 0.4s ease",
          }}
        />
      </Box>
    </Card>
  );

  const [counters, setCounters] = useState({});
  const [attendants, setAttendants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const { find } = useDashboard();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {
          date_from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
          date_to: new Date().toISOString().slice(0, 10)
        };
        const data = await find(params);
        setCounters(data.counters);
        if (isArray(data.attendants)) setAttendants(data.attendants);
      } catch (error) {
        toast.error("Não foi possível carregar os dados do dashboard.");
        console.error(error);
      }
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportToExcel = () => {
    try {
      const table = document.getElementById("grid-attendants");
      const ws = XLSX.utils.table_to_sheet(table);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "RelatorioDeAtendentes");
      XLSX.writeFile(wb, "relatorio-de-atendentes.xlsx");
    } catch {
      toast.error("Erro ao exportar para Excel.");
    }
  };

  const getOnlineUsersCount = () => attendants.filter(u => u.online).length;

  if (user.profile === "user" && user.showDashboard === "disabled") {
    return <ForbiddenPage />;
  }

  const statCards = [
    { title: i18n.t("dashboard.cards.inAttendance"), value: counters.supportHappening || 0, icon: <CallIcon />, color: PRIMARY_MAIN },
    { title: i18n.t("dashboard.cards.waiting"), value: counters.supportPending || 0, icon: <HourglassEmptyIcon />, color: t.palette.info?.main || "#0288d1" },
    { title: i18n.t("dashboard.cards.finalized"), value: counters.supportFinished || 0, icon: <CheckCircleIcon />, color: t.palette.success?.main || "#2e7d32" },
    { title: i18n.t("dashboard.cards.groups"), value: counters.supportGroups || 0, icon: <Groups />, color: t.palette.secondary?.main || "#e65100" },
    { title: i18n.t("dashboard.cards.activeAttendants"), value: `${getOnlineUsersCount()}/${attendants.length}`, icon: <RecordVoiceOverIcon />, color: t.palette.error?.main || "#c62828" },
    { title: i18n.t("dashboard.cards.newContacts"), value: counters.leads || 0, icon: <GroupAddIcon />, color: t.palette.warning?.main || "#ed6c02" }
  ];

  const npsData = {
    score: counters.npsScore || 0,
    promoters: counters.npsPromotersPerc || 0,
    passives: counters.npsPassivePerc || 0,
    detractors: counters.npsDetractorsPerc || 0,
    totalTickets: counters.tickets || 0,
    withRating: counters.withRating || 0,
    percRating: counters.percRating || 0
  };

  const npsColors = { Promotores: "#2EA85A", Detratores: "#F73A2C", Neutros: "#F7EC2C" };
  const npsChartData = [
    { name: "Promotores", value: npsData.promoters },
    { name: "Detratores", value: npsData.detractors },
    { name: "Neutros", value: npsData.passives }
  ].sort((a, b) => a.name.localeCompare(b.name));
  const sortedNpsColors = npsChartData.map(item => npsColors[item.name]);

  const panelPaperSx = {
    p: { xs: 2, sm: 3 },
    borderRadius: `${r}px`,
    border: `1px solid ${divider}`,
    bgcolor: paperBg,
    boxShadow: cardShadow,
  };

  return (
    <Box sx={{ backgroundColor: pageBg, minHeight: "100%", py: 4 }}>
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          width: "100%",
        }}
      >
        <Typography
          variant="h4"
          fontWeight="800"
          sx={{ mb: 4, color: PRIMARY_MAIN, letterSpacing: "-0.02em" }}
        >
          {i18n.t("dashboard.title") || "Dashboard"}
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
              <StatCard {...card} />
            </Grid>
          ))}
        </Grid>

        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: `${r}px`,
            border: `1px solid ${divider}`,
            bgcolor: paperBg,
            boxShadow: isDark ? "0 2px 16px rgba(0,0,0,0.35)" : "0 2px 12px rgba(15,23,42,0.06)",
            overflow: "hidden",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, nv) => setActiveTab(nv)}
            variant="fullWidth"
            sx={{
              px: 1,
              "& .MuiTab-root": {
                fontWeight: 700,
                textTransform: "uppercase",
                fontSize: "0.9rem",
                color: textSecondary,
                "&.Mui-selected": { color: PRIMARY_MAIN },
              },
              "& .MuiTabs-indicator": {
                backgroundColor: PRIMARY_MAIN,
                height: 3,
                borderRadius: "3px 3px 0 0",
              },
            }}
          >
            <Tab label={i18n.t("dashboard.tabs.performance")} />
            <Tab label="NPS" />
            <Tab label={i18n.t("dashboard.tabs.attendants")} />
          </Tabs>
        </Paper>

        <Box>
          {activeTab === 0 && (
            <Paper elevation={0} sx={panelPaperSx}>
              <ChartsDate />
            </Paper>
          )}

          {activeTab === 1 && (
            <Paper elevation={0} sx={panelPaperSx}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(PRIMARY_MAIN, isDark ? 0.25 : 0.12),
                    color: PRIMARY_MAIN,
                    mr: 2,
                    width: 48,
                    height: 48,
                    boxShadow: `0 4px 14px ${alpha(PRIMARY_MAIN, 0.3)}`,
                  }}
                >
                  <Star />
                </Avatar>
                <Typography variant="h6" fontWeight="800" sx={{ color: textPrimary }}>
                  {i18n.t("dashboard.tabs.assessments")}
                </Typography>
              </Box>
              <Divider sx={{ my: 2, borderColor: divider }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      p: 2.5,
                      borderRadius: `${r}px`,
                      border: `1px solid ${divider}`,
                      bgcolor: isDark ? alpha("#fff", 0.04) : paperBg,
                      boxShadow: isDark ? "inset 0 1px 0 rgba(255,255,255,0.06)" : "none",
                    }}
                  >
                    <Typography variant="overline" sx={{ color: textSecondary, fontWeight: 700 }}>
                      NPS Score Geral
                    </Typography>
                    <ChartDonut data={npsChartData} value={npsData.score} colors={sortedNpsColors} />
                  </Card>
                </Grid>

                <Grid item container xs={12} md={8} spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <NpsMetricCard title={i18n.t("dashboard.assessments.prosecutors")} value={npsData.promoters} color={npsColors["Promotores"]} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <NpsMetricCard title={i18n.t("dashboard.assessments.neutral")} value={npsData.passives} color={npsColors["Neutros"]} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <NpsMetricCard title={i18n.t("dashboard.assessments.detractors")} value={npsData.detractors} color={npsColors["Detratores"]} />
                  </Grid>
                </Grid>

                <Grid item xs={12} mt={2}>
                  <Paper
                    elevation={0}
                    variant="outlined"
                    sx={{
                      borderRadius: `${r}px`,
                      border: `1px solid ${divider}`,
                      bgcolor: isDark ? alpha("#fff", 0.03) : alpha("#000", 0.02),
                    }}
                  >
                    <Grid container spacing={2} textAlign="center">
                      {[
                        { title: i18n.t("dashboard.assessments.totalCalls"), value: npsData.totalTickets },
                        { title: i18n.t("dashboard.assessments.ratedCalls"), value: npsData.withRating },
                        { title: i18n.t("dashboard.assessments.evaluationIndex"), value: `${npsData.percRating.toFixed(1)}%` }
                      ].map((item, index) => (
                        <Grid item xs={12} sm={4} key={item.title} sx={{ p: 2, position: "relative" }}>
                          <Typography variant="body2" sx={{ color: textSecondary }} gutterBottom>
                            {item.title}
                          </Typography>
                          <Typography variant="h5" fontWeight="800" sx={{ color: PRIMARY_MAIN }}>
                            {item.value}
                          </Typography>
                          {index < 2 && (
                            <Divider
                              orientation="vertical"
                              flexItem
                              sx={{ position: "absolute", right: 0, top: "15%", height: "70%", borderColor: divider }}
                            />
                          )}
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          )}

          {activeTab === 2 && (
            <Paper elevation={0} sx={panelPaperSx}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" fontWeight="800" sx={{ color: textPrimary }}>
                  {i18n.t("dashboard.tabs.attendants")}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={exportToExcel}
                  startIcon={<SaveAlt />}
                >
                  {i18n.t("dashboard.buttons.exportExcel")}
                </Button>
              </Box>
              <Divider sx={{ mb: 3, borderColor: divider }} />
              <div id="grid-attendants">
                {attendants.length > 0 && <TableAttendantsStatus attendants={attendants} loading={loading} />}
              </div>
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" fontWeight="800" gutterBottom sx={{ color: textPrimary }}>
                  {i18n.t("dashboard.charts.userPerformance")}
                </Typography>
                <Divider sx={{ mb: 3, borderColor: divider }} />
                <ChatsUser />
              </Box>
            </Paper>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;
