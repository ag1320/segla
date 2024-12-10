import { forwardRef, useContext } from 'react';
import { Snackbar } from "@mui/material"
import MuiAlert from '@mui/material/Alert';
import { AppContext } from '../AppContext';

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function AppSnackbar() {
  let { setSnackbarSuccess, snackbarSuccess } = useContext(AppContext)
  let { setSnackbarError, snackbarError } = useContext(AppContext)

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarSuccess(false);
    setSnackbarError(false)
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