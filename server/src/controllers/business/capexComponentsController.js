import knex from "../dbConnection.js";

// entityId (optional) keeps the components of that entity's properties.
function findCapexComponents({ entityId } = {}, trx = knex) {
  return trx("capex_components")
    .select("capex_components.*")
    .modify((query) => {
      if (entityId) {
        query
          .join("properties", "properties.property_id", "capex_components.property_id")
          .where("properties.entity_id", entityId);
      }
    })
    .orderBy([{ column: "capex_components.property_id" }, { column: "capex_components.name" }]);
}

function findCapexComponent(capexComponentId, trx = knex) {
  return trx("capex_components").where({ capex_component_id: capexComponentId }).first();
}

async function insertCapexComponent(component, trx = knex) {
  const [inserted] = await trx("capex_components").insert(component).returning("*");
  return inserted;
}

async function updateCapexComponent(capexComponentId, changes, trx = knex) {
  const [updated] = await trx("capex_components")
    .where({ capex_component_id: capexComponentId })
    .update({ ...changes, updated_at: knex.fn.now() })
    .returning("*");
  return updated;
}

function deleteCapexComponent(capexComponentId, trx = knex) {
  return trx("capex_components").where({ capex_component_id: capexComponentId }).delete();
}

export {
  findCapexComponents,
  findCapexComponent,
  insertCapexComponent,
  updateCapexComponent,
  deleteCapexComponent,
};
