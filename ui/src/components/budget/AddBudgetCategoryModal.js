import { useContext, useState } from "react";
import { AppContext } from "../../AppContext";
import {
  Modal,
  Box,
  Grid,
  TextField,
  Typography,
  Button,
  Slider,
} from "@mui/material";
import axios from "axios";

export default function AddBudgetCategoryModal({ open, setOpen, categories }) {
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
  let { setReason } = useContext(AppContext);
  let { error, setError } = useContext(AppContext);
  let { setSnackbarSuccess, setSnackbarError } = useContext(AppContext);
  let [category, setCategory] = useState("");
  let [range, setRange] = useState([50, 200]);

  const handleCategoryChange = (e) => setCategory(e.target.value);
  const handleSliderChange = (e, newValue, index) => setRange(newValue);

  const postBudgetCategory = async () => {
    let payload = {
      category,
      range,
    };
    try{
      let res = await axios.post(
        "http://localhost:3001/budgetCategories",
        payload
      );
      setSnackbarSuccess(true)
      return res.data;
    } catch (err) {
      setSnackbarError(true)
    }
  };

  const handleModalClose = () => {
    setCategory("");
    setRange([50, 150]);
    setOpen(false);
    setError(false)
  };

  const handleBlur = () =>{
    let doesIncludeCategory =
    categories.filter(
      (e) => e.category?.toLowerCase() === category?.toLowerCase()
    ).length > 0;
    if (doesIncludeCategory){
      setError(true)
    } else {
      setError(false)
    }
  }

  const handleSubmit = () => {
    let doesIncludeCategory =
    categories.filter(
      (e) => e.category?.toLowerCase() === category?.toLowerCase()
    ).length > 0;
    if (doesIncludeCategory){
      setError(true)
      alert('Category Already Exists. Either Edit the Existing Category or Create a New One.')
      return
    }
    postBudgetCategory().then(()=>{
      setReason('budgetCategory')
      setBudgetRefresh(!budgetRefresh);
      handleModalClose();
    })
  };

  return (
    <Modal
      open={open}
      onClose={handleModalClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography component = {'span'} id="modal-modal-title" variant="h6" style = {{marginBottom: '20px'}}>
          Submit a New Budget Category
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <TextField
              label="Category"
              variant="outlined"
              onChange={handleCategoryChange}
              value={category}
              error={error}
              onBlur={handleBlur}
              helperText = {error? 'Category Already Exists': ''}
              placeholder="Enter the New Category"
              required
            />
          </Grid>
          <>
            <Grid item xs={8}>
              <Grid container>
                <Grid item sx={12} style={{ width: "100%" }}>
                  <Grid container>
                    <Grid item xs={6}>
                      <Box style = {{display: 'flex', justifyContent: 'start'}}>
                        <Typography component = {'span'}>Warning</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                    <Box style = {{display: 'flex', justifyContent: 'end'}}>
                      <Typography component = {'span'}>Limit</Typography>
                    </Box>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item sx={12} style={{ width: "100%" }}>
                  <Slider
                    value={range || 0}
                    min={0}
                    max={1000}
                    step={10}
                    valueLabelDisplay="auto"
                    onChange={(e, value) => handleSliderChange(e, value)}
                  />
                </Grid>
              </Grid>
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
  );
}
