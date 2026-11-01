import UndoIcon from "@mui/icons-material/Undo";
import { Box, Chip, IconButton, Tooltip } from "@mui/material";

const SOURCE_LABELS = { import: "Import", manual: "Manual", system: "System" };

const CHIP_SX = { color: "white", borderColor: "rgba(255,255,255,0.3)" };

// Posted entries are never edited or deleted. An entry that hasn't been
// reversed, and isn't a reversal itself, can be reversed.
export default function EntryActions({ entry, onReverse }) {
  const canReverse = entry.reversedById === null && entry.reversesId === null;

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
      <Chip size="small" variant="outlined" label={SOURCE_LABELS[entry.source]} sx={CHIP_SX} />
      {entry.reversesId !== null && (
        <Chip size="small" variant="outlined" label={`Reverses #${entry.reversesId}`} sx={CHIP_SX} />
      )}
      {entry.reversedById !== null && (
        <Chip size="small" variant="outlined" label={`Reversed by #${entry.reversedById}`} sx={CHIP_SX} />
      )}
      {canReverse && (
        <Tooltip title="Reverse">
          <IconButton size="small" onClick={() => onReverse(entry)} aria-label={`reverse entry ${entry.id}`}>
            <UndoIcon sx={{ fill: "white" }} fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
