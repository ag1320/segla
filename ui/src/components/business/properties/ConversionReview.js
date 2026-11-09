import { Box, Typography } from "@mui/material";
import EntryPreviewTable from "./EntryPreviewTable";
import { formatCents } from "../businessFormat";

// preview: what the conversion will post, from the server.
export default function ConversionReview({ preview }) {
  const basisLabel = preview.basisSource === "adjusted_basis" ? "adjusted basis" : "market value";

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {`Basis ${formatCents(preview.basisCents)} (${basisLabel}) · Land ${formatCents(preview.landCents)} · Building ${formatCents(preview.buildingCents)}`}
      </Typography>
      <EntryPreviewTable lines={preview.lines} />
      <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
        {`Owner contribution: ${formatCents(preview.contributionCents)}`}
      </Typography>
    </Box>
  );
}
