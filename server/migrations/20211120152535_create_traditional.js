//npx knex migrate:up <filename>

exports.up = function (knex) {
    return knex.schema.createTable("traditional", async (table) => {
      table.increments("traditional_id"); //adds an auto icrementing primary key
      table.string("ticker").unique(); //update manual from user
      table.string("name"); //initialize only from yahoo
      table.string('asset'); //update manual from user
      table.string('detailedAsset'); //update manual from user
      table.string('description'); //update manual from user
      table.float('totalShares',8,4); //update manual from user
      table.decimal("marketPrice",8,2); //update auto from yahoo
      table.float('expenseRatio',2,3); //initialize only from user
      table.timestamps(true, true); //adds created_at and updated_at
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTableIfExists("traditional");
  }
  