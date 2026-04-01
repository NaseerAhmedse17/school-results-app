import { ResultListItem, ResultStatusLabel } from "@/lib/results/contracts";
import { listResults, type ResultRecord } from "@/lib/results/resultRepository";

/** All results as list DTOs (for SSR page and GET /api/results). */
export async function listResultsAsListItems(): Promise<ResultListItem[]> {
  const rows = await listResults();
  return rows.map(toListItem);
}

function coerceFeePaid(value: unknown): boolean {
  if (value === true) return true;
  if (value === false) return false;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    return v === "yes" || v === "true" || v === "1";
  }
  return false;
}

export function getStatusLabel(result: { marks: number; feePaid: unknown }): ResultStatusLabel {
  if (result.marks < 60) return "Fail";
  return coerceFeePaid(result.feePaid) ? "Pass" : "Pay fees to check result";
}

export function toListItem(r: ResultRecord): ResultListItem {
  const feePaid = coerceFeePaid((r as unknown as { feePaid?: unknown }).feePaid);
  return {
    id: String(r._id),
    fullName: r.fullName,
    marks: r.marks,
    feePaid,
    statusLabel: getStatusLabel({ marks: r.marks, feePaid }),
    createdAt: new Date(r.createdAt).toISOString(),
    updatedAt: new Date(r.updatedAt).toISOString(),
  };
}

