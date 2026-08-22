import knex from "./dbConnection.js";

function getReportData(startDateString, endDateString, formattedCategories) {
  const categories = formattedCategories.map((cat) => JSON.parse(cat));
  const mainCategories = categories
    .filter((cat) => cat.category !== "Utilities")
    .map((cat) => cat.category);
  const subcategories = categories
    .filter((cat) => cat.subcategory !== null)
    .map((cat) => cat.subcategory);

  return knex("monthly_expenses")
    .join("budget_categories_snapshot", function () {
      this.on(
        "monthly_expenses.category_id",
        "=",
        "budget_categories_snapshot.budget_categories_snapshot_id",
      );
    })
    .select(
      "monthly_expenses.amount",
      "monthly_expenses.month",
      "monthly_expenses.year",
      "budget_categories_snapshot.category",
      "budget_categories_snapshot.subcategory",
    )
    .whereBetween(
      knex.raw(
        "TO_DATE(CONCAT(monthly_expenses.month, ' ', monthly_expenses.year), 'Month YYYY')",
      ),
      [startDateString, endDateString],
    )
    .where(function () {
      this.whereIn(
        "budget_categories_snapshot.category",
        mainCategories,
      ).orWhereIn("budget_categories_snapshot.subcategory", subcategories);
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error("Error executing query:", error);
      throw error;
    });
}

function getReportDataTotal(startDateString, endDateString) {
  return knex("monthly_expenses")
    .select(
      "monthly_expenses.amount",
      "monthly_expenses.month",
      "monthly_expenses.year",
      "monthly_expenses.type",
    )
    .whereBetween(
      knex.raw(
        "TO_DATE(CONCAT(monthly_expenses.month, ' ', monthly_expenses.year), 'Month YYYY')",
      ),
      [startDateString, endDateString],
    )
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error("Error executing query:", error);
      throw error;
    });
}

function getReportDataWarningsAndLimits(
  startDateString,
  endDateString,
  formattedCategories,
) {
  const categories = formattedCategories.map((cat) => JSON.parse(cat));
  const mainCategories = categories
    .filter((cat) => cat.category !== "Utilities")
    .map((cat) => cat.category);
  const subcategories = categories
    .filter((cat) => cat.subcategory !== null)
    .map((cat) => cat.subcategory);

  return knex("budget_categories_snapshot")
    .select("category", "subcategory", "month", "year", "limit", "warning")
    .whereBetween(knex.raw("TO_DATE(CONCAT(month, ' ', year), 'Month YYYY')"), [
      startDateString,
      endDateString,
    ])
    .whereIn("category", mainCategories)
    .orWhereIn("subcategory", subcategories)
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error("Error executing query:", error);
      throw error;
    });
}

export { getReportData, getReportDataTotal, getReportDataWarningsAndLimits };
