import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import { Chip, Button } from "@mui/material";
import { useState } from "react";
import CalculateGainsDialog from "./CalculateGainsDialog.js";

export default function CalculateGainsButton({rows}) {
  let [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <CalculateGainsDialog
        open={open}
        handleClose={handleClose}
        rows = {rows}
      />
        <Button
          onClick={handleOpen}
          style={{ paddingLeft: 5 }}
        >
          <Chip
            avatar={<AddCircleOutline style={{ color: "white" }} />}
            label="CALCULATE GAINS/LOSSES"
            variant="outlined"
            style={{ color: "white" }}
          />
        </Button>
    </>
  );
}