"use client";

import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useMemo, useState } from "react";
import type { ResultFieldErrors, ResultFormValues } from "@/lib/results/contracts";

export type { ResultFieldErrors, ResultFieldKey, ResultFormValues } from "@/lib/results/contracts";

/** Client-side validation for submit; uses popup alerts per requirements (mandatory fields + marks 1–100). */
function collectClientValidationIssues(values: ResultFormValues, parsedMarks: { ok: boolean; value: number }): string[] {
  const issues: string[] = [];

  if (!values.fullName.trim()) {
    issues.push("Full name is required.");
  }

  if (values.feePaid !== "yes" && values.feePaid !== "no") {
    issues.push("Fee paid is required — select Yes or No.");
  }

  const marksTrim = values.marks.trim();
  if (!marksTrim) {
    issues.push("Marks is required.");
  } else if (!parsedMarks.ok || !Number.isInteger(parsedMarks.value)) {
    issues.push("Marks must be a whole number between 1 and 100.");
  } else if (parsedMarks.value < 1 || parsedMarks.value > 100) {
    issues.push("Marks must be between 1 and 100.");
  }

  return issues;
}

export function ResultsForm(props: {
  mode: "create" | "edit";
  initialValues: ResultFormValues;
  onSubmit: (values: { fullName: string; marks: number; feePaid: boolean }) => Promise<void>;
  submitting?: boolean;
  onCancelEdit?: () => void;
  /** Server-side validation (400) — shown inline under fields */
  serverFieldErrors?: ResultFieldErrors | null;
  onDismissServerErrors?: () => void;
  compact?: boolean;
}) {
  const theme = useTheme();
  const [values, setValues] = useState<ResultFormValues>(props.initialValues);
  const [validationDialog, setValidationDialog] = useState<{ open: boolean; issues: string[] }>({
    open: false,
    issues: [],
  });

  const parsedMarks = useMemo(() => {
    const trimmed = values.marks.trim();
    if (!trimmed) return { ok: false as const, value: NaN };
    const n = Number(trimmed);
    return { ok: Number.isFinite(n), value: n };
  }, [values.marks]);

  const serverErrors = props.serverFieldErrors ?? {};

  function clearServerErrorsOnEdit() {
    props.onDismissServerErrors?.();
  }

  async function handleSubmit() {
    if (props.submitting) return;
    const issues = collectClientValidationIssues(values, parsedMarks);
    if (issues.length > 0) {
      setValidationDialog({ open: true, issues });
      return;
    }

    await props.onSubmit({
      fullName: values.fullName.trim(),
      marks: parsedMarks.value,
      feePaid: values.feePaid === "yes",
    });
  }

  const compact = Boolean(props.compact);
  const submitting = Boolean(props.submitting);

  const showFullNameError = Boolean(serverErrors.fullName);
  const showMarksError = Boolean(serverErrors.marks);
  const showFeeError = Boolean(serverErrors.feePaid);

  const marksHelper = compact
    ? "Integer 1–100. Pass if ≥60 and fee paid."
    : "Integer only. Below 60 is fail; 60 or above may pass if fees are paid.";

  return (
    <Card
      sx={{
        overflow: "visible",
        height: compact ? "100%" : undefined,
        display: compact ? "flex" : undefined,
        flexDirection: compact ? "column" : undefined,
        width: "100%",
        maxWidth: "100%",
        background: (t) =>
          `linear-gradient(180deg, ${alpha(t.palette.primary.main, 0.04)} 0%, ${t.palette.background.paper} 48%)`,
      }}
    >
      <CardHeader
        avatar={
          <Box
            sx={{
              width: compact ? 40 : 48,
              height: compact ? 40 : 48,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "primary.main",
            }}
          >
            <AssignmentTurnedInOutlinedIcon fontSize={compact ? "medium" : "large"} />
          </Box>
        }
        title={
          <Typography variant={compact ? "h6" : "h5"} component="h2">
            {props.mode === "edit" ? "Edit student result" : "Add student result"}
          </Typography>
        }
        subheader={
          <Typography variant="body2" color="text.secondary" sx={{ mt: compact ? 0.25 : 0.5, maxWidth: 560 }}>
            {compact ? (
              <>
                Pass mark <Chip component="span" size="small" label="60/100" color="primary" variant="outlined" sx={{ mx: 0.5 }} />
                · below = fail.
              </>
            ) : (
              <>
                Enter each student&apos;s details. Passing threshold is{" "}
                <Chip component="span" size="small" label="60 / 100" color="primary" variant="outlined" sx={{ mx: 0.5 }} />
                — marks below 60 count as fail.
              </>
            )}
          </Typography>
        }
        sx={{
          pb: 0,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          "& .MuiCardHeader-content": { overflow: "hidden" },
        }}
      />
      <CardContent sx={{ pt: compact ? 1 : { xs: 1, sm: 2 }, flex: compact ? 1 : undefined }}>
        <Stack spacing={compact ? 2 : 3} sx={{ maxWidth: 640 }}>
          <Stack spacing={compact ? 1.75 : 2.5} component="form" noValidate onSubmit={(e) => e.preventDefault()}>
            <TextField
              required
              id="result-full-name"
              label="Full name"
              placeholder="e.g. Trevor Bouchard"
              value={values.fullName}
              disabled={submitting}
              onChange={(e) => {
                setValues((p) => ({ ...p, fullName: e.target.value }));
                clearServerErrorsOnEdit();
              }}
              fullWidth
              error={showFullNameError}
              helperText={showFullNameError ? serverErrors.fullName : " "}
              FormHelperTextProps={{
                sx: {
                  minHeight: 20,
                  mx: 0,
                  mt: 0.5,
                  ...(showFullNameError
                    ? { color: "error.main", fontWeight: 500 }
                    : { visibility: "hidden", userSelect: "none" }),
                },
              }}
              inputProps={{ "aria-label": "Full Name", autoComplete: "name", "aria-invalid": showFullNameError }}
            />

            <TextField
              required
              id="result-marks"
              label="Marks"
              placeholder="1 – 100"
              value={values.marks}
              disabled={submitting}
              onChange={(e) => {
                setValues((p) => ({ ...p, marks: e.target.value }));
                clearServerErrorsOnEdit();
              }}
              fullWidth
              error={showMarksError}
              helperText={showMarksError ? serverErrors.marks : marksHelper}
              FormHelperTextProps={{
                sx: {
                  mx: 0,
                  mt: 0.5,
                  minHeight: 20,
                  ...(showMarksError ? { color: "error.main", fontWeight: 500 } : { color: "text.secondary" }),
                },
              }}
              inputProps={{ inputMode: "numeric", "aria-label": "Marks", min: 1, max: 100 }}
            />

            <FormControl
              error={showFeeError}
              required
              disabled={submitting}
              sx={{ width: "100%" }}
              component="fieldset"
              variant="standard"
            >
              <FormLabel
                component="legend"
                sx={{ mb: compact ? 0.5 : 1, fontWeight: 600, color: "text.primary", fontSize: "0.875rem" }}
              >
                Fee paid
              </FormLabel>
              <RadioGroup
                row
                name="fee-paid"
                value={values.feePaid}
                onChange={(e) => {
                  setValues((p) => ({ ...p, feePaid: e.target.value as ResultFormValues["feePaid"] }));
                  clearServerErrorsOnEdit();
                }}
                sx={{ gap: 2, flexWrap: "wrap" }}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
              <FormHelperText
                sx={{
                  mx: 0,
                  mt: 0.5,
                  minHeight: 20,
                  fontWeight: showFeeError ? 500 : 400,
                }}
              >
                {showFeeError ? serverErrors.feePaid : "\u00a0"}
              </FormHelperText>
            </FormControl>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ pt: 0.5 }}>
            <Button
              variant="contained"
              size={compact ? "medium" : "large"}
              onClick={handleSubmit}
              fullWidth={false}
              sx={{ minWidth: 160 }}
              type="button"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              {props.mode === "edit" ? (submitting ? "Saving…" : "Save changes") : submitting ? "Submitting…" : "Submit result"}
            </Button>
            {props.mode === "edit" ? (
              <Button
                variant="outlined"
                size={compact ? "medium" : "large"}
                onClick={props.onCancelEdit}
                disabled={submitting}
                sx={{ minWidth: 120 }}
              >
                Cancel
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </CardContent>

      <Dialog
        open={validationDialog.open}
        onClose={() => setValidationDialog((d) => ({ ...d, open: false }))}
        maxWidth="sm"
        fullWidth
        scroll="paper"
        disableScrollLock
        aria-labelledby="validation-dialog-title"
        aria-describedby="validation-dialog-description"
        slotProps={{
          backdrop: { sx: { bgcolor: alpha(theme.palette.common.black, 0.45) } },
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            mx: 2,
            textAlign: "center",
          },
        }}
      >
        <DialogTitle
          id="validation-dialog-title"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            pt: 3,
            pb: 1,
            fontWeight: 700,
          }}
        >
          <WarningAmberRoundedIcon color="warning" sx={{ fontSize: 28 }} aria-hidden />
          Fix the form
        </DialogTitle>
        <DialogContent id="validation-dialog-description" sx={{ px: 3, pb: 2, pt: 0 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: "center" }}>
            Please fill in or correct the following:
          </Typography>
          <Stack
            component="ul"
            spacing={1}
            sx={{
              m: 0,
              pl: 0,
              listStyle: "none",
              textAlign: "left",
              alignItems: "stretch",
            }}
          >
            {validationDialog.issues.map((line, index) => (
              <Box
                key={`${index}-${line}`}
                component="li"
                sx={{
                  display: "flex",
                  gap: 1.25,
                  alignItems: "flex-start",
                  typography: "body2",
                  pl: 1,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "warning.main",
                    mt: 0.85,
                    flexShrink: 0,
                  }}
                  aria-hidden
                />
                <Typography component="span" variant="body2" color="text.primary" sx={{ fontWeight: 500, lineHeight: 1.5 }}>
                  {line}
                </Typography>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", px: 3, pb: 3, pt: 0 }}>
          <Button variant="contained" size="large" onClick={() => setValidationDialog((d) => ({ ...d, open: false }))} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
