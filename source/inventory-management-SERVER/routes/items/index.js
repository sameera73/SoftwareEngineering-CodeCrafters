const { router, getDatabaseInstance } = require("../requires");

router.get("/items", (req, res) => {
  const { orgId } = req.body;
  const db = getDatabaseInstance(orgId);

  const query = "SELECT * FROM items";

  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      items: rows,
    });
  });
  db.close();
});

router.get("/items/details/:itemId", (req, res) => {
  const { itemId } = req.params;
  const { orgId } = req.body;
  const db = getDatabaseInstance(orgId);

  const query = "SELECT * FROM items WHERE id = ?";

  db.get(query, [itemId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  });
  db.close();
});

router.post("/items/create", (req, res) => {
  const { orgId, name, description, price, sku, stock, last_modified } = req.body;
  const db = getDatabaseInstance(orgId);

  const query = "INSERT INTO items (name, description, price, sku, stock, last_modified) VALUES (?, ?, ?, ?, ?, ?)";

  db.run(query, [name, description, price, sku, stock, last_modified], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: "Item created successfully",
      id: this.lastID,
    });
  });
  db.close();
});

router.put("/items/edit/:itemId", (req, res) => {
  const { itemId } = req.params;
  const { orgId, name, description, price, sku, stock, last_modified } = req.body;
  const db = getDatabaseInstance(orgId);

  const query = `UPDATE items SET name = ?, description = ?, price = ?, sku = ?, stock = ?, last_modified = ? WHERE id = ?`;

  db.run(query, [name, description, price, sku, stock, last_modified, itemId], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes > 0) {
      res.json({ message: "Item updated successfully" });
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  });
  db.close();
});

router.delete("/items/delete/:itemId", (req, res) => {
  const { itemId } = req.params;
  const { orgId } = req.body;
  const db = getDatabaseInstance(orgId);

  const query = "DELETE FROM items WHERE id = ?";

  db.run(query, [itemId], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes > 0) {
      res.json({ message: "Item deleted successfully" });
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  });
  db.close();
});

module.exports = router;
