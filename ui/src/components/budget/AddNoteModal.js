import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import './AddNoteModal.css'
import { addNote } from "../../state/notesSlice";
import { setSnackbarSuccess, setSnackbarError } from "../../state/uiSlice";
import { Modal, Box, Typography, Grid, TextField, Button } from "@mui/material";

export default function AddNoteModal({ open, setOpen }) {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    textAlign: "center",
  };

  const dispatch = useDispatch();
  const date = useSelector((state) => state.budget.date);
  let [title, setTitle] = useState("");
  let [details, setDetails] = useState("");
  const handleTitleChange = (e, value) => setTitle(e.target.value);
  const handleDetailsChange = (e) => setDetails(e.target.value);
  const inputRef = useRef();

  const handleModalClose = () => {
    setTitle("");
    setDetails("");
    setOpen(false);
  };

  const handleSubmit = () => {
    let month = date?.toLocaleString("EN-US", { month: "long" });
    let year = date?.getFullYear();
    dispatch(addNote({ title, details, month, year }))
      .unwrap()
      .then(() => dispatch(setSnackbarSuccess(true)))
      .catch(() => dispatch(setSnackbarError(true)));
    setTitle("");
    setDetails("");
  };

  const handleDetailsKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <>
      <Modal
        open={open}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box className="monthly-note-text">
            <Typography
              component={"span"}
              id="modal-modal-title"
              variant="h6"
            >
              Submit a New Note for This Month's Budget
            </Typography>
          </Box>
          <Grid container colunmnSpacing={2} rowSpacing={4}>
            <Grid item xs={6}>
              <TextField
                label="Title"
                variant="outlined"
                onChange={handleTitleChange}
                inputRef={inputRef}
                value={title}
                placeholder="Enter a Title"
                required
              />
            </Grid>
            <>
              <Grid item xs={6}>
                <TextField
                  label="Details"
                  variant="outlined"
                  multiline
                  onChange={handleDetailsChange}
                  onKeyDown={handleDetailsKeyDown}
                  value={details}
                  placeholder="Enter the Note Details"
                  required
                />
              </Grid>
            </>
            <Grid item xs={12}>
              <Grid container justifyContent="end" spacing={2}>
                <Grid item xs={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleModalClose}
                    sx={{ backgroundColor: "#0f4c75" }}
                  >
                    Cancel
                  </Button>
                </Grid>
                <Grid item xs={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSubmit}
                    sx={{ backgroundColor: "#0f4c75" }}
                  >
                    Submit
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </>
  );
}
