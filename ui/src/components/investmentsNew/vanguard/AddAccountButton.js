import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import { Chip, Button } from "@mui/material";
import { useState } from "react";
import AddAccountDialog from "./AddAccountDialog.js";

export default function AddAccountButton({endpoint, setAccountsRefresh, accountsRefresh}) {
  let [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <AddAccountDialog
        open={open}
        handleClose={handleClose}
        endpoint = {endpoint}
        setAccountsRefresh = {setAccountsRefresh}
        accountsRefresh = {accountsRefresh}
      />
        <Button
          onClick={handleOpen}
          style={{ paddingLeft: 40 }}
        >
          <Chip
            avatar={<AddCircleOutline style={{ color: "white" }} />}
            label="ADD NEW ACCOUNT"
            variant="outlined"
            style={{ color: "white" }}
          />
        </Button>
    </>
  );
}