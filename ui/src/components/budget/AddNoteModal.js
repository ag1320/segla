import { useContext, useState, useRef, useEffect } from "react";
import { AppContext } from "../../AppContext";
import './AddNoteModal.css'
import axios from "axios";
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

  let { budgetRefresh, setBudgetRefresh } = useContext(AppContext);
  let { date } = useContext(AppContext);
  let { setReason } = useContext(AppContext);
  let { setSnackbarSuccess, setSnackbarError } = useContext(AppContext);
  let [title, setTitle] = useState("");
  let [details, setDetails] = useState("");
  const handleTitleChange = (e, value) => setTitle(e.target.value);
  const handleDetailsChange = (e) => setDetails(e.target.value);
  const inputRef = useRef();

  const postNote = async () => {
    let month = date?.toLocaleString("EN-US", { month: "long" });
    let year = date?.getFullYear();
    let payload = {
      title,
      details,
      month,
      year,
    };
    try {
      let res = await axios.post("http://localhost:3001/notes", payload);
      setSnackbarSuccess(true);
      return res.data;
    } catch (err) {
      setSnackbarError(true);
    }
  };

  const handleModalClose = () => {
    setTitle("");
    setDetails("");
    setOpen(false);
  };

  const handleSubmit = () => {
    postNote().then(() => {
      setReason("note");
      setBudgetRefresh(!budgetRefresh);
      setTitle("");
      setDetails("");
    });
  };

  const handleDetailsKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [budgetRefresh]);

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
