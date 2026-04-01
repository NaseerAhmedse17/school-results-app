"use client";

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

type Props = {
  open: boolean;
  selectedCount: number;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteRecordsDialog({ open, selectedCount, onClose, onConfirm }: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
