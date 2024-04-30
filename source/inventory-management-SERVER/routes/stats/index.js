const { router, getDatabaseInstance } = require("../requires");

// GET: Fetch comprehensive statistics
router.get("/stats", (req, res) => {
  const { orgId } = req.body;

  const db = getDatabaseInstance(orgId);

  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM items) AS total_items,
      (SELECT COUNT(*) FROM vendors) AS total_vendors,
      (SELECT COUNT(*) FROM customers) AS total_customers,
      (SELECT COUNT(*) FROM sales_orders WHERE status = 'Completed') AS completed_sales_orders,
      (SELECT COUNT(*) FROM purchase_orders WHERE status = 'Completed') AS completed_purchase_orders,
      (SELECT SUM(quantity) FROM sales_orders_items) AS total_items_sold,
      (SELECT SUM(quantity) FROM purchase_orders_items) AS total_items_purchased,
      (SELECT AVG(price) FROM items) AS average_item_price,
      (SELECT AVG(amount_due) FROM invoices WHERE status = 'Paid') AS average_invoice_amount,
      (SELECT AVG(amount_due) FROM bills WHERE status = 'Paid') AS average_bill_amount,
      MAX(0, (COALESCE((SELECT SUM(amount_due) FROM invoices WHERE status = 'Paid'), 0) - 
      COALESCE((SELECT SUM(amount_due) FROM bills WHERE status = 'Paid'), 0))) AS total_profit,
      (SELECT COUNT(*) FROM sales_orders WHERE status <> 'Completed') AS incomplete_sales_orders,
      (SELECT COUNT(*) FROM purchase_orders WHERE status <> 'Completed') AS incomplete_purchase_orders,
      (SELECT SUM(amount_due) FROM invoices WHERE status = 'Paid') AS total_amount_paid,
      (SELECT SUM(amount_due) FROM invoices WHERE status <> 'Paid') AS total_amount_due
  `;

  db.get(sql, [], (err, stats) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: stats,
    });
  });
});

module.exports = router;
