import type { ResultFieldErrors } from "@/lib/results/contracts";

/** Keep only known form keys from API `fieldErrors` payloads. */
export function normalizeFieldErrors(raw?: Record<string, string>): ResultFieldErrors | null {
  if (!raw || Object.keys(raw).length === 0) return null;
  const out: ResultFieldErrors = {};
  if (raw.fullName) out.fullName = raw.fullName;
  if (raw.marks) out.marks = raw.marks;
  if (raw.feePaid) out.feePaid = raw.feePaid;
  return Object.keys(out).length ? out : null;
}
