//npx knex migrate:up <filename>
//CREATE LAST DUE TO FOREIGN KEYS

exports.up = function (knex) {
    return knex.schema.createTable("transactions", async (table) => {
      table.increments("id"); //adds an auto icrementing primary key

      table.date("date");//update manual
      table.float('price', 16,10); //update manual
      table.float('shares',16,10);// update manual
      table.string("order");//update manual
      table.string('comment')
      table.string('owner')
      table.timestamps(true, true); //adds created_at and updated_at

      table.integer('crypto_id')
      table.integer('traditional_id')
      table.foreign('crypto_id').references("crypto.crypto_id");
      table.foreign('traditional_id').references("traditional.traditional_id");
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTableIfExists("transactions");
  };
