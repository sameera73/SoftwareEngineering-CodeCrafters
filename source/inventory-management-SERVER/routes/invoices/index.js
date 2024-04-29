const { router, getDatabaseInstance } = require("../requires");

// List all invoices
router.get("/invoices", (req, res) => {
  const { orgId } = req.body;
  const db = getDatabaseInstance(orgId);
  db.all("SELECT * FROM invoices", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ invoices: rows });
  });
});

// Get details of a specific invoice
router.get("/invoices/:invoiceId", (req, res) => {
  const { invoiceId } = req.params;
  const { orgId } = req.body;
  const db = getDatabaseInstance(orgId);
  db.get("SELECT * FROM invoices WHERE id = ?", [invoiceId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ message: "Invoice not found" });
      return;
    }
    res.json({ invoice: row });
  });
});

// Create a new invoice with amount_due calculated automatically
router.post("/invoices/create", (req, res) => {
  const { orgId, customer_id, sales_order_id, invoice_date, status, notes } = req.body;
  const db = getDatabaseInstance(orgId);

  db.all("SELECT quantity, price_at_sale FROM sales_orders_items WHERE sales_order_id = ?", [sales_order_id], (err, items) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const amount_due = items.reduce((acc, item) => acc + item.quantity * item.price_at_sale, 0);

    const insertInvoice =
      "INSERT INTO invoices (customer_id, sales_order_id, invoice_date, amount_due, status, notes) VALUES (?, ?, ?, ?, ?, ?)";
    db.run(insertInvoice, [customer_id, sales_order_id, invoice_date, amount_due, status, notes], function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: "Invoice created successfully", id: this.lastID, amount_due });
    });
  });
});

// Update an existing invoice with recalculated amount_due
router.put("/invoices/:invoiceId", (req, res) => {
  const { invoiceId } = req.params;
  const { orgId, sales_order_id, status, notes } = req.body;
  const db = getDatabaseInstance(orgId);

  db.all("SELECT quantity, price_at_sale FROM sales_orders_items WHERE sales_order_id = ?", [sales_order_id], (err, items) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const amount_due = items.reduce((acc, item) => acc + item.quantity * item.price_at_sale, 0);

    const updateInvoice = `UPDATE invoices SET amount_due = ?, status = ?, notes = ? WHERE id = ?`;
    db.run(updateInvoice, [amount_due, status, notes, invoiceId], function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: "Invoice updated successfully", amount_due });
    });
  });
});

// Delete an invoice
router.delete("/invoices/:invoiceId", (req, res) => {
  const { invoiceId } = req.params;
  const { orgId } = req.body;
  const db = getDatabaseInstance(orgId);
  const deleteInvoice = "DELETE FROM invoices WHERE id = ?";
  db.run(deleteInvoice, [invoiceId], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "Invoice deleted successfully" });
  });
});

module.exports = router;
