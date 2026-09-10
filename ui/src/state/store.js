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
import uiReducer from "./uiSlice";

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
    ui: uiReducer,
  },
});

export default store;
