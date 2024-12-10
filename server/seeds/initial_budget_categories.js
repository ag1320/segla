
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('budget_categories').del()
    .then(function () {
      // Inserts seed entries
      return knex('budget_categories').insert([
        {category: 'Eating Out', warning: 50, limit: 100},
        {category: 'Groceries', warning: 600, limit: 700},
        {category: 'Gas', warning: 350, limit: 400},
        {category: 'Utilities', subcategory: 'Gas', warning: 100, limit: 150},
        {category: 'Utilities', subcategory: 'Water', warning: 100, limit: 130},
        {category: 'Utilities', subcategory: 'Electric', warning: 50, limit: 70},
        {category: 'Pet', warning: 200, limit: 250},
        {category: 'Gifts', warning: 200, limit: 250},
        {category: 'Entertainment', warning: 50, limit: 100},
        {category: 'Travel', warning: 100, limit: 500},
        {category: 'Shopping', warning: 200, limit: 250},
        {category: 'House Repair', warning: 100, limit: 150},
        {category: 'Childcare', warning: 500, limit: 700},
        {category: 'Emergency', warning: 0, limit: 0},
      ]);
    });
};