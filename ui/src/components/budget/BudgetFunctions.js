import axios from 'axios'

export function checkBudget(month, year) {
  let url = 'http://localhost:3001/budget/check'
  let payload = {
    month,
    year,
  };
  async function postData(url) {
    let res = await axios.post(url, payload);
    return res.data;
  }
  let data = postData(url);
  return data;
}

export function postBudgetSeed(fixedExpenses, fixedIncome, month, year, currentBudgetCategories) {
  let url = 'http://localhost:3001/budget'
  let payload = {
    fixedExpenses,
    fixedIncome,
    month,
    year,
    currentBudgetCategories
  };
  async function postData(url, payload) {
    let res = await axios.post(url, payload);
    return res.data;
  }
  let data = postData(url, payload);
  return data;
}
