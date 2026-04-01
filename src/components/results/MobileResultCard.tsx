"use client";

import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { Box, Button, Checkbox, Chip, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { ResultListItem, ResultStatusLabel } from "@/lib/results/contracts";
import { ResultStatusChip } from "@/components/results/ResultStatusChip";

type Props = {
  row: ResultListItem;
  selected: boolean;
  onToggle: (checked: boolean) => void;
  onEdit: () => void;
};

function getClientStatusLabel(r: Pick<ResultListItem, "marks" | "feePaid">): ResultStatusLabel {
  if (r.marks < 60) return "Fail";
  return r.feePaid ? "Pass" : "Pay fees to check result";
}

export function MobileResultCard({ row, selected, onToggle, onEdit }: Props) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        borderColor: "divider",
        bgcolor: "background.paper",
        transition: "box-shadow 0.2s, border-color 0.2s",
        "&:hover": {
          boxShadow: 2,
          borderColor: (t) => alpha(t.palette.primary.main, 0.25),
        },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Checkbox checked={selected} onChange={(e) => onToggle(e.target.checked)} sx={{ mt: -0.5 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700} noWrap title={row.fullName}>
            {row.fullName}
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
            <Chip size="small" variant="outlined" label={`${row.marks} pts`} />
            <Chip size="small" variant="outlined" label={row.feePaid ? "Fee paid" : "Fee unpaid"} />
            <ResultStatusChip label={getClientStatusLabel(row)} />
          </Stack>
          <Box sx={{ mt: 1.5 }}>
            <Button size="small" startIcon={<EditRoundedIcon fontSize="small" />} onClick={onEdit} sx={{ textTransform: "none" }}>
              Edit
            </Button>
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
}
