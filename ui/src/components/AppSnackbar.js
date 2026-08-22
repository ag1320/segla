import { forwardRef } from 'react';
import { Snackbar } from "@mui/material"
import MuiAlert from '@mui/material/Alert';
import { useSelector, useDispatch } from "react-redux";
import { setSnackbarSuccess, setSnackbarError } from "../state/uiSlice";

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function AppSnackbar() {
  const dispatch = useDispatch();
  const snackbarSuccess = useSelector((state) => state.ui.snackbarSuccess);
  const snackbarError = useSelector((state) => state.ui.snackbarError);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(setSnackbarSuccess(false));
    dispatch(setSnackbarError(false));
  };

  return (
    <>
      <Snackbar open={snackbarSuccess} autoHideDuration={1000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          Success!
        </Alert>
      </Snackbar>
      <Snackbar open={snackbarError} autoHideDuration={1000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
          Error!
        </Alert>
      </Snackbar>
    </>
  )
}
