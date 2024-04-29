const { router, getDatabaseInstance } = require("../requires");

// List all sales orders
router.get("/sales_orders", (req, res) => {
  const { orgId } = req.body;
  const db = getDatabaseInstance(orgId);
  const query = "SELECT * FROM sales_orders";
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ sales_orders: rows });
  });
});

// Get details of a specific sales order, including items
router.get("/sales_orders/:salesOrderId", (req, res) => {
  const { salesOrderId } = req.params;
  const { orgId } = req.body;
  const db = getDatabaseInstance(orgId);
  const query = `SELECT * from sales_orders WHERE id = ?`;
  db.all(query, [salesOrderId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row && row.length > 0) {
      const itemQuery = `SELECT * from sales_orders_items WHERE sales_order_id = ?`;
      db.all(itemQuery, [salesOrderId], (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
        }
        if (rows && rows.length > 0) {
          res.json({ sales_order: row, items: rows });
        } else {
          res.status(404).json({ message: "Item in sales order not found" });
        }
      });
    } else {
      res.status(404).json({ message: "Sales order not found" });
    }
  });
});

// Create a new sales order and its items
router.post("/sales_orders/create", (req, res) => {
  const { orgId, customer_id, order_date, status, notes, items } = req.body;
  const db = getDatabaseInstance(orgId);

  // Begin transaction
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    const insertSO = "INSERT INTO sales_orders (customer_id, order_date, status, notes) VALUES (?, ?, ?, ?)";
    db.run(insertSO, [customer_id, order_date, status, notes], function (err) {
      if (err) {
        db.run("ROLLBACK");
        res.status(500).json({ error: err.message });
        return;
      }
      db.run(`UPDATE customers SET previous_orders = previous_orders + 1 WHERE id = ?`, [customer_id]);
      const soId = this.lastID;
      const insertSOItems = "INSERT INTO sales_orders_items (sales_order_id, item_id, quantity, price_at_sale) VALUES (?, ?, ?, ?)";
      const updateItemStock = "UPDATE items SET stock = stock - ? WHERE id = ?";

      items.forEach((item) => {
        db.run(insertSOItems, [soId, item.item_id, item.quantity, item.price_at_sale], function (err) {
          if (!err) {
            db.run(updateItemStock, [item.quantity, item.item_id], function (err) {
              if (err) {
                console.log(`Error updating stock for item_id ${item.item_id}: ${err.message}`);
              }
            });
          } else {
            console.log(`Error inserting item into sales_orders_items for item_id ${item.item_id}: ${err.message}`);
            db.run("ROLLBACK");
            return;
          }
        });
      });

      // Commit transaction
      db.run("COMMIT", (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: "Sales order created successfully", id: soId });
      });
    });
  });
});

// Update an existing sales order and its items
router.put("/sales_orders/:salesOrderId", async (req, res) => {
  const { salesOrderId } = req.params;
  const { orgId, customer_id, order_date, status, notes, items: newItems } = req.body;
  const db = getDatabaseInstance(orgId);

  // Begin transaction
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    const updateSO = `UPDATE sales_orders SET customer_id = ?, order_date = ?, status = ?, notes = ? WHERE id = ?`;
    db.run(updateSO, [customer_id, order_date, status, notes, salesOrderId], function (err) {
      if (err) {
        db.run("ROLLBACK");
        res.status(500).json({ error: err.message });
        return;
      }

      db.all(`SELECT item_id, quantity FROM sales_orders_items WHERE sales_order_id = ?`, [salesOrderId], (err, existingItems) => {
        if (err) {
          db.run("ROLLBACK");
          res.status(500).json({ error: err.message });
          return;
        }

        const existingItemIds = existingItems.map((item) => item.item_id);
        const newItemIds = newItems.map((item) => item.item_id);
        const itemsToDelete = existingItems.filter((item) => !newItemIds.includes(item.item_id));

        itemsToDelete.forEach((item) => {
          db.run(`DELETE FROM sales_orders_items WHERE sales_order_id = ? AND item_id = ?`, [salesOrderId, item.item_id], (err) => {
            if (!err) {
              db.run(`UPDATE items SET stock = stock + ? WHERE id = ?`, [item.quantity, item.item_id]);
            }
          });
        });

        newItems.forEach((newItem) => {
          const existingItem = existingItems.find((item) => item.item_id === newItem.item_id);
          if (existingItem) {
            const quantityDiff = existingItem.quantity - newItem.quantity;
            db.run(
              `UPDATE sales_orders_items SET quantity = ?, price_at_sale = ? WHERE sales_order_id = ? AND item_id = ?`,
              [newItem.quantity, newItem.price_at_sale, salesOrderId, newItem.item_id],
              (err) => {
                if (!err) {
                  db.run(`UPDATE items SET stock = stock + ? WHERE id = ?`, [quantityDiff, newItem.item_id]);
                }
              }
            );
          } else {
            db.run(
              `INSERT INTO sales_orders_items (sales_order_id, item_id, quantity, price_at_sale) VALUES (?, ?, ?, ?)`,
              [salesOrderId, newItem.item_id, newItem.quantity, newItem.price_at_sale],
              (err) => {
                if (!err) {
                  db.run(`UPDATE items SET stock = stock - ? WHERE id = ?`, [newItem.quantity, newItem.item_id]);
                }
              }
            );
          }
        });

        // Commit transaction
        db.run("COMMIT", (err) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({ message: "Sales order and items updated successfully, item stock adjusted accordingly." });
        });
      });
    });
  });
});

// Delete a sales order and its items
router.delete("/sales_orders/:salesOrderId", (req, res) => {
  const { salesOrderId } = req.params;
  const { orgId } = req.body;
  const db = getDatabaseInstance(orgId);

  // Begin transaction
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    db.all("SELECT item_id, quantity FROM sales_orders_items WHERE sales_order_id = ?", [salesOrderId], (err, items) => {
      if (err) {
        db.run("ROLLBACK");
        res.status(500).json({ error: err.message });
        return;
      }

      items.forEach(({ item_id, quantity }) => {
        db.run("UPDATE items SET stock = stock + ? WHERE id = ?", [quantity, item_id], (err) => {
          if (err) {
            console.log(`Error updating stock for item_id ${item_id}: ${err.message}`);
          }
        });
      });

      db.run("DELETE FROM sales_orders_items WHERE sales_order_id = ?", [salesOrderId], (err) => {
        if (err) {
          db.run("ROLLBACK");
          res.status(500).json({ error: err.message });
          return;
        }
        db.get(`SELECT * FROM sales_orders WHERE id = ?`, [salesOrderId], function (err, row) {
          if (err) {
            db.run("ROLLBACK");
            res.status(500).json({ error: err.message });
            return;
          }
          db.run(`UPDATE customers SET previous_orders = previous_orders - 1 WHERE id = ?`, [row.customer_id], (err) => {
            if (!err) {
              db.run("DELETE FROM sales_orders WHERE id = ?", [salesOrderId], function (err) {
                if (err) {
                  db.run("ROLLBACK");
                  res.status(500).json({ error: err.message });
                  return;
                }
                // Commit transaction
                db.run("COMMIT", (err) => {
                  if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                  }
                  res.json({ message: "Sales order and its items deleted successfully, item stock adjusted accordingly." });
                });
              });
            }
          });
        });
      });
    });
  });
});

module.exports = router;
