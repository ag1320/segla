import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { Box, Collapse, IconButton, TableCell, TableRow } from "@mui/material";
import FixedAssetYears from "./FixedAssetYears";
import { ASSET_CLASS_LABELS } from "./propertyLabels";
import { formatCents, formatDate } from "../businessFormat";
import { CELL_SX, MUTED_TEXT } from "../businessStyles";

const SUMMARY_CELL_SX = { ...CELL_SX, borderBottom: "1px solid rgba(255,255,255,0.12)", cursor: "pointer" };

export default function FixedAssetRow({ fixedAsset, isOpen, onToggle, onEdit, onDelete, onEditCpa }) {
  const cellSx = { ...SUMMARY_CELL_SX, opacity: fixedAsset.disposalDate ? 0.55 : 1 };

  return (
    <>
      <TableRow hover onClick={onToggle}>
        <TableCell sx={cellSx}>
          <IconButton size="small" aria-label={isOpen ? "collapse asset" : "expand asset"} sx={{ color: "white" }}>
            {isOpen ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
          </IconButton>
        </TableCell>
        <TableCell sx={cellSx}>{fixedAsset.name}</TableCell>
        <TableCell sx={{ ...cellSx, color: MUTED_TEXT }}>{ASSET_CLASS_LABELS[fixedAsset.assetClass]}</TableCell>
        <TableCell sx={{ ...cellSx, whiteSpace: "nowrap" }}>
          {formatDate(fixedAsset.inServiceDate)}
          {fixedAsset.disposalDate && ` – ${formatDate(fixedAsset.disposalDate)}`}
        </TableCell>
        <TableCell sx={cellSx} align="right">{formatCents(fixedAsset.costCents)}</TableCell>
        <TableCell sx={cellSx} align="right">{formatCents(fixedAsset.accumulatedCents)}</TableCell>
        <TableCell sx={cellSx} align="right">{formatCents(fixedAsset.bookValueCents)}</TableCell>
        <TableCell sx={{ ...SUMMARY_CELL_SX, cursor: "default", whiteSpace: "nowrap" }} onClick={(event) => event.stopPropagation()}>
          <IconButton size="small" onClick={onEdit} aria-label={`edit ${fixedAsset.name}`}>
            <EditIcon sx={{ fill: "white" }} fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onDelete} aria-label={`delete ${fixedAsset.name}`}>
            <DeleteOutlineIcon sx={{ fill: "white" }} fontSize="small" />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={8} sx={{ p: 0, borderBottom: isOpen ? "1px solid rgba(255,255,255,0.12)" : "none" }}>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Box sx={{ pl: 7, pr: 2, py: 1, backgroundColor: "rgba(255,255,255,0.03)" }}>
              <FixedAssetYears fixedAsset={fixedAsset} onEditCpa={onEditCpa} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
