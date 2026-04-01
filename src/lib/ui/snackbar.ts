export type SnackbarState = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info";
};
