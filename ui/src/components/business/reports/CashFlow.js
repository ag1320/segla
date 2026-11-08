import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box } from "@mui/material";
import { loadBusinessCashFlow } from "../../../state/businessReportsSlice";
import StatementTable from "./StatementTable";
import PeriodFields from "./PeriodFields";
import ReportActions from "./ReportActions";
import PrintHeader from "./PrintHeader";
import { statementCsvRows } from "./reportCsv";
import { presetPeriod } from "./reportPeriods";
import { formatDate } from "../businessFormat";

const defaultPeriod = () => ({ preset: "yearToDate", ...presetPeriod("yearToDate") });

// Where cash came from and went: running the rental (operating), buying
// or improving property (investing), and the mortgage and owner money
// (financing). A card charge shows up here only when the card is paid.
export default function CashFlow({ entityId }) {
  const dispatch = useDispatch();
  const cashFlow = useSelector((state) => state.businessReports.cashFlow);
  const [period, setPeriod] = useState(defaultPeriod);

  useEffect(() => {
    const { from, to } = defaultPeriod();
    dispatch(loadBusinessCashFlow({ entityId, from, to }));
  }, [dispatch, entityId]);

  const handlePeriod = (next) => {
    setPeriod(next);
    if (next.from && next.to) dispatch(loadBusinessCashFlow({ entityId, from: next.from, to: next.to }));
  };

  const subtitle = cashFlow ? `${formatDate(cashFlow.from)} – ${formatDate(cashFlow.to)}` : "";
  const statement = cashFlow && {
    columnLabels: [subtitle],
    sections: [
      { title: "Operating", totalLabel: "Net cash from operating", section: cashFlow.operating },
      { title: "Investing", totalLabel: "Net cash from investing", section: cashFlow.investing },
      { title: "Financing", totalLabel: "Net cash from financing", section: cashFlow.financing },
    ],
    summaryRows: [
      { label: "Net change in cash", cents: cashFlow.netChangeCents },
      { label: `Cash on ${formatDate(cashFlow.from)} (start)`, cents: cashFlow.openingCashCents },
      { label: `Cash on ${formatDate(cashFlow.to)} (end)`, cents: cashFlow.closingCashCents },
    ],
  };

  return (
    <>
      <Box className="no-print" sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 2 }}>
        <PeriodFields value={period} onChange={handlePeriod} />
        {statement && (
          <ReportActions
            title="Statement of Cash Flows"
            subtitle={subtitle}
            fileName={`cash-flow_${cashFlow.from}_${cashFlow.to}.csv`}
            getCsvRows={() => statementCsvRows(statement)}
          />
        )}
      </Box>
      {statement && (
        <>
          <PrintHeader title="Statement of Cash Flows" subtitle={subtitle} />
          <StatementTable {...statement} />
        </>
      )}
    </>
  );
}
