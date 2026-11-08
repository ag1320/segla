import knex from "../dbConnection.js";

function findRules(trx = knex) {
  return trx("rules").orderByRaw("lower(description_pattern)");
}

function findRule(ruleId, trx = knex) {
  return trx("rules").where({ rule_id: ruleId }).first();
}

// Patterns are unique ignoring case, matching the rules table's index.
function findRuleByPattern(descriptionPattern, trx = knex) {
  return trx("rules")
    .whereRaw("lower(description_pattern) = lower(?)", [descriptionPattern])
    .first();
}

async function insertRule(rule, trx = knex) {
  const [inserted] = await trx("rules").insert(rule).returning("*");
  return inserted;
}

async function updateRule(ruleId, changes, trx = knex) {
  const [updated] = await trx("rules")
    .where({ rule_id: ruleId })
    .update({ ...changes, updated_at: knex.fn.now() })
    .returning("*");
  return updated;
}

function deleteRule(ruleId, trx = knex) {
  return trx("rules").where({ rule_id: ruleId }).delete();
}

export {
  findRules,
  findRule,
  findRuleByPattern,
  insertRule,
  updateRule,
  deleteRule,
};
