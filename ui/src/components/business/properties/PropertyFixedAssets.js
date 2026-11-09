import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { loadBusinessFixedAssets, removeBusinessFixedAsset } from "../../../state/businessFixedAssetsSlice";
import SettingsHeader from "../settings/SettingsHeader";
import FixedAssetRow from "./FixedAssetRow";
import FixedAssetDialog from "./FixedAssetDialog";
import CpaDepreciationDialog from "./CpaDepreciationDialog";
import { formatCents } from "../businessFormat";
import { TABLE_PAPER_SX, TABLE_CONTAINER_SX, HEADER_CELL_SX, CELL_SX, MUTED_TEXT } from "../businessStyles";

const TOTAL_CELL_SX = { ...CELL_SX, fontWeight: 700, borderTop: "2px solid rgba(255,255,255,0.4)" };

const sum = (items, field) => items.reduce((total, item) => total + item[field], 0);

export default function PropertyFixedAssets({ property }) {
  const dispatch = useDispatch();
  const allAssets = useSelector((state) => state.businessFixedAssets.items);
  const assets = allAssets.filter((asset) => asset.propertyId === property.id);
  const [openIds, setOpenIds] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [cpaEdit, setCpaEdit] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(loadBusinessFixedAssets());
  }, [dispatch]);

  const toggle = (id) => setOpenIds(openIds.includes(id) ? openIds.filter((openId) => openId !== id) : [...openIds, id]);

  const handleDelete = async (asset) => {
    try {
      await dispatch(removeBusinessFixedAsset(asset.id)).unwrap();
    } catch (message) {
      setError(message);
    }
  };

  return (
    <>
      <SettingsHeader title="Fixed Assets" addLabel="Add asset" onAdd={() => setIsAdding(true)} />
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {assets.length === 0 ? (
        <Typography color={MUTED_TEXT}>No fixed assets on this property yet.</Typography>
      ) : (
        <Paper sx={TABLE_PAPER_SX}>
          <TableContainer sx={TABLE_CONTAINER_SX}>
            <Table size="small" sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ ...HEADER_CELL_SX, width: 40 }} />
                  <TableCell sx={HEADER_CELL_SX}>Name</TableCell>
                  <TableCell sx={HEADER_CELL_SX}>Kind</TableCell>
                  <TableCell sx={HEADER_CELL_SX}>In service</TableCell>
                  <TableCell sx={HEADER_CELL_SX} align="right">Cost</TableCell>
                  <Tooltip title="Segla's estimate through today" placement="top">
                    <TableCell sx={HEADER_CELL_SX} align="right">Depreciated</TableCell>
                  </Tooltip>
                  <TableCell sx={HEADER_CELL_SX} align="right">Book value</TableCell>
                  <TableCell sx={HEADER_CELL_SX} />
                </TableRow>
              </TableHead>
              <TableBody>
                {assets.map((asset) => (
                  <FixedAssetRow
                    key={asset.id}
                    fixedAsset={asset}
                    isOpen={openIds.includes(asset.id)}
                    onToggle={() => toggle(asset.id)}
                    onEdit={() => setEditingAsset(asset)}
                    onDelete={() => handleDelete(asset)}
                    onEditCpa={(year) => setCpaEdit({ asset, year })}
                  />
                ))}
                <TableRow>
                  <TableCell sx={TOTAL_CELL_SX} colSpan={4}>Total</TableCell>
                  <TableCell sx={TOTAL_CELL_SX} align="right">{formatCents(sum(assets, "costCents"))}</TableCell>
                  <TableCell sx={TOTAL_CELL_SX} align="right">{formatCents(sum(assets, "accumulatedCents"))}</TableCell>
                  <TableCell sx={TOTAL_CELL_SX} align="right">{formatCents(sum(assets, "bookValueCents"))}</TableCell>
                  <TableCell sx={TOTAL_CELL_SX} />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      {isAdding && <FixedAssetDialog propertyId={property.id} fixedAsset={null} onClose={() => setIsAdding(false)} />}
      {editingAsset && (
        <FixedAssetDialog propertyId={property.id} fixedAsset={editingAsset} onClose={() => setEditingAsset(null)} />
      )}
      {cpaEdit && (
        <CpaDepreciationDialog fixedAsset={cpaEdit.asset} year={cpaEdit.year} onClose={() => setCpaEdit(null)} />
      )}
    </>
  );
}
