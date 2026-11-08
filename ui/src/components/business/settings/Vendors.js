import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Typography } from "@mui/material";
import { loadBusinessVendors } from "../../../state/businessVendorsSlice";
import BusinessTable from "../BusinessTable";
import SettingsHeader from "./SettingsHeader";
import VendorDialog from "./VendorDialog";
import { MUTED_TEXT } from "../businessStyles";

const COLUMNS = [
  { id: "name", label: "Name", align: "left" },
  { id: "eligibleLabel", label: "1099 Eligible", align: "left" },
  { id: "w9Label", label: "W-9 on File", align: "left" },
  { id: "w9Location", label: "W-9 Location", align: "left" },
  { id: "statusLabel", label: "Status", align: "left" },
];

const yesOrBlank = (value) => (value ? "Yes" : null);

export default function Vendors() {
  const dispatch = useDispatch();
  const vendors = useSelector((state) => state.businessVendors.items);
  const [isAdding, setIsAdding] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  useEffect(() => {
    dispatch(loadBusinessVendors());
  }, [dispatch]);

  const rows = vendors.map((vendor) => ({
    ...vendor,
    eligibleLabel: yesOrBlank(vendor.is1099Eligible),
    w9Label: yesOrBlank(vendor.hasW9OnFile),
    statusLabel: vendor.isActive ? "Active" : "Inactive",
  }));

  return (
    <>
      <SettingsHeader title="Vendors" addLabel="Add vendor" onAdd={() => setIsAdding(true)} />
      {rows.length === 0 ? (
        <Typography color={MUTED_TEXT}>No vendors yet.</Typography>
      ) : (
        <BusinessTable
          columns={COLUMNS}
          rows={rows}
          onEdit={setEditingVendor}
          isRowMuted={(row) => !row.isActive}
        />
      )}
      {isAdding && <VendorDialog vendor={null} onClose={() => setIsAdding(false)} />}
      {editingVendor && <VendorDialog vendor={editingVendor} onClose={() => setEditingVendor(null)} />}
    </>
  );
}
