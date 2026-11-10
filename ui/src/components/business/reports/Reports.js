import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import { Alert, Box } from "@mui/material";
import { loadBusinessEntities } from "../../../state/businessEntitiesSlice";
import BusinessTabs from "../BusinessTabs";
import TrialBalance from "./TrialBalance";
import GeneralLedger from "./GeneralLedger";
import ProfitAndLoss from "./ProfitAndLoss";
import BalanceSheet from "./BalanceSheet";
import CashFlow from "./CashFlow";
import OwnersEquity from "./OwnersEquity";
import RentRoll from "./RentRoll";
import OperatingStatement from "./OperatingStatement";
import CapexReserve from "./CapexReserve";
import ScheduleE from "./ScheduleE";
import Candidates1099 from "./Candidates1099";
import StartupCosts from "./StartupCosts";
import "./reportPrint.css";

const REPORT_TABS = [
  { label: "Profit & Loss", path: "/business/reports/profit-and-loss" },
  { label: "Balance Sheet", path: "/business/reports/balance-sheet" },
  { label: "Cash Flow", path: "/business/reports/cash-flow" },
  { label: "Owner's Equity", path: "/business/reports/owners-equity" },
  { label: "Rent Roll", path: "/business/reports/rent-roll" },
  { label: "Property NOI", path: "/business/reports/operating-statement" },
  { label: "CapEx Reserve", path: "/business/reports/capex-reserve" },
  { label: "Schedule E", path: "/business/reports/schedule-e" },
  { label: "1099s", path: "/business/reports/1099-candidates" },
  { label: "Startup Costs", path: "/business/reports/startup-costs" },
  { label: "Trial Balance", path: "/business/reports/trial-balance" },
  { label: "General Ledger", path: "/business/reports/general-ledger" },
];

export default function Reports() {
  const dispatch = useDispatch();
  const entityId = useSelector((state) => state.businessEntities.items[0]?.id);
  const error = useSelector((state) => state.businessReports.error);

  useEffect(() => {
    dispatch(loadBusinessEntities());
  }, [dispatch]);

  return (
    <>
      <BusinessTabs tabs={REPORT_TABS} />
      <Box className="print-area" sx={{ mt: 2 }}>
        {error && <Alert className="no-print" severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {entityId && (
          <Routes>
            <Route index element={<Navigate to="/business/reports/profit-and-loss" replace />} />
            <Route path="profit-and-loss" element={<ProfitAndLoss entityId={entityId} />} />
            <Route path="balance-sheet" element={<BalanceSheet entityId={entityId} />} />
            <Route path="cash-flow" element={<CashFlow entityId={entityId} />} />
            <Route path="owners-equity" element={<OwnersEquity entityId={entityId} />} />
            <Route path="rent-roll" element={<RentRoll entityId={entityId} />} />
            <Route path="operating-statement" element={<OperatingStatement />} />
            <Route path="capex-reserve" element={<CapexReserve entityId={entityId} />} />
            <Route path="schedule-e" element={<ScheduleE entityId={entityId} />} />
            <Route path="1099-candidates" element={<Candidates1099 entityId={entityId} />} />
            <Route path="startup-costs" element={<StartupCosts entityId={entityId} />} />
            <Route path="trial-balance" element={<TrialBalance entityId={entityId} />} />
            <Route path="general-ledger" element={<GeneralLedger entityId={entityId} />} />
          </Routes>
        )}
      </Box>
    </>
  );
}
