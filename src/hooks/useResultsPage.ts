"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { readJson } from "@/lib/api/client";
import type { ClientApiErrorBody } from "@/lib/results/clientApi";
import type { ResultFieldErrors, ResultFormValues, ResultListItem } from "@/lib/results/contracts";
import { normalizeFieldErrors } from "@/lib/results/fieldErrors";

type SubmitOutcome =
  | { ok: true; mode: "create" | "edit" }
  | { ok: false; kind: "fieldErrors"; fieldErrors: ResultFieldErrors }
  | { ok: false; kind: "error"; message: string };

type DeleteOutcome =
  | { ok: true; deletedCount: number }
  | { ok: false; kind: "error"; message: string };

export function useResultsPage(props: { initialResults: ResultListItem[] }) {
  const [isStackedLayout, setIsStackedLayout] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 1024px)");
    const update = () => setIsStackedLayout(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const [results, setResults] = useState<ResultListItem[]>(props.initialResults);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [editing, setEditing] = useState<ResultListItem | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<ResultFieldErrors | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const initialValues: ResultFormValues = useMemo(() => {
    if (!editing) return { fullName: "", marks: "", feePaid: "" };
    return { fullName: editing.fullName, marks: String(editing.marks), feePaid: editing.feePaid ? "yes" : "no" };
  }, [editing]);

  const refresh = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch("/api/results", { cache: "no-store" });
      const data = await readJson<{ results: ResultListItem[] }>(res);
      setResults(data.results);
      setSelectedIds(new Set());
    } finally {
      setLoadingList(false);
    }
  }, []);

  const submit = useCallback(
    async (values: { fullName: string; marks: number; feePaid: boolean }): Promise<SubmitOutcome> => {
      setServerFieldErrors(null);
      const isEdit = Boolean(editing);
      setSubmitting(true);
      try {
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
            return { ok: false, kind: "fieldErrors", fieldErrors: fields };
          }
          return { ok: false, kind: "error", message: err.error?.message ?? "Could not save the result." };
        }

        setEditing(null);
        await refresh();
        return { ok: true, mode: isEdit ? "edit" : "create" };
      } finally {
        setSubmitting(false);
      }
    },
    [editing, refresh]
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
  }, [selectedIds]);

  const confirmDeleteSelected = useCallback(async () => {
    if (selectedIds.size === 0) return { ok: true as const, deletedCount: 0 };
    const ids = Array.from(selectedIds);
    setDeleting(true);
    try {
      const res = await fetch("/api/results", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) {
        const err = await readJson<ClientApiErrorBody>(res);
        return { ok: false as const, kind: "error", message: err.error?.message ?? "Could not delete the selected records." };
      }
      const data = await readJson<{ deletedCount: number }>(res);
      const n = data.deletedCount ?? ids.length;
      await refresh();
      return { ok: true as const, deletedCount: n };
    } finally {
      setDeleting(false);
    }
  }, [selectedIds, refresh]) as unknown as () => Promise<DeleteOutcome>;

  return {
    isStackedLayout,
    results,
    selectedIds,
    editing,
    setEditing,
    serverFieldErrors,
    setServerFieldErrors,
    initialValues,
    loadingList,
    submitting,
    deleting,
    submit,
    toggle,
    toggleMany,
    openDeleteConfirm,
    confirmDeleteSelected,
  };
}
