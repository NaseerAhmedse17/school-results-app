import { ResultListItem, ResultStatusLabel } from "@/lib/results/contracts";
import { listResults, type ResultRecord } from "@/lib/results/resultRepository";

/** All results as list DTOs (for SSR page and GET /api/results). */
export async function listResultsAsListItems(): Promise<ResultListItem[]> {
  const rows = await listResults();
  return rows.map(toListItem);
}

export function getStatusLabel(result: { marks: number; feePaid: boolean }): ResultStatusLabel {
  if (result.marks < 60) return "Fail";
  return result.feePaid ? "Pass" : "Pay fees to check result";
}

export function toListItem(r: ResultRecord): ResultListItem {
  return {
    id: String(r._id),
    fullName: r.fullName,
    marks: r.marks,
    feePaid: r.feePaid,
    statusLabel: getStatusLabel(r),
    createdAt: new Date(r.createdAt).toISOString(),
    updatedAt: new Date(r.updatedAt).toISOString(),
  };
}

