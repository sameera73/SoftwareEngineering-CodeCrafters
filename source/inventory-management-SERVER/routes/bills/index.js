const { router, getDatabaseInstance } = require("../requires");

// List all bills
router.get("/bills", (req, res) => {
  const { orgId } = req.body;
  const db = getDatabaseInstance(orgId);
  db.all("SELECT * FROM bills", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ bills: rows });
  });
});

// Get details of a specific bill
router.get("/bills/:billId", (req, res) => {
  const { billId } = req.params;
  const { orgId } = req.body;
  const db = getDatabaseInstance(orgId);
  db.get("SELECT * FROM bills WHERE id = ?", [billId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ message: "Bill not found" });
      return;
    }
    res.json({ bill: row });
  });
});

// Create a new bill with amount_due calculated automatically
router.post("/bills/create", (req, res) => {
  const { orgId, vendor_id, purchase_order_id, bill_date, status, notes } = req.body;
  const db = getDatabaseInstance(orgId);

  db.all("SELECT quantity, price_at_purchase FROM purchase_orders_items WHERE purchase_order_id = ?", [purchase_order_id], (err, items) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const amount_due = items.reduce((acc, item) => acc + item.quantity * item.price_at_purchase, 0);

    const insertBill = "INSERT INTO bills (vendor_id, purchase_order_id, bill_date, amount_due, status, notes) VALUES (?, ?, ?, ?, ?, ?)";
    db.run(insertBill, [vendor_id, purchase_order_id, bill_date, amount_due, status, notes], function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: "Bill created successfully", id: this.lastID, amount_due });
    });
  });
});

// Update an existing bill with recalculated amount_due
router.put("/bills/:billId", (req, res) => {
  const { billId } = req.params;
  const { orgId, purchase_order_id, status, notes } = req.body;
  const db = getDatabaseInstance(orgId);

  db.all("SELECT quantity, price_at_purchase FROM purchase_orders_items WHERE purchase_order_id = ?", [purchase_order_id], (err, items) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const amount_due = items.reduce((acc, item) => acc + item.quantity * item.price_at_purchase, 0);

    const updateBill = `UPDATE bills SET amount_due = ?, status = ?, notes = ? WHERE id = ?`;
    db.run(updateBill, [amount_due, status, notes, billId], function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: "Bill updated successfully", amount_due });
    });
  });
});

// Delete a bill
router.delete("/bills/:billId", (req, res) => {
  const { billId } = req.params;
  const { orgId } = req.body;
  const db = getDatabaseInstance(orgId);
  const deleteBill = "DELETE FROM bills WHERE id = ?";
  db.run(deleteBill, [billId], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "Bill deleted successfully" });
  });
});

module.exports = router;
