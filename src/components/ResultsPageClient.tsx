"use client";

import { useEffect, useMemo, useState } from "react";
import { useResultsPage } from "@/hooks/useResultsPage";
import type { ResultListItem } from "@/lib/results/contracts";

type Props = { initialResults: ResultListItem[]; initialError?: string | null };

export function ResultsPageClient(props: Props) {
  const page = useResultsPage({ initialResults: props.initialResults });

  const [fullName, setFullName] = useState("");
  const [marks, setMarks] = useState("");
  const [feePaid, setFeePaid] = useState<"" | "yes" | "no">("");
  const [tablePage, setTablePage] = useState(0);
  const pageSize = 10;
  const [modal, setModal] = useState<
    | { open: false }
    | { open: true; title: string; message: string; variant: "info" | "error" | "confirm"; confirmText?: string; cancelText?: string }
  >({ open: false });
  const [pendingConfirm, setPendingConfirm] = useState<null | (() => void)>(null);

  useEffect(() => {
    setFullName(page.initialValues.fullName);
    setMarks(page.initialValues.marks);
    setFeePaid(page.initialValues.feePaid as "" | "yes" | "no");
  }, [page.initialValues.fullName, page.initialValues.marks, page.initialValues.feePaid]);

  const parsedMarks = useMemo(() => {
    const trimmed = marks.trim();
    if (!trimmed) return { ok: false as const, value: NaN };
    const n = Number(trimmed);
    return { ok: Number.isFinite(n) && Number.isInteger(n), value: n };
  }, [marks]);

  function validateBeforeSubmit(): string[] {
    const issues: string[] = [];
    if (!fullName.trim()) issues.push("Full name is required.");
    if (!marks.trim()) issues.push("Marks is required.");
    else if (!parsedMarks.ok) issues.push("Marks must be numeric (whole number) between 1 and 100.");
    else if (parsedMarks.value < 1 || parsedMarks.value > 100) issues.push("Marks must be between 1 and 100.");
    if (feePaid !== "yes" && feePaid !== "no") issues.push("Fee paid is required — select Yes or No.");
    return issues;
  }

  async function handleSubmit() {
    if (page.submitting) return;
    const issues = validateBeforeSubmit();
    if (issues.length > 0) {
      setModal({
        open: true,
        title: "Validation error",
        message: issues.join("\n"),
        variant: "error",
      });
      return;
    }
    const outcome = await page.submit({ fullName: fullName.trim(), marks: parsedMarks.value, feePaid: feePaid === "yes" });
    if (outcome.ok) {
      setModal({
        open: true,
        title: "Success",
        message: outcome.mode === "edit" ? "Student record updated." : "Student record added.",
        variant: "info",
      });
      return;
    }
    if (outcome.kind === "fieldErrors") {
      const messages = Object.values(outcome.fieldErrors).filter(Boolean);
      setModal({
        open: true,
        title: "Validation error",
        message: messages.join("\n") || "Please correct the highlighted fields.",
        variant: "error",
      });
      return;
    }
    setModal({ open: true, title: "Error", message: outcome.message, variant: "error" });
  }

  async function handleDeleteSelected() {
    if (page.selectedIds.size === 0) {
      setModal({
        open: true,
        title: "Nothing selected",
        message: "Select at least one record to delete.",
        variant: "info",
      });
      return;
    }
    setModal({
      open: true,
      title: "Confirm delete",
      message: `Delete the selected record(s)? (${page.selectedIds.size})`,
      variant: "confirm",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    setPendingConfirm(() => async () => {
      const outcome = await page.confirmDeleteSelected();
      if (outcome.ok) {
        setModal({
          open: true,
          title: "Deleted",
          message:
            outcome.deletedCount === 1 ? "Successfully deleted 1 record." : `Successfully deleted ${outcome.deletedCount} records.`,
          variant: "info",
        });
        return;
      }
      setModal({ open: true, title: "Error", message: outcome.message, variant: "error" });
    });
  }

  function getStatus(r: Pick<ResultListItem, "marks" | "feePaid">) {
    if (r.marks < 60) return { text: "Fail", className: "red" as const };
    if (r.feePaid) return { text: "Pass", className: "green" as const };
    return { text: "Pay fees to check result", className: "" as const };
  }

  const totalPages = Math.max(1, Math.ceil(page.results.length / pageSize));
  const safeTablePage = Math.min(tablePage, totalPages - 1);
  const pageStart = safeTablePage * pageSize;
  const pageRows = page.results.slice(pageStart, pageStart + pageSize);

  useEffect(() => {
    if (safeTablePage !== tablePage) setTablePage(safeTablePage);
  }, [safeTablePage, tablePage]);

  return (
    <main>
      {modal.open ? (
        <div className="modalOverlay" role="dialog" aria-modal="true" aria-label={modal.title}>
          <div className="modalPanel">
            <div className="modalHeader">{modal.title}</div>
            <div className="modalBody" style={{ whiteSpace: "pre-line" }}>
              {modal.message}
            </div>
            <div className="modalActions">
              {modal.variant === "confirm" ? (
                <>
                  <input
                    className="standardButton"
                    type="button"
                    value={modal.cancelText ?? "Cancel"}
                    onClick={() => {
                      setModal({ open: false });
                      setPendingConfirm(null);
                    }}
                    disabled={page.deleting}
                  />
                  <input
                    className="standardButton"
                    type="button"
                    value={modal.confirmText ?? "OK"}
                    onClick={() => {
                      const fn = pendingConfirm;
                      setModal({ open: false });
                      setPendingConfirm(null);
                      fn?.();
                    }}
                    style={{ marginLeft: 8 }}
                    disabled={page.deleting}
                  />
                </>
              ) : (
                <input
                  className="standardButton"
                  type="button"
                  value="OK"
                  onClick={() => setModal({ open: false })}
                />
              )}
            </div>
          </div>
        </div>
      ) : null}

      {page.submitting || page.deleting || page.loadingList ? (
        <div className="modalOverlay" aria-label="Loading">
          <div className="modalPanel">
            <div className="modalHeader">Please wait</div>
            <div className="modalBody">
              <span className="spinner" />
              {page.submitting ? "Saving record…" : page.deleting ? "Deleting selected record(s)…" : "Loading results…"}
            </div>
            <div className="modalActions">
              <input className="standardButton" type="button" value="Close" disabled />
            </div>
          </div>
        </div>
      ) : null}

      {props.initialError ? (
        <div className="formDiv">
          <table className="form-spacing">
            <tbody>
              <tr>
                <td className="cell-one">Error:</td>
                <td className="cell-two">{props.initialError}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="formDiv">
        <table className="form-spacing">
          <tbody>
            <tr>
              <td className="cell-one">Passing Marks:</td>
              <td className="cell-two">60/100</td>
            </tr>
            <tr>
              <td className="cell-one">* Full Name:</td>
              <td className="cell-two">
                <input
                  type="text"
                  className="big-field"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </td>
            </tr>
            <tr>
              <td className="cell-one">* Marks:</td>
              <td className="cell-two">
                <input
                  type="text"
                  className="big-field"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                />
              </td>
            </tr>
            <tr>
              <td valign="top" className="cell-one">
                Fee Paid:
              </td>
              <td className="two-cells">
                <input
                  type="radio"
                  name="feePaid"
                  className="none"
                  checked={feePaid === "yes"}
                  onChange={() => setFeePaid("yes")}
                />
                Yes
                <input
                  type="radio"
                  name="feePaid"
                  className="none"
                  checked={feePaid === "no"}
                  onChange={() => setFeePaid("no")}
                />
                No
              </td>
            </tr>
            <tr>
              <td className="cell-one">&nbsp;</td>
              <td className="cell-two">
                <input
                  className="standardButton"
                  type="button"
                  value="Save"
                  onClick={() => void handleSubmit()}
                  disabled={page.submitting || page.deleting}
                />
                {page.editing ? (
                  <input
                    className="standardButton"
                    type="button"
                    value="Cancel"
                    onClick={() => {
                      page.setEditing(null);
                      page.setServerFieldErrors(null);
                    }}
                    style={{ marginLeft: 8 }}
                    disabled={page.submitting || page.deleting}
                  />
                ) : null}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="main-grid">
        <input
          className="standardButton"
          type="button"
          value="Delete"
          onClick={() => void handleDeleteSelected()}
          disabled={page.deleting || page.submitting}
        />

        <table className="gridTable" cellSpacing="0" cellPadding="0">
          <tbody>
            <tr>
              <td style={{ width: 20 }} className="heading-cell">
                &nbsp;
              </td>
              <td className="heading-cell">Full Name</td>
              <td className="heading-cell">Marks</td>
              <td className="heading-cell">Fee Paid</td>
              <td className="heading-cell">Pass/Fail</td>
              <td className="heading-cell">Edit</td>
            </tr>

            {page.loadingList ? (
              <tr>
                <td className="grid-cell" colSpan={6}>
                  <span className="spinner" />
                  Loading…
                </td>
              </tr>
            ) : page.results.length === 0 ? (
              <tr>
                <td className="grid-cell" colSpan={6}>
                  No records yet.
                </td>
              </tr>
            ) : (
              pageRows.map((r, idx) => {
              const status = getStatus(r);
                const absoluteIndex = pageStart + idx;
                const rowClass = absoluteIndex % 2 === 1 ? "alternateRowColor" : undefined;
                return (
                  <tr key={r.id} className={rowClass}>
                    <td className="grid-cell">
                      <input
                        type="checkbox"
                        checked={page.selectedIds.has(r.id)}
                        onChange={(e) => page.toggle(r.id, e.target.checked)}
                      />
                    </td>
                    <td className="grid-cell">{r.fullName}</td>
                    <td className="grid-cell">{r.marks}</td>
                    <td className="grid-cell">{r.feePaid ? "Yes" : "No"}</td>
                    <td className="grid-cell">
                      {status.className ? <span className={status.className}>{status.text}</span> : status.text}
                    </td>
                    <td className="grid-cell">
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          page.setServerFieldErrors(null);
                          page.setEditing(r);
                        }}
                      >
                        Edit
                      </a>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {page.results.length > pageSize ? (
          <div style={{ marginTop: 8 }}>
            <input
              className="standardButton"
              type="button"
              value="Previous"
              disabled={safeTablePage === 0 || page.deleting || page.submitting || page.loadingList}
              onClick={() => setTablePage((p) => Math.max(0, p - 1))}
            />
            <input
              className="standardButton"
              type="button"
              value="Next"
              disabled={safeTablePage >= totalPages - 1 || page.deleting || page.submitting || page.loadingList}
              onClick={() => setTablePage((p) => Math.min(totalPages - 1, p + 1))}
              style={{ marginLeft: 8 }}
            />
            <span style={{ marginLeft: 10 }}>
              Page {safeTablePage + 1} of {totalPages} (showing {pageRows.length} of {page.results.length})
            </span>
          </div>
        ) : null}

      </div>
    </main>
  );
}
