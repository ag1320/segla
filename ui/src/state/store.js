import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import vanguardRetirementReducer from "./vanguardRetirementSlice";
import tspReducer from "./tspSlice";
import vanguardBrokerageReducer from "./vanguardBrokerageSlice";
import pa529Reducer from "./pa529Slice";
import cryptoReducer from "./cryptoSlice";
import baskReducer from "./baskSlice";
import loansReducer from "./loansSlice";
import equityReducer from "./equitySlice";
import budgetReducer from "./budgetSlice";
import fixedExpensesReducer from "./fixedExpensesSlice";
import fixedIncomeReducer from "./fixedIncomeSlice";
import monthlyIncomeReducer from "./monthlyIncomeSlice";
import monthlyExpensesReducer from "./monthlyExpensesSlice";
import budgetCategoriesReducer from "./budgetCategoriesSlice";
import monthEndDistributionsReducer from "./monthEndDistributionsSlice";
import notesReducer from "./notesSlice";
import reportsReducer from "./reportsSlice";
import netWorthReducer from "./netWorthSlice";
import uiReducer from "./uiSlice";
import businessEntitiesReducer from "./businessEntitiesSlice";
import businessAccountsReducer from "./businessAccountsSlice";
import businessPropertiesReducer from "./businessPropertiesSlice";
import businessPropertyValuationsReducer from "./businessPropertyValuationsSlice";
import businessMortgagesReducer from "./businessMortgagesSlice";
import businessFixedAssetsReducer from "./businessFixedAssetsSlice";
import businessLeasesReducer from "./businessLeasesSlice";
import businessCapexReducer from "./businessCapexSlice";
import businessDealsReducer from "./businessDealsSlice";
import businessYearClosingsReducer from "./businessYearClosingsSlice";
import businessMarketEquityReducer from "./businessMarketEquitySlice";
import businessDashboardReducer from "./businessDashboardSlice";
import businessJournalEntriesReducer from "./businessJournalEntriesSlice";
import businessBankAccountsReducer from "./businessBankAccountsSlice";
import businessBankTransactionsReducer from "./businessBankTransactionsSlice";
import businessVendorsReducer from "./businessVendorsSlice";
import businessRulesReducer from "./businessRulesSlice";
import businessReconciliationsReducer from "./businessReconciliationsSlice";
import businessPeriodLocksReducer from "./businessPeriodLocksSlice";
import businessReportsReducer from "./businessReportsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vanguardRetirement: vanguardRetirementReducer,
    tsp: tspReducer,
    vanguardBrokerage: vanguardBrokerageReducer,
    pa529: pa529Reducer,
    crypto: cryptoReducer,
    bask: baskReducer,
    loans: loansReducer,
    equity: equityReducer,
    budget: budgetReducer,
    fixedExpenses: fixedExpensesReducer,
    fixedIncome: fixedIncomeReducer,
    monthlyIncome: monthlyIncomeReducer,
    monthlyExpenses: monthlyExpensesReducer,
    budgetCategories: budgetCategoriesReducer,
    monthEndDistributions: monthEndDistributionsReducer,
    notes: notesReducer,
    reports: reportsReducer,
    netWorth: netWorthReducer,
    ui: uiReducer,
    businessEntities: businessEntitiesReducer,
    businessAccounts: businessAccountsReducer,
    businessProperties: businessPropertiesReducer,
    businessPropertyValuations: businessPropertyValuationsReducer,
    businessMortgages: businessMortgagesReducer,
    businessFixedAssets: businessFixedAssetsReducer,
    businessLeases: businessLeasesReducer,
    businessCapex: businessCapexReducer,
    businessDeals: businessDealsReducer,
    businessYearClosings: businessYearClosingsReducer,
    businessMarketEquity: businessMarketEquityReducer,
    businessDashboard: businessDashboardReducer,
    businessJournalEntries: businessJournalEntriesReducer,
    businessBankAccounts: businessBankAccountsReducer,
    businessBankTransactions: businessBankTransactionsReducer,
    businessVendors: businessVendorsReducer,
    businessRules: businessRulesReducer,
    businessReconciliations: businessReconciliationsReducer,
    businessPeriodLocks: businessPeriodLocksReducer,
    businessReports: businessReportsReducer,
  },
});

export default store;
