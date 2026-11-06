/**
 * Tema visual MUI v4 — Atlas Digital Switch (somente aparência).
 */
import { createTheme } from "@material-ui/core/styles";

const BRAND = {
  cyan: "#00c8e8",
  navy: "#0a1628",
  navyPaper: "#0f1b2e",
  navyElevated: "#152536",
  amberSoft: "#ffb74d",
  black: "#05080c",
  lightBg: "#f4f7fb",
  lightPaper: "#ffffff",
};

/**
 * @param {object} p
 * @param {'light'|'dark'} p.mode
 * @param {string} p.primaryColorLight
 * @param {string} p.primaryColorDark
 * @param {object|undefined} p.locale
 * @param {object} p.logos — appLogoLight, appLogoDark, appLogoFavicon, appName, calculatedLogoDark, calculatedLogoLight
 */
export function createAtlasMuiTheme({
  mode,
  primaryColorLight,
  primaryColorDark,
  locale,
  logos,
}) {
  const isDark = mode === "dark";
  const primaryMain = isDark ? primaryColorDark : primaryColorLight;

  const backgroundDefault = isDark ? BRAND.black : BRAND.lightBg;
  const backgroundPaper = isDark ? BRAND.navyPaper : BRAND.lightPaper;

  const scrollbarStyles = {
    "&::-webkit-scrollbar": {
      width: "8px",
      height: "8px",
    },
    "&::-webkit-scrollbar-thumb": {
      boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.3)",
      backgroundColor: primaryMain,
    },
  };

  const scrollbarStylesSoft = {
    "&::-webkit-scrollbar": {
      width: "8px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: isDark ? "rgba(0, 200, 232, 0.28)" : "#d8dee9",
    },
  };

  const palette = {
    type: mode,
    primary: { main: primaryMain },
    secondary: { main: isDark ? BRAND.amberSoft : "#e65100" },
    textPrimary: isDark ? primaryColorDark : primaryColorLight,
    borderPrimary: isDark ? primaryColorDark : primaryColorLight,
    fontColor: isDark ? primaryColorDark : primaryColorLight,
    dark: { main: isDark ? "#e8f4f8" : "#1a2a3d" },
    light: { main: isDark ? "#1e2d3f" : "#e8eef5" },
    tabHeaderBackground: isDark ? "#1a2838" : "#e8eef5",
    optionsBackground: isDark ? "#121d2c" : "#f0f4fa",
    fancyBackground: isDark ? "#0d1520" : "#eef2f8",
    total: isDark ? BRAND.black : BRAND.lightBg,
    messageIcons: isDark ? "#9ee5f4" : "#546e7a",
    inputBackground: isDark ? "#141c28" : "#ffffff",
    barraSuperior: isDark ? BRAND.navy : primaryColorLight,
    background: {
      default: backgroundDefault,
      paper: backgroundPaper,
    },
    text: {
      primary: isDark ? "rgba(255,255,255,0.92)" : "rgba(10, 22, 40, 0.92)",
      secondary: isDark ? "rgba(255,255,255,0.62)" : "rgba(10, 22, 40, 0.58)",
      disabled: isDark ? "rgba(255,255,255,0.38)" : "rgba(10, 22, 40, 0.38)",
    },
    divider: isDark ? "rgba(0, 200, 232, 0.12)" : "rgba(10, 22, 40, 0.09)",
  };

  const themeOptions = {
    scrollbarStyles,
    scrollbarStylesSoft,
    mode,
    ...logos,
    palette,
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeightRegular: 400,
      fontWeightMedium: 600,
      fontWeightBold: 700,
      button: {
        fontWeight: 600,
        textTransform: "none",
      },
    },
    overrides: {
      MuiCssBaseline: {
        "@global": {
          body: {
            backgroundColor: backgroundDefault,
            backgroundImage: "none",
          },
        },
      },
      MuiPaper: {
        root: { backgroundImage: "none" },
        rounded: { borderRadius: 12 },
        elevation1: {
          boxShadow: isDark
            ? "0 4px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 200, 232, 0.07)"
            : "0 4px 24px rgba(10, 22, 40, 0.08), 0 0 0 1px rgba(10, 22, 40, 0.04)",
        },
        elevation2: {
          boxShadow: isDark
            ? "0 8px 32px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(0, 200, 232, 0.09)"
            : "0 8px 28px rgba(10, 22, 40, 0.1)",
        },
      },
      MuiButton: {
        root: {
          borderRadius: 10,
          padding: "8px 18px",
        },
        contained: { boxShadow: "none" },
        containedPrimary: {
          boxShadow: isDark
            ? "0 0 22px rgba(0, 200, 232, 0.22)"
            : "0 4px 14px rgba(0, 90, 120, 0.28)",
          "&:hover": {
            boxShadow: isDark
              ? "0 0 32px rgba(0, 200, 232, 0.35)"
              : "0 6px 20px rgba(0, 90, 120, 0.35)",
          },
        },
        outlinedPrimary: {
          borderWidth: 2,
          "&:hover": { borderWidth: 2 },
        },
      },
      MuiDialog: {
        paper: {
          borderRadius: 16,
          ...(isDark && {
            border: "1px solid rgba(0, 200, 232, 0.14)",
            boxShadow:
              "0 24px 80px rgba(0,0,0,0.65), 0 0 48px rgba(0, 200, 232, 0.06)",
            backgroundColor: BRAND.navyElevated,
          }),
        },
      },
      MuiDrawer: {
        paper: {
          ...(isDark && {
            backgroundColor: BRAND.navyPaper,
            borderRight: "1px solid rgba(0, 200, 232, 0.08)",
          }),
        },
      },
      MuiAppBar: {
        colorPrimary: {
          ...(isDark && {
            backgroundColor: BRAND.navy,
            boxShadow: "0 1px 0 rgba(0, 200, 232, 0.12)",
          }),
        },
      },
      MuiOutlinedInput: {
        root: {
          borderRadius: 10,
          ...(isDark && {
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(0, 200, 232, 0.35)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderWidth: 2,
              borderColor: BRAND.cyan,
            },
          }),
        },
      },
      MuiListItem: {
        button: {
          borderRadius: 8,
          "&:hover": {
            backgroundColor: isDark
              ? "rgba(0, 200, 232, 0.08)"
              : "rgba(0, 90, 120, 0.06)",
          },
        },
      },
      MuiTab: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          minHeight: 44,
        },
      },
    },
  };

  return locale ? createTheme(themeOptions, locale) : createTheme(themeOptions);
}
