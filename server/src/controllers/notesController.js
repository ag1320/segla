import knex from "./dbConnection.js";
import fastcsv from "fast-csv";
import fs from "fs";
import path from "path";
import os from "os";

function windowsDocsPath(fileName) {
  const winProfile = process.env.USERPROFILE;
  if (winProfile) {
    const wslPath = winProfile
      .replace(/\\/g, "/")
      .replace(/^([A-Za-z]):/, (_, d) => `/mnt/${d.toLowerCase()}`);
    return path.join(wslPath, "Documents", fileName);
  }
  return path.join(os.homedir(), fileName);
}

function exportCSV(month, year) {
  let fileName = `Budget-${month}-${year}.csv`;
  const ws = fs.createWriteStream(windowsDocsPath(fileName));
  return knex("monthly_expenses")
    .select("*")
    .where({ month, year })
    .then((data) => {
      const jsonData = JSON.parse(JSON.stringify(data));
      fastcsv
        .write(jsonData, { headers: true })

        .on("finish", function () {
          console.log(`Postgres table exported to CSV file successfully.`);
        })

        .pipe(ws);
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
