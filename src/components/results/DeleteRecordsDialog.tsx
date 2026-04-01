"use client";

import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

type Props = {
  open: boolean;
  selectedCount: number;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteRecordsDialog({ open, selectedCount, loading, onClose, onConfirm }: Props) {
  const isLoading = Boolean(loading);
  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      disableScrollLock
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle id="delete-dialog-title">Delete selected records?</DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-dialog-description">
          You are about to delete {selectedCount} selected record{selectedCount !== 1 ? "s" : ""}. This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          autoFocus
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {isLoading ? "Deleting…" : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
