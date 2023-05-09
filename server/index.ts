import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import sqlite3 from "sqlite3";

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

const db = new sqlite3.Database("./server/presets.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the in-memory SQLite database.");
});

// Create the table
db.run(`CREATE TABLE IF NOT EXISTS presets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  temperature REAL NOT NULL,
  max_tokens INTEGER NOT NULL,
  top_p REAL NOT NULL,
  presence_penalty REAL NOT NULL,
  frequency_penalty REAL NOT NULL,
  n INTEGER NOT NULL,
  systemMessage TEXT NOT NULL
)`);

app.get("/", (req, res) => {
  res.send("Hello from the SQLite Express server!");
});

// Add a new preset
app.post("/presets", (req, res) => {
  const {
    name,
    model,
    temperature,
    max_tokens,
    top_p,
    presence_penalty,
    frequency_penalty,
    n,
    systemMessage,
  } = req.body;

  const sql = `INSERT INTO presets (name, model, temperature, max_tokens, top_p, presence_penalty, frequency_penalty, n, systemMessage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    name,
    model,
    temperature,
    max_tokens,
    top_p,
    presence_penalty,
    frequency_penalty,
    n,
    systemMessage,
  ];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: "Device added successfully", id: this.lastID });
  });
});

// Get all presets
app.get("/presets", (req, res) => {
  const sql = "SELECT id, name FROM presets";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get a single preset by id
app.get("/presets/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM presets WHERE id = ?";
  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ message: "Preset not found" });
    }
  });
});

// Update an existing preset
app.put("/presets/:id", (req, res) => {
  const id = req.params.id;
  const {
    name,
    model,
    temperature,
    max_tokens,
    top_p,
    presence_penalty,
    frequency_penalty,
    n,
    systemMessage,
  } = req.body;

  const sql = `UPDATE presets SET name = ?, model = ?, temperature = ?, max_tokens = ?, top_p = ?, presence_penalty = ?, frequency_penalty = ?, n = ?, systemMessage = ? WHERE id = ?`;
  const params = [
    name,
    model,
    temperature,
    max_tokens,
    top_p,
    presence_penalty,
    frequency_penalty,
    n,
    systemMessage,
    id,
  ];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (this.changes > 0) {
      res.json({
        message: "Preset updated successfully",
        changes: this.changes,
      });
    } else {
      res.status(404).json({ message: "Preset not found" });
    }
  });
});

// Delete a preset by id
app.delete("/presets/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM presets WHERE id = ?";

  db.run(sql, [id], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (this.changes > 0) {
      res.json({ message: "Preset deleted successfully", id: id });
    } else {
      res.status(404).json({ message: "Preset not found" });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Close the database connection when the server is terminated
process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("SQLite database connection closed.");
  });
  process.exit(0);
});
