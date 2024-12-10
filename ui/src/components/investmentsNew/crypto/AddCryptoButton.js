import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import { Chip, Button } from "@mui/material";
import { useState } from "react";
import AddCryptoDialog from "./AddCryptoDialog.js";

export default function AddCryptoButton({endpoint, setCryptoRefresh, cryptoRefresh}) {
  let [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <AddCryptoDialog
        open={open}
        handleClose={handleClose}
        endpoint = {endpoint}
        setCryptoRefresh = {setCryptoRefresh}
        cryptoRefresh = {cryptoRefresh}
      />
        <Button
          onClick={handleOpen}
          style={{ paddingLeft: 40 }}
        >
          <Chip
            avatar={<AddCircleOutline style={{ color: "white" }} />}
            label="ADD NEW CRYPTOCURRENCY"
            variant="outlined"
            style={{ color: "white" }}
          />
        </Button>
    </>
  );
}