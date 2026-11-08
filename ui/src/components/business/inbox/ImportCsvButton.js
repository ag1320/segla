import { useState } from "react";
import { useDispatch } from "react-redux";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Button } from "@mui/material";
import { importBusinessBankCsv } from "../../../state/businessBankTransactionsSlice";

const countOf = (count) => `${count} transaction${count === 1 ? "" : "s"}`;

// onResult receives { severity, text } describing how the import went.
export default function ImportCsvButton({ bankAccount, onResult }) {
  const dispatch = useDispatch();
  const [importing, setImporting] = useState(false);

  const handleFile = async (event) => {
    const file = event.target.files[0];
    // Cleared so choosing the same file again still triggers an import.
    event.target.value = "";
    if (!file) return;

    setImporting(true);
    try {
      const csv = await file.text();
      const { importedCount, alreadyImportedCount } = await dispatch(
        importBusinessBankCsv({ bankAccountId: bankAccount.id, csv })
      ).unwrap();
      onResult({
        severity: "success",
        text: `${bankAccount.name}: imported ${countOf(importedCount)}. ${countOf(alreadyImportedCount)} were already here.`,
      });
    } catch (message) {
      onResult({ severity: "error", text: `${bankAccount.name}: ${message}` });
    }
    setImporting(false);
  };

  return (
    <Button
      component="label"
      variant="contained"
      startIcon={<UploadFileIcon />}
      disabled={importing}
      sx={{ backgroundColor: "#0f4c75" }}
    >
      {`Import ${bankAccount.name}`}
      <input type="file" accept=".csv,text/csv" hidden onChange={handleFile} />
    </Button>
  );
}
