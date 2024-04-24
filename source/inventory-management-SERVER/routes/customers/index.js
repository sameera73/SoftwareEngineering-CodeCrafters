const { router, getDatabaseInstance } = require("../requires");

router.get("/customers", (req, res) => {
  const { orgId } = req.body;
  const db = getDatabaseInstance(orgId);

  const query = "SELECT * FROM customers";

  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      customers: rows,
    });
  });
  db.close();
});

router.get("/customers/details/:customerId", (req, res) => {
  const { customerId } = req.params;
  const { orgId } = req.body;
  const db = getDatabaseInstance(orgId);

  const query = "SELECT * FROM customers WHERE id = ?";

  db.get(query, [customerId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ message: "Customer not found" });
    }
  });
  db.close();
});

router.post("/customers/create", (req, res) => {
  const { orgId, name, contact_name, contact_email, address, phone, previous_orders, notes } = req.body;
  const db = getDatabaseInstance(orgId);

  const query =
    "INSERT INTO customers (name, contact_name, contact_email, address, phone, previous_orders, notes) VALUES (?, ?, ?, ?, ?, ?, ?)";

  db.run(query, [name, contact_name, contact_email, address, phone, previous_orders, notes], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: "Customer created successfully",
      id: this.lastID,
    });
  });
  db.close();
});

router.put("/customers/edit/:customerId", (req, res) => {
  const { customerId } = req.params;
  const { orgId, name, contact_name, contact_email, address, phone, previous_orders, notes } = req.body;
  const db = getDatabaseInstance(orgId);

  const query = `UPDATE customers SET name = ?, contact_name = ?, contact_email = ?, address = ?, phone = ?, notes = ? WHERE id = ?`;

  db.run(query, [name, contact_name, contact_email, address, phone, notes, customerId], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes > 0) {
      res.json({ message: "Customer updated successfully" });
    } else {
      res.status(404).json({ message: "Customer not found" });
    }
  });
  db.close();
});

router.delete("/customers/delete/:customerId", (req, res) => {
  const { customerId } = req.params;
  const { orgId } = req.body;
  const db = getDatabaseInstance(orgId);

  const query = "DELETE FROM customers WHERE id = ?";

  db.run(query, [customerId], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes > 0) {
      res.json({ message: "Customer deleted successfully" });
    } else {
      res.status(404).json({ message: "Customer not found" });
    }
  });
  db.close();
});

module.exports = router;
