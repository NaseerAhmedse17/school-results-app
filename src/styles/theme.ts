import { alpha, createTheme } from "@mui/material/styles";

const primaryMain = "#1a4a7a";
const primaryLight = "#3d7ab8";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: primaryMain, light: primaryLight, dark: "#0f2d4d", contrastText: "#fff" },
    secondary: { main: "#0d9488", contrastText: "#fff" },
    success: { main: "#0d9f4c" },
    error: { main: "#d32f2f" },
    warning: { main: "#ed6c02" },
    info: { main: "#0288d1" },
    background: {
      default: "#e8eef4",
      paper: "#ffffff",
    },
    divider: alpha("#1a4a7a", 0.12),
  },
  typography: {
    fontFamily: "var(--font-geist-sans), system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    fontSize: 15,
    h1: { fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontWeight: 700, letterSpacing: "-0.02em" },
    h3: { fontWeight: 700, letterSpacing: "-0.02em" },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { lineHeight: 1.5 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarGutter: "stable",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, py: 1, px: 2.5 },
        containedPrimary: {
          background: `linear-gradient(135deg, ${primaryMain} 0%, ${primaryLight} 100%)`,
          "&:hover": {
            background: `linear-gradient(135deg, ${primaryLight} 0%, ${primaryMain} 100%)`,
          },
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${alpha("#1a4a7a", 0.08)}`,
          boxShadow: "0px 4px 24px rgba(15, 45, 77, 0.07)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 16 },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined", size: "medium" },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
  },
});
