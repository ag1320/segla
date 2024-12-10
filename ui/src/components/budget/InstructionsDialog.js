import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useContext } from "react";
import { AppContext } from "../../AppContext";

export default function InstructionsDialog() {
  
  let { openInstructions, setOpenInstructions } = useContext(AppContext)

  return (
    <Dialog
      open={openInstructions}
      onClose={() => setOpenInstructions(false)}
      aria-labelledby="confirm-dialog"
    >
      <DialogTitle id="confirm-dialog">
        Edit the Master Income/Expenses Lists Before Creating a New Budget
      </DialogTitle>
      <DialogContent>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={() => setOpenInstructions(false)}
          sx={{ backgroundColor: "#0f4c75" }}
        >
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
}