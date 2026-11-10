import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchBusinessTrialBalance,
  fetchBusinessGeneralLedger,
  fetchBusinessProfitAndLoss,
  fetchBusinessBalanceSheet,
  fetchBusinessCashFlow,
  fetchBusinessOwnersEquity,
  fetchBusinessRentRoll,
  fetchBusinessOperatingStatement,
  fetchBusinessScheduleE,
  fetchBusiness1099Candidates,
  fetchBusinessStartupCosts,
  serverErrorMessage,
} from "../utilities/serverCalls";
import { toLease } from "./businessLeasesSlice";

// A P&L or balance sheet section: account rows plus totals. Computed equity
// lines (net income) have a null accountId.
const toSection = (section) => ({
  rows: section.rows.map((row) => ({
    key: row.account_id ?? row.name,
    accountNumber: row.account_number,
    name: row.name,
    amountCents: row.amount_cents,
    compareAmountCents: row.compare_amount_cents,
  })),
  totalCents: section.total_cents,
  compareTotalCents: section.compare_total_cents,
});

const toAccountColumns = (row) => ({
  accountId: row.account_id,
  accountNumber: row.account_number,
  name: row.name,
  type: row.account_type,
});

// query: { entityId, asOfDate }
export const loadBusinessTrialBalance = createAsyncThunk(
  "businessReports/loadBusinessTrialBalance",
  async (query, { rejectWithValue }) => {
    try {
      const data = await fetchBusinessTrialBalance(query);
      return {
        asOfDate: data.as_of_date,
        rows: data.rows.map((row) => ({
          ...toAccountColumns(row),
          debitCents: row.debit_cents,
          creditCents: row.credit_cents,
        })),
        totalDebitCents: data.total_debit_cents,
        totalCreditCents: data.total_credit_cents,
      };
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// query: { entityId, from, to }
export const loadBusinessGeneralLedger = createAsyncThunk(
  "businessReports/loadBusinessGeneralLedger",
  async (query, { rejectWithValue }) => {
    try {
      const data = await fetchBusinessGeneralLedger(query);
      return {
        from: data.from,
        to: data.to,
        accounts: data.accounts.map((account) => ({
          ...toAccountColumns(account),
          openingBalanceCents: account.opening_balance_cents,
          closingBalanceCents: account.closing_balance_cents,
          lines: account.lines.map((line) => ({
            id: line.journal_line_id,
            journalEntryId: line.journal_entry_id,
            entryDate: line.entry_date,
            memo: line.memo,
            source: line.source,
            debitCents: line.debit_cents,
            creditCents: line.credit_cents,
            balanceCents: line.balance_cents,
          })),
        })),
      };
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// query: { entityId, from, to, compareFrom, compareTo, propertyId }
export const loadBusinessProfitAndLoss = createAsyncThunk(
  "businessReports/loadBusinessProfitAndLoss",
  async (query, { rejectWithValue }) => {
    try {
      const data = await fetchBusinessProfitAndLoss(query);
      return {
        from: data.from,
        to: data.to,
        compareFrom: data.compare_from,
        compareTo: data.compare_to,
        income: toSection(data.income),
        expenses: toSection(data.expenses),
        netIncomeCents: data.net_income_cents,
        compareNetIncomeCents: data.compare_net_income_cents,
      };
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// query: { entityId, asOfDate, compareAsOfDate }
export const loadBusinessBalanceSheet = createAsyncThunk(
  "businessReports/loadBusinessBalanceSheet",
  async (query, { rejectWithValue }) => {
    try {
      const data = await fetchBusinessBalanceSheet(query);
      return {
        asOfDate: data.as_of_date,
        compareAsOfDate: data.compare_as_of_date,
        assets: toSection(data.assets),
        liabilities: toSection(data.liabilities),
        equity: toSection(data.equity),
        totalLiabilitiesAndEquityCents: data.total_liabilities_and_equity_cents,
        compareTotalLiabilitiesAndEquityCents: data.compare_total_liabilities_and_equity_cents,
      };
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// query: { entityId, from, to }
export const loadBusinessCashFlow = createAsyncThunk(
  "businessReports/loadBusinessCashFlow",
  async (query, { rejectWithValue }) => {
    try {
      const data = await fetchBusinessCashFlow(query);
      return {
        from: data.from,
        to: data.to,
        operating: toSection(data.operating),
        investing: toSection(data.investing),
        financing: toSection(data.financing),
        netChangeCents: data.net_change_cents,
        openingCashCents: data.opening_cash_cents,
        closingCashCents: data.closing_cash_cents,
      };
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// query: { entityId, from, to }
export const loadBusinessOwnersEquity = createAsyncThunk(
  "businessReports/loadBusinessOwnersEquity",
  async (query, { rejectWithValue }) => {
    try {
      const data = await fetchBusinessOwnersEquity(query);
      return {
        from: data.from,
        to: data.to,
        openingEquityCents: data.opening_equity_cents,
        changes: data.changes.map((row) => ({
          accountId: row.account_id,
          accountNumber: row.account_number,
          name: row.name,
          amountCents: row.amount_cents,
        })),
        netIncomeCents: data.net_income_cents,
        closingEquityCents: data.closing_equity_cents,
      };
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// query: { entityId, asOfDate }
export const loadBusinessRentRoll = createAsyncThunk(
  "businessReports/loadBusinessRentRoll",
  async (query, { rejectWithValue }) => {
    try {
      const data = await fetchBusinessRentRoll(query);
      return {
        asOfDate: data.as_of_date,
        rows: data.rows.map((row) => ({
          propertyId: row.property_id,
          name: row.name,
          isVacant: row.is_vacant,
          leases: row.leases.map(toLease),
          monthlyRentCents: row.monthly_rent_cents,
          depositsOnLeasesCents: row.deposits_on_leases_cents,
          depositsHeldCents: row.deposits_held_cents,
        })),
        monthlyRentCents: data.monthly_rent_cents,
        depositsOnLeasesCents: data.deposits_on_leases_cents,
        depositsHeldCents: data.deposits_held_cents,
      };
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

const toAccountLine = (line) => ({
  accountId: line.account_id,
  accountNumber: line.account_number,
  name: line.name,
  amountCents: line.amount_cents,
});

// query: { propertyId, from, to }
export const loadBusinessOperatingStatement = createAsyncThunk(
  "businessReports/loadBusinessOperatingStatement",
  async (query, { rejectWithValue }) => {
    try {
      const data = await fetchBusinessOperatingStatement(query);
      return {
        propertyId: data.property_id,
        from: data.from,
        to: data.to,
        grossPotentialRentCents: data.gross_potential_rent_cents,
        vacancyCents: data.vacancy_cents,
        uncollectedRentCents: data.uncollected_rent_cents,
        rentCollectedCents: data.rent_collected_cents,
        otherIncome: data.other_income.map(toAccountLine),
        effectiveGrossIncomeCents: data.effective_gross_income_cents,
        operatingExpenses: data.operating_expenses.map(toAccountLine),
        operatingExpensesCents: data.operating_expenses_cents,
        noiCents: data.noi_cents,
        interestCents: data.interest_cents,
        principalCents: data.principal_cents,
        cashFlowCents: data.cash_flow_cents,
        capexCents: data.capex_cents,
        cashFlowAfterCapexCents: data.cash_flow_after_capex_cents,
        kpis: {
          physicalOccupancy: data.kpis.physical_occupancy,
          economicOccupancy: data.kpis.economic_occupancy,
          expenseRatio: data.kpis.expense_ratio,
          dscr: data.kpis.dscr,
          capRate: data.kpis.cap_rate,
        },
      };
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// query: { entityId, taxYear, allocation }
export const loadBusinessScheduleE = createAsyncThunk(
  "businessReports/loadBusinessScheduleE",
  async (query, { rejectWithValue }) => {
    try {
      const data = await fetchBusinessScheduleE(query);
      return {
        taxYear: data.tax_year,
        allocation: data.allocation,
        columns: data.columns.map((column) => ({
          propertyId: column.property_id,
          name: column.name,
          daysInService: column.days_in_service,
          fairRentalDays: column.fair_rental_days,
        })),
        lines: data.lines.map((line) => ({ line: line.line, label: line.label, amounts: line.amounts })),
        totalExpenses: data.total_expenses,
        incomeOrLoss: data.income_or_loss,
        notOnScheduleE: data.not_on_schedule_e.map((item) => ({
          ...toAccountLine(item),
          propertyId: item.property_id,
          propertyName: item.property_name,
          reason: item.reason,
        })),
      };
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// query: { entityId, taxYear }
export const loadBusiness1099Candidates = createAsyncThunk(
  "businessReports/loadBusiness1099Candidates",
  async (query, { rejectWithValue }) => {
    try {
      const data = await fetchBusiness1099Candidates(query);
      return {
        taxYear: data.tax_year,
        thresholdCents: data.threshold_cents,
        rows: data.rows.map((row) => ({
          vendorId: row.vendor_id,
          name: row.name,
          cardCents: row.card_cents,
          bankCents: row.bank_cents,
          personalCents: row.personal_cents,
          reportableCents: row.reportable_cents,
          needs1099: row.needs_1099,
          hasW9OnFile: row.has_w9_on_file,
          w9Location: row.w9_location,
        })),
      };
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

// query: { entityId, asOfDate }
export const loadBusinessStartupCosts = createAsyncThunk(
  "businessReports/loadBusinessStartupCosts",
  async (query, { rejectWithValue }) => {
    try {
      const data = await fetchBusinessStartupCosts(query);
      return {
        asOfDate: data.as_of_date,
        totalCents: data.total_cents,
        rows: data.rows.map((row) => ({
          propertyId: row.property_id,
          propertyName: row.property_name,
          placedInServiceDate: row.placed_in_service_date,
          totalCents: row.total_cents,
          lines: row.lines.map((line) => ({
            id: line.journal_line_id,
            entryId: line.journal_entry_id,
            entryDate: line.entry_date,
            memo: line.memo,
            vendorName: line.vendor_name,
            amountCents: line.amount_cents,
            needsCpaReview: line.needs_cpa_review,
          })),
        })),
      };
    } catch (err) {
      return rejectWithValue(serverErrorMessage(err));
    }
  }
);

const storeReport = (key) => (state, action) => {
  state[key] = action.payload;
  state.error = null;
};
const storeError = (state, action) => {
  state.error = action.payload;
};

const businessReportsSlice = createSlice({
  name: "businessReports",
  initialState: {
    trialBalance: null,
    generalLedger: null,
    profitAndLoss: null,
    balanceSheet: null,
    cashFlow: null,
    ownersEquity: null,
    rentRoll: null,
    operatingStatement: null,
    scheduleE: null,
    candidates1099: null,
    startupCosts: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBusinessTrialBalance.fulfilled, (state, action) => {
        state.trialBalance = action.payload;
        state.error = null;
      })
      .addCase(loadBusinessTrialBalance.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(loadBusinessGeneralLedger.fulfilled, (state, action) => {
        state.generalLedger = action.payload;
        state.error = null;
      })
      .addCase(loadBusinessGeneralLedger.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(loadBusinessProfitAndLoss.fulfilled, storeReport("profitAndLoss"))
      .addCase(loadBusinessProfitAndLoss.rejected, storeError)
      .addCase(loadBusinessBalanceSheet.fulfilled, storeReport("balanceSheet"))
      .addCase(loadBusinessBalanceSheet.rejected, storeError)
      .addCase(loadBusinessCashFlow.fulfilled, storeReport("cashFlow"))
      .addCase(loadBusinessCashFlow.rejected, storeError)
      .addCase(loadBusinessOwnersEquity.fulfilled, storeReport("ownersEquity"))
      .addCase(loadBusinessOwnersEquity.rejected, storeError)
      .addCase(loadBusinessRentRoll.fulfilled, storeReport("rentRoll"))
      .addCase(loadBusinessRentRoll.rejected, storeError)
      .addCase(loadBusinessOperatingStatement.fulfilled, storeReport("operatingStatement"))
      .addCase(loadBusinessOperatingStatement.rejected, storeError)
      .addCase(loadBusinessScheduleE.fulfilled, storeReport("scheduleE"))
      .addCase(loadBusinessScheduleE.rejected, storeError)
      .addCase(loadBusiness1099Candidates.fulfilled, storeReport("candidates1099"))
      .addCase(loadBusiness1099Candidates.rejected, storeError)
      .addCase(loadBusinessStartupCosts.fulfilled, storeReport("startupCosts"))
      .addCase(loadBusinessStartupCosts.rejected, storeError);
  },
});

export default businessReportsSlice.reducer;
