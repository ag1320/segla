export function formatFixedExpenses(fixedExpenses) {
  //creates a set of unique categories
  //then, populates the amounts for aaron and jen, otherwise 0
  let rows = [];
  let categorySet = new Set();
  for (let expense of fixedExpenses) {
    categorySet.add(expense.name);
  }
  let categories = Array.from(categorySet);
  function createRow(category, fixedExpenses) {
    let result = {};
    result.category = category;
    result.aaron =
      fixedExpenses.filter((expense) => {
        return expense.name === category && expense.owner === "Aaron";
      })[0]?.amount || 0;
    result.jen =
      fixedExpenses.filter((expense) => {
        return expense.name === category && expense.owner === "Jen";
      })[0]?.amount || 0;
    result.subtotal = result.aaron + result.jen;
    return result;
  }
  for (let category of categories) {
    let row = createRow(category, fixedExpenses);
    rows.push(row);
  }

  return rows;
}

export function formatMonthlyFixedExpense(monthlyFixedExpenses) {
  let rows = [];
  let categorySet = new Set();
  for (let expense of monthlyFixedExpenses){
    let index = expense.category.indexOf('-') - 1
    categorySet.add(expense.category.substring(0,index))
  }
  
  let categories = Array.from(categorySet);
  for (let category of categories){
    let obj = {}
    obj.category = category
    for (let expense of monthlyFixedExpenses){
      let index = expense.category.indexOf('-') - 1
      let expenseCategory = expense.category.substring(0,index)
      let name = expense.category.substring(index + 3)
      if (expenseCategory === category && name === 'Aaron'){
        obj.aaron = expense.amount
      } else if (expenseCategory === category && name === 'Jen'){
        obj.jen = expense.amount
      }
    }
    if (obj.aaron === undefined){
      obj.aaron = 0
    }
    if (obj.jen === undefined){
      obj.jen = 0
    }
    obj.subtotal = obj.aaron + obj.jen
    rows.push(obj)
  }

  return rows;
}