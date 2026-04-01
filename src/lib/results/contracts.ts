export type ResultStatusLabel = "Pass" | "Fail" | "Pay fees to check result";

/** Shared form keys for client + server validation messages */
export type ResultFieldKey = "fullName" | "marks" | "feePaid";

export type ResultFieldErrors = Partial<Record<ResultFieldKey, string>>;

export type ResultFormValues = {
  fullName: string;
  marks: string;
  feePaid: "yes" | "no" | "";
};

export type ResultListItem = {
  id: string;
  fullName: string;
  marks: number;
  feePaid: boolean;
  statusLabel: ResultStatusLabel;
  createdAt: string;
  updatedAt: string;
};

