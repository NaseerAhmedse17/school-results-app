"use client";

import { Alert, Snackbar } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import type { SnackbarState } from "@/lib/ui/snackbar";

type Props = {
  state: SnackbarState;
  onClose: () => void;
};

export function ResultsToast({ state, onClose }: Props) {
  const theme = useTheme();
  const { open, message, severity } = state;

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{
        top: { xs: "calc(12px + env(safe-area-inset-top, 0px))", sm: "calc(16px + env(safe-area-inset-top, 0px))" },
        right: { xs: "calc(12px + env(safe-area-inset-right, 0px))", sm: "calc(16px + env(safe-area-inset-right, 0px))" },
        left: "auto",
        bottom: "auto",
      }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="outlined"
        sx={{
          alignItems: "center",
          maxWidth: 340,
          borderRadius: 2,
          bgcolor: "background.paper",
          color: "text.primary",
          borderWidth: 1,
          boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.18)}`,
          "& .MuiAlert-message": {
            color: "text.primary",
            fontWeight: 500,
          },
          "& .MuiAlert-icon": { opacity: 1 },
          ...(severity === "success" && {
            borderColor: alpha(theme.palette.success.main, 0.45),
            "& .MuiAlert-icon": { color: theme.palette.success.main },
          }),
          ...(severity === "error" && {
            borderColor: alpha(theme.palette.error.main, 0.45),
            "& .MuiAlert-icon": { color: theme.palette.error.main },
          }),
          ...(severity === "info" && {
            borderColor: alpha(theme.palette.info.main, 0.45),
            "& .MuiAlert-icon": { color: theme.palette.info.main },
          }),
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
