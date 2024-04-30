const { router, getDatabaseInstance } = require("../requires");

// GET: Read all item locations
router.get("/bin-locations", (req, res) => {
  const { orgId } = req.body;
  const db = getDatabaseInstance(orgId);
  db.all("SELECT * FROM item_locations", [], (err, rows) => {
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

// POST: Create a new item location
router.post("/bin-locations", (req, res) => {
  const { orgId, item_id, warehouse_id, bin_location, stock } = req.body;
  const db = getDatabaseInstance(orgId);
  const sql = "INSERT INTO item_locations (item_id, warehouse_id, bin_location, stock) VALUES (?, ?, ?, ?)";
  const params = [item_id, warehouse_id, bin_location, stock];
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

// PUT: Update an item location
router.put("/bin-locations/:id", (req, res) => {
  const { id } = req.params;
  const { orgId, item_id, warehouse_id, bin_location, stock } = req.body;
  const db = getDatabaseInstance(orgId);
  const sql = `
    UPDATE item_locations
    SET bin_location = ?,
    stock = ?
    WHERE id = ?
  `;
  const params = [bin_location, stock, id];
  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "updated",
      changes: this.changes,
    });
  });
});

// DELETE: Delete an item location
router.delete("/bin-locations/:id", (req, res) => {
  const { id } = req.params;
  const { orgId } = req.body;
  const db = getDatabaseInstance(orgId);
  db.run("DELETE FROM item_locations WHERE id = ?", [id], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: "deleted", rows: this.changes });
  });
});

module.exports = router;
