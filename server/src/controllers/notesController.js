import knex from "./dbConnection.js";

function postNote(title, details, month, year) {
  return knex("notes")
    .insert({ title, details, month, year })
    .then((data) => data);
}

function getNotes(month, year) {
  return knex("notes")
    .select("*")
    .where({ month, year })
    .then((data) => data);
}

function deleteNote(note_id) {
  return knex("notes")
    .del("*")
    .where({ note_id })
    .then((data) => data);
}

function deleteNotes(month, year) {
  return knex("notes")
    .del("*")
    .where({ month, year })
    .then((data) => data);
}

export { postNote, getNotes, deleteNote, deleteNotes };
