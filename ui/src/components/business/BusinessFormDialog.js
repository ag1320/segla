import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";

// The frame every business add/edit form shares. error is the server's
// message (or a form check's), shown above the buttons.
export default function BusinessFormDialog({
  title,
  error,
  saving,
  onClose,
  onSubmit,
  submitLabel = "Save",
  maxWidth = "sm",
  children,
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth={maxWidth}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {children}
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            sx={{ backgroundColor: "#0f4c75" }}
          >
            {submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
