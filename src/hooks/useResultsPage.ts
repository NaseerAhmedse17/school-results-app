"use client";

import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useCallback, useMemo, useState } from "react";
import { readJson } from "@/lib/api/client";
import type { ClientApiErrorBody } from "@/lib/results/clientApi";
import type { ResultFieldErrors, ResultFormValues, ResultListItem } from "@/lib/results/contracts";
import { normalizeFieldErrors } from "@/lib/results/fieldErrors";
import type { SnackbarState } from "@/lib/ui/snackbar";

export function useResultsPage(props: { initialResults: ResultListItem[] }) {
  const theme = useTheme();
  const isStackedLayout = useMediaQuery(theme.breakpoints.down("lg"));

  const [results, setResults] = useState<ResultListItem[]>(props.initialResults);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [editing, setEditing] = useState<ResultListItem | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<ResultFieldErrors | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const initialValues: ResultFormValues = useMemo(() => {
    if (!editing) return { fullName: "", marks: "", feePaid: "" };
    return { fullName: editing.fullName, marks: String(editing.marks), feePaid: editing.feePaid ? "yes" : "no" };
  }, [editing]);

  const showSnackbar = useCallback((message: string, severity: SnackbarState["severity"] = "info") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbar((s) => ({ ...s, open: false }));
  }, []);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/results", { cache: "no-store" });
    const data = await readJson<{ results: ResultListItem[] }>(res);
    setResults(data.results);
    setSelectedIds(new Set());
  }, []);

  const submit = useCallback(
    async (values: { fullName: string; marks: number; feePaid: boolean }) => {
      setServerFieldErrors(null);
      const isEdit = Boolean(editing);
      const res = await fetch(isEdit ? `/api/results/${editing!.id}` : "/api/results", {
        method: isEdit ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const err = await readJson<ClientApiErrorBody>(res);
        const fields = normalizeFieldErrors(err.error?.fieldErrors);
        if (fields) {
          setServerFieldErrors(fields);
          return;
        }
        showSnackbar(err.error?.message ?? "Could not save the result.", "error");
        return;
      }

      setEditing(null);
      await refresh();
      showSnackbar(
        isEdit ? "Student result updated successfully." : "Student result added successfully.",
        "success"
      );
    },
    [editing, refresh, showSnackbar]
  );

  const toggle = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const toggleMany = useCallback((ids: string[], checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => {
        if (checked) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  }, []);

  const openDeleteConfirm = useCallback(() => {
    if (selectedIds.size === 0) return;
    setDeleteConfirmOpen(true);
  }, [selectedIds]);

  const confirmDeleteSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setDeleteConfirmOpen(false);
    const ids = Array.from(selectedIds);
    const res = await fetch("/api/results", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) {
      const err = await readJson<ClientApiErrorBody>(res);
      showSnackbar(err.error?.message ?? "Could not delete the selected records.", "error");
      return;
    }
    const data = await readJson<{ deletedCount: number }>(res);
    const n = data.deletedCount ?? ids.length;
    await refresh();
    showSnackbar(n === 1 ? "Successfully deleted 1 record." : `Successfully deleted ${n} records.`, "success");
  }, [selectedIds, refresh, showSnackbar]);

  return {
    isStackedLayout,
    results,
    selectedIds,
    editing,
    setEditing,
    serverFieldErrors,
    setServerFieldErrors,
    initialValues,
    snackbar,
    closeSnackbar,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    submit,
    toggle,
    toggleMany,
    openDeleteConfirm,
    confirmDeleteSelected,
  };
}
