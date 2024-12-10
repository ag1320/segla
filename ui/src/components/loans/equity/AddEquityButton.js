import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import { Chip, Button } from "@mui/material";
import { useState } from "react";
import AddEquityDialog from "./AddEquityDialog.js";

export default function AddEquityButton({endpoint, setEquityRefresh, equityRefresh}) {
  let [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <AddEquityDialog
        open={open}
        handleClose={handleClose}
        endpoint = {endpoint}
        setEquityRefresh = {setEquityRefresh}
        equityRefresh = {equityRefresh}
      />
        <Button
          onClick={handleOpen}
          style={{ paddingLeft: 40 }}
        >
          <Chip
            avatar={<AddCircleOutline style={{ color: "white" }} />}
            label="ADD NEW EQUITY LINE"
            variant="outlined"
            style={{ color: "white" }}
          />
        </Button>
    </>
  );
}