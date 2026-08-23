import knex from "./dbConnection.js";
import fastcsv from "fast-csv";

// Resolves with the CSV as a string - the route handler sends it as the HTTP
// response body (Content-Disposition: attachment) so the browser downloads
// it directly. Previously this wrote to a path derived from the Windows
// USERPROFILE env var, which doesn't exist in the Docker container at all
// (never passed through in docker-compose.yaml) - exports were silently
// landing in the container's own filesystem and vanishing on recreate. This
// also makes exports host-independent, which matters once the backend runs
// on the homelab server instead of this machine (see SERVER_MIGRATION.md).
function exportCSV(month, year) {
  return knex("monthly_expenses")
    .select("*")
    .where({ month, year })
    .then((data) => {
      const jsonData = JSON.parse(JSON.stringify(data));
      return fastcsv.writeToString(jsonData, { headers: true });
    });
}

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

export { exportCSV, postNote, getNotes, deleteNote, deleteNotes };
