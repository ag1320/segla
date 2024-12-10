//npx knex migrate:up <filename>

exports.up = function (knex) {
    return knex.schema.createTable("crypto", async (table) => {
      table.increments("crypto_id"); //adds an auto icrementing primary key
      table.string("ticker").unique(); //initialize only
      table.string("name"); //initialize only
      table.string('asset'); //initialize only
      table.boolean('staked') //update manual
      table.float('totalShares',8,4); //update manual
      table.decimal("marketPrice",8,2); //update auto
      table.decimal('realizedGains',10,2) //updates manual
      table.string('detailedAsset'); //update manual from user
      table.timestamps(true, true); //adds created_at and updated_at
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTableIfExists("crypto");
  };