export type ResultInput = {
  fullName: string;
  marks: number;
  feePaid: boolean;
};

export type FieldErrors = Partial<Record<keyof ResultInput, string>>;

export type ValidationResult =
  | { ok: true; value: ResultInput }
  | { ok: false; message: string; fieldErrors?: FieldErrors };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function validateResultInput(body: unknown): ValidationResult {
  if (!isRecord(body)) {
    return { ok: false, message: "Invalid request body." };
  }

  const rawFullName = body.fullName;
  const rawMarks = body.marks;
  const rawFeePaid = body.feePaid;

  const fieldErrors: FieldErrors = {};

  const fullName = typeof rawFullName === "string" ? rawFullName.trim() : "";
  if (!fullName) fieldErrors.fullName = "Full Name is required.";

  const marksNum =
    typeof rawMarks === "number"
      ? rawMarks
      : typeof rawMarks === "string" && rawMarks.trim() !== ""
        ? Number(rawMarks)
        : NaN;
  if (!Number.isFinite(marksNum)) fieldErrors.marks = "Marks must be a number between 1 and 100.";
  else if (marksNum < 1 || marksNum > 100) fieldErrors.marks = "Marks must be between 1 and 100.";
  else if (!Number.isInteger(marksNum)) fieldErrors.marks = "Marks must be an integer.";

  let feePaid: boolean | undefined;
  if (typeof rawFeePaid === "boolean") feePaid = rawFeePaid;
  else if (typeof rawFeePaid === "string") feePaid = rawFeePaid.toLowerCase() === "yes";
  else feePaid = undefined;

  if (typeof feePaid !== "boolean") fieldErrors.feePaid = "Fee Paid is required.";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors };
  }

  return { ok: true, value: { fullName, marks: marksNum, feePaid: feePaid! } };
}

