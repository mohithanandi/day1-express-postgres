import express from "express";
import { query } from "../db.js";

const router = express.Router();

// CREATE
router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const result = await query(
      "INSERT INTO items (name, description) VALUES ($1, $2) RETURNING *",
      [name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// READ ALL
router.get("/", async (req, res) => {
  try {
    const result = await query("SELECT * FROM items ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// READ ONE
router.get("/:id", async (req, res) => {
  try {
    const result = await query("SELECT * FROM items WHERE id=$1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const result = await query(
      "UPDATE items SET name=COALESCE($1,name), description=COALESCE($2,description) WHERE id=$3 RETURNING *",
      [name, description, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query("DELETE FROM items WHERE id=$1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted", item: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;