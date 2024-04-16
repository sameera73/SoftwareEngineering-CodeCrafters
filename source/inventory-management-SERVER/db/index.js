const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Specify the path to the SQLite file. You can change "database.sqlite" to your desired file name.
const dbPath = path.resolve(__dirname, "main.sqlite");

// Database initialization with file storage
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  }
});

// Create important tables if it doesn't exist
const init = () => {
  // Create Organizations Table
  db.run(`CREATE TABLE IF NOT EXISTS organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )`);

  // Create Users Table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )`);

  // Create Organization_Users Junction Table
  db.run(`CREATE TABLE IF NOT EXISTS organization_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organization_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
};

// Get database instance
const getDatabaseInstance = (name, mainPath = "org/") => {
  const orgDbPath = path.resolve(__dirname, `./${mainPath}${name}.sqlite`);
  const orgDB = new sqlite3.Database(orgDbPath, (err) => {
    if (err) {
      console.error(err.message);
      throw err;
    }
  });
  orgDB.exec("PRAGMA foreign_keys = ON;");
  return orgDB;
};

module.exports = { db, init, getDatabaseInstance };
