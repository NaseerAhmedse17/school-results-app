"use client";

import { Alert, Box, Container, Stack } from "@mui/material";
import { DeleteRecordsDialog } from "@/components/results/DeleteRecordsDialog";
import { DashboardHero } from "@/components/results/DashboardHero";
import { ResultsPageFooter } from "@/components/results/ResultsPageFooter";
import { ResultsToast } from "@/components/results/ResultsToast";
import { ResultsForm } from "@/components/ResultsForm";
import { ResultsTable } from "@/components/ResultsTable";
import { useResultsPage } from "@/hooks/useResultsPage";
import type { ResultListItem } from "@/lib/results/contracts";

type Props = { initialResults: ResultListItem[]; initialError?: string | null };

export function ResultsPageClient(props: Props) {
  const page = useResultsPage({ initialResults: props.initialResults });

  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <DashboardHero isStackedLayout={page.isStackedLayout} />

      <Container
        maxWidth={false}
        sx={{
          py: { xs: 1.25, md: 1.5 },
          px: { xs: 2, sm: 3, md: 4 },
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          width: "100%",
          maxWidth: { xs: "100%", sm: "min(100%, 1680px)" },
          mx: "auto",
        }}
      >
        <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
          {props.initialError ? (
            <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
              {props.initialError}
            </Alert>
          ) : null}

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
              gap: { xs: 2, lg: 2.5 },
              alignItems: "stretch",
              flex: 1,
              minHeight: 0,
            }}
          >
            <Box
              sx={{
                flex: { lg: "0 0 420px" },
                minWidth: 0,
                maxWidth: { lg: 480 },
              }}
            >
              <ResultsForm
                key={page.editing?.id ?? "new"}
                mode={page.editing ? "edit" : "create"}
                initialValues={page.initialValues}
                onSubmit={page.submit}
                submitting={page.submitting}
                onCancelEdit={() => {
                  page.setEditing(null);
                  page.setServerFieldErrors(null);
                }}
                serverFieldErrors={page.serverFieldErrors}
                onDismissServerErrors={() => page.setServerFieldErrors(null)}
                compact={!page.isStackedLayout}
              />
            </Box>

            <Box
              id="class-results"
              sx={{
                flex: { lg: 1 },
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                minHeight: { lg: "min(72vh, 780px)" },
              }}
            >
              <ResultsTable
                results={page.results}
                loading={page.loadingList}
                selectedIds={page.selectedIds}
                onToggle={page.toggle}
                onToggleMany={page.toggleMany}
                onDeleteSelected={page.openDeleteConfirm}
                onEdit={(row) => {
                  page.setServerFieldErrors(null);
                  page.setEditing(row);
                }}
                fillAvailableHeight={!page.isStackedLayout}
              />
            </Box>
          </Box>
        </Stack>
      </Container>

      <ResultsPageFooter />

      <ResultsToast state={page.snackbar} onClose={page.closeSnackbar} />

      <DeleteRecordsDialog
        open={page.deleteConfirmOpen}
        selectedCount={page.selectedIds.size}
        loading={page.deleting}
        onClose={() => page.setDeleteConfirmOpen(false)}
        onConfirm={() => void page.confirmDeleteSelected()}
      />
    </Box>
  );
}
