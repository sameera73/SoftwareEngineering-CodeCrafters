const { router, getDatabaseInstance } = require("../requires");

// GET: Read all warehouses
router.get("/warehouses", (req, res) => {
  const { orgId } = req.body;
  const db = getDatabaseInstance(orgId);
  db.all("SELECT * FROM warehouses", [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: rows,
    });
  });
});

// POST: Create a new warehouse
router.post("/warehouses", (req, res) => {
  const { orgId, name, address } = req.body;
  const db = getDatabaseInstance(orgId);
  const sql = "INSERT INTO warehouses (name, address) VALUES (?,?)";
  const params = [name, address];
  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      id: this.lastID,
    });
  });
});

// PUT: Update a warehouse
router.put("/warehouses/:id", (req, res) => {
  const { orgId, name, address } = req.body;
  const db = getDatabaseInstance(orgId);
  const sql = `
    UPDATE warehouses
    SET name = ?, address = ?
    WHERE id = ?
  `;
  const params = [name, address, req.params.id];
  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "updated",
      data: this.changes,
    });
  });
});

// DELETE: Delete a warehouse
router.delete("/warehouses/:id", (req, res) => {
  const { orgId } = req.body;
  const db = getDatabaseInstance(orgId);
  db.run("DELETE FROM warehouses WHERE id = ?", req.params.id, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: "deleted", rows: this.changes });
  });
});

module.exports = router;
