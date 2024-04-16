const { router, getDatabaseInstance } = require("../requires");

router.get("/vendors", (req, res) => {
  const { orgId } = req.body;
  const db = getDatabaseInstance(orgId);

  const query = "SELECT * FROM vendors";

  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      vendors: rows,
    });
  });
  db.close();
});

router.get("/vendors/details/:vendorId", (req, res) => {
  const { vendorId } = req.params;
  const { orgId } = req.body;
  const db = getDatabaseInstance(orgId);

  const query = "SELECT * FROM vendors WHERE id = ?";

  db.get(query, [vendorId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ message: "Vendor not found" });
    }
  });
  db.close();
});

router.post("/vendors/create", (req, res) => {
  const { orgId, name, contact_name, contact_email, address, phone, previous_orders, notes } = req.body;
  const db = getDatabaseInstance(orgId);

  const query =
    "INSERT INTO vendors (name, contact_name, contact_email, address, phone, previous_orders, notes) VALUES (?, ?, ?, ?, ?, ?, ?)";

  db.run(query, [name, contact_name, contact_email, address, phone, previous_orders, notes], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: "Vendor created successfully",
      id: this.lastID,
    });
  });
  db.close();
});

router.put("/vendors/edit/:vendorId", (req, res) => {
  const { vendorId } = req.params;
  const { orgId, name, contact_name, contact_email, address, phone, notes } = req.body;
  const db = getDatabaseInstance(orgId);

  const query = `UPDATE vendors SET name = ?, contact_name = ?, contact_email = ?, address = ?, phone = ?, notes = ? WHERE id = ?`;

  db.run(query, [name, contact_name, contact_email, address, phone, notes, vendorId], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes > 0) {
      res.json({ message: "Vendor updated successfully" });
    } else {
      res.status(404).json({ message: "Vendor not found" });
    }
  });
  db.close();
});

router.delete("/vendors/delete/:vendorId", (req, res) => {
  const { vendorId } = req.params;
  const { orgId } = req.body;
  const db = getDatabaseInstance(orgId);

  const query = "DELETE FROM vendors WHERE id = ?";

  db.run(query, [vendorId], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes > 0) {
      res.json({ message: "Vendor deleted successfully" });
    } else {
      res.status(404).json({ message: "Vendor not found" });
    }
  });
  db.close();
});

module.exports = router;
