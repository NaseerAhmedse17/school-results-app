"use client";

import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { MobileResultCard } from "@/components/results/MobileResultCard";
import { ResultStatusChip } from "@/components/results/ResultStatusChip";
import { ResultListItem } from "@/lib/results/contracts";

const ROWS_PER_PAGE = 5;

export function ResultsTable(props: {
  results: ResultListItem[];
  selectedIds: Set<string>;
  onToggle: (id: string, checked: boolean) => void;
  /** Select or clear all rows on the current page only */
  onToggleMany: (ids: string[], checked: boolean) => void;
  onDeleteSelected: () => void;
  onEdit: (row: ResultListItem) => void;
  /** Stretch to fill the right column beside the form (lg+ layouts) */
  fillAvailableHeight?: boolean;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [page, setPage] = useState(0);

  const fill = Boolean(props.fillAvailableHeight);

  const maxPage = Math.max(0, Math.ceil(props.results.length / ROWS_PER_PAGE) - 1);
  const safePage = Math.min(page, maxPage);

  const pageRows = useMemo(() => {
    const start = safePage * ROWS_PER_PAGE;
    return props.results.slice(start, start + ROWS_PER_PAGE);
  }, [props.results, safePage]);

  const pageIds = useMemo(() => pageRows.map((r) => r.id), [pageRows]);

  const allCheckedOnPage =
    pageRows.length > 0 && pageRows.every((r) => props.selectedIds.has(r.id));
  const someCheckedOnPage = pageRows.some((r) => props.selectedIds.has(r.id));

  function handleToggleAllOnPage(checked: boolean) {
    props.onToggleMany(pageIds, checked);
  }

  function handleChangePage(_: unknown, newPage: number) {
    setPage(newPage);
  }

  return (
    <Card
      sx={{
        height: fill ? "100%" : undefined,
        display: fill ? "flex" : undefined,
        flexDirection: fill ? "column" : undefined,
        minHeight: fill ? 0 : undefined,
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <CardHeader
        avatar={
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "primary.main",
            }}
          >
            <TableChartOutlinedIcon fontSize="large" />
          </Box>
        }
        title={
          <Typography variant={fill ? "h6" : "h5"} component="h2">
            Class results
          </Typography>
        }
        subheader={
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {fill
              ? "Multi-select delete; edit sends the row to the form."
              : "Select rows to remove multiple entries. Use edit to load a record back into the form above."}{" "}
            {props.results.length > 0 ? (
              <Box component="span" sx={{ display: "block", mt: 0.5, fontWeight: 600, color: "text.primary" }}>
                Showing {pageRows.length} of {props.results.length} · {ROWS_PER_PAGE} per page
              </Box>
            ) : null}
          </Typography>
        }
        action={
          <Tooltip title={props.selectedIds.size === 0 ? "Select at least one row" : "Delete selected"}>
            <span>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlineRoundedIcon />}
                onClick={props.onDeleteSelected}
                disabled={props.selectedIds.size === 0}
                sx={{ mr: { xs: 0, sm: 1 }, mt: { xs: 1, sm: 0 } }}
              >
                Delete
                {props.selectedIds.size > 0 ? ` (${props.selectedIds.size})` : ""}
              </Button>
            </span>
          </Tooltip>
        }
        sx={{
          flexShrink: 0,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "flex-start" },
          "& .MuiCardHeader-action": { m: 0, alignSelf: { xs: "stretch", sm: "auto" } },
        }}
      />
      <CardContent
        sx={{
          pt: 0,
          flex: fill ? 1 : undefined,
          minHeight: fill ? 0 : undefined,
          display: fill ? "flex" : undefined,
          flexDirection: fill ? "column" : undefined,
          overflow: fill ? "hidden" : undefined,
        }}
      >
        {props.results.length === 0 ? (
          <Paper
            variant="outlined"
            sx={{
              py: 6,
              px: 3,
              textAlign: "center",
              borderRadius: 2,
              borderStyle: "dashed",
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              flex: fill ? 1 : undefined,
              display: fill ? "flex" : undefined,
              flexDirection: fill ? "column" : undefined,
              alignItems: fill ? "center" : undefined,
              justifyContent: fill ? "center" : undefined,
              minHeight: fill ? 200 : undefined,
            }}
          >
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              No results yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Submit the form above to add your first student record.
            </Typography>
          </Paper>
        ) : (
          <>
            <Box
              sx={{
                flex: fill ? 1 : undefined,
                minHeight: fill ? 0 : undefined,
                overflow: isMobile ? "auto" : undefined,
                pr: isMobile ? 0.5 : undefined,
              }}
            >
              {isMobile ? (
                <Stack spacing={2}>
                  {pageRows.map((r) => (
                    <MobileResultCard
                      key={r.id}
                      row={r}
                      selected={props.selectedIds.has(r.id)}
                      onToggle={(checked) => props.onToggle(r.id, checked)}
                      onEdit={() => props.onEdit(r)}
                    />
                  ))}
                </Stack>
              ) : (
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    overflow: "auto",
                    maxHeight: fill ? "100%" : { md: "min(60vh, 520px)" },
                  }}
                >
                  <Table stickyHeader size="medium">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.06) }}>
                          <Checkbox
                            checked={allCheckedOnPage}
                            indeterminate={!allCheckedOnPage && someCheckedOnPage}
                            onChange={(e) => handleToggleAllOnPage(e.target.checked)}
                            inputProps={{ "aria-label": "Select all rows on this page" }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.06) }}>Full name</TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.06), width: 100 }}
                        >
                          Marks
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.06), width: 120 }}
                        >
                          Fee paid
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.06), minWidth: 200 }}>
                          Status
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.06), width: 88 }}>
                          Edit
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pageRows.map((r) => {
                        const isSelected = props.selectedIds.has(r.id);
                        return (
                          <TableRow
                            key={r.id}
                            hover
                            selected={isSelected}
                            sx={{
                              "&:nth-of-type(even)": { bgcolor: alpha(theme.palette.primary.main, 0.03) },
                            }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox checked={isSelected} onChange={(e) => props.onToggle(r.id, e.target.checked)} />
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight={600}>{r.fullName}</Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={r.marks} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell align="center">{r.feePaid ? "Yes" : "No"}</TableCell>
                            <TableCell>
                              <ResultStatusChip label={r.statusLabel} />
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => props.onEdit(r)}
                                  aria-label={`Edit ${r.fullName}`}
                                >
                                  <EditRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>

            <TablePagination
              component="div"
              count={props.results.length}
              page={safePage}
              onPageChange={handleChangePage}
              rowsPerPage={ROWS_PER_PAGE}
              rowsPerPageOptions={[ROWS_PER_PAGE]}
              onRowsPerPageChange={() => undefined}
              sx={{
                flexShrink: 0,
                borderTop: 1,
                borderColor: "divider",
                px: { xs: 0, sm: 1 },
                "& .MuiTablePagination-toolbar": { flexWrap: "wrap", gap: 1 },
              }}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
