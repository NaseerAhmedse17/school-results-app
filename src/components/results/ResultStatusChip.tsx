"use client";

import { Chip } from "@mui/material";
import type { ResultListItem } from "@/lib/results/contracts";

type Props = { label: ResultListItem["statusLabel"] };

export function ResultStatusChip({ label }: Props) {
  const color = label === "Pass" ? "success" : label === "Fail" ? "error" : "warning";
  const variant = label === "Pay fees to check result" ? "outlined" : "filled";
  return <Chip size="small" label={label} color={color} variant={variant} />;
}
