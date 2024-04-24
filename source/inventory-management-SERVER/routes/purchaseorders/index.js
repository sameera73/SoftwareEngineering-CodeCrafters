const { router, getDatabaseInstance } = require("../requires");

// List all purchase orders
router.get("/purchase_orders", (req, res) => {
  const { orgId } = req.body;
  const db = getDatabaseInstance(orgId);
  const query = "SELECT * FROM purchase_orders";
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ purchase_orders: rows });
  });
});

// Get details of a specific purchase order, including items
router.get("/purchase_orders/:purchaseOrderId", (req, res) => {
  const { purchaseOrderId } = req.params;
  const { orgId } = req.body;
  const db = getDatabaseInstance(orgId);
  const query = `SELECT * from purchase_orders WHERE id = ?`;
  db.all(query, [purchaseOrderId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row && row.length > 0) {
      itemQuery = `SELECT * from purchase_orders_items WHERE purchase_order_id = ?`;
      db.all(itemQuery, [purchaseOrderId], (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
        }
        if (rows && rows.length > 0) {
          res.json({ purchase_order: row, items: rows });
        } else {
          res.status(404).json({ message: "Item in purchase order not found" });
        }
      });
    } else {
      res.status(404).json({ message: "Purchase order not found" });
    }
  });
});

// Create a new purchase order and its items
router.post("/purchase_orders/create", (req, res) => {
  const { orgId, vendor_id, order_date, status, notes, items } = req.body;
  const db = getDatabaseInstance(orgId);

  // Begin transaction
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    const insertPO = "INSERT INTO purchase_orders (vendor_id, order_date, status, notes) VALUES (?, ?, ?, ?)";
    db.run(insertPO, [vendor_id, order_date, status, notes], function (err) {
      if (err) {
        db.run("ROLLBACK");
        res.status(500).json({ error: err.message });
        return;
      }
      db.run(`UPDATE vendors SET previous_orders = previous_orders + 1 WHERE id = ?`, [vendor_id]);
      const poId = this.lastID;
      const insertPOItems =
        "INSERT INTO purchase_orders_items (purchase_order_id, item_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)";
      const updateItemStock = "UPDATE items SET stock = stock + ? WHERE id = ?";

      items.forEach((item) => {
        db.run(insertPOItems, [poId, item.item_id, item.quantity, item.price_at_purchase], function (err) {
          if (!err) {
            db.run(updateItemStock, [item.quantity, item.item_id], function (err) {
              if (err) {
                console.log(`Error updating item quantity for item_id ${item.item_id}: ${err.message}`);
                db.run("ROLLBACK");
                return;
              }
            });
          } else {
            console.log(`Error inserting item into purchase_orders_items for item_id ${item.item_id}: ${err.message}`);
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
        res.json({ message: "Purchase order created successfully", id: poId });
      });
    });
  });
});

// Update an existing purchase order and its items
router.put("/purchase_orders/:purchaseOrderId", async (req, res) => {
  const { purchaseOrderId } = req.params;
  const { orgId, vendor_id, order_date, status, notes, items } = req.body;
  const db = getDatabaseInstance(orgId);

  // Begin transaction
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    // Update the purchase order details
    const updatePO = `UPDATE purchase_orders SET vendor_id = ?, order_date = ?, status = ?, notes = ? WHERE id = ?`;
    db.run(updatePO, [vendor_id, order_date, status, notes, purchaseOrderId], function (err) {
      if (err) {
        db.run("ROLLBACK");
        res.status(500).json({ error: err.message });
        return;
      }

      // Fetch existing items for this purchase order
      const existingItemsQuery = `SELECT item_id, quantity FROM purchase_orders_items WHERE purchase_order_id = ?`;
      db.all(existingItemsQuery, [purchaseOrderId], (err, existingItems) => {
        if (err) {
          db.run("ROLLBACK");
          res.status(500).json({ error: err.message });
          return;
        }
        const existingItemIds = new Set(existingItems.map((item) => item.item_id));
        const newItemIds = new Set(items.map((item) => item.item_id));
        const itemsToDelete = [...existingItemIds].filter((id) => !newItemIds.has(id));

        itemsToDelete.forEach((itemId) => {
          const itemToDelete = existingItems.find((item) => item.item_id === itemId);
          const deleteQuery = `DELETE FROM purchase_orders_items WHERE purchase_order_id = ? AND item_id = ?`;
          db.run(deleteQuery, [purchaseOrderId, itemId], function (err) {
            if (!err && this.changes > 0) {
              const updateActualItemQuery = `UPDATE items SET stock = stock - ? WHERE id = ?`;
              db.run(updateActualItemQuery, [itemToDelete.quantity, itemId]);
            }
          });
        });

        items.forEach((item) => {
          if (existingItemIds.has(item.item_id)) {
            const updateItemQuery = `UPDATE purchase_orders_items SET quantity = ?, price_at_purchase = ? WHERE purchase_order_id = ? AND item_id = ?`;
            db.run(updateItemQuery, [item.quantity, item.price_at_purchase, purchaseOrderId, item.item_id], function (err) {
              if (!err && this.changes > 0) {
                const quantityChange = item.quantity - existingItems.find((ei) => ei.item_id === item.item_id).quantity;
                if (quantityChange !== 0) {
                  const updateActualItemQuery = `UPDATE items SET stock = stock + ? WHERE id = ?`;
                  db.run(updateActualItemQuery, [quantityChange, item.item_id]);
                }
              }
            });
          } else {
            const insertItemQuery = `INSERT INTO purchase_orders_items (purchase_order_id, item_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)`;
            db.run(insertItemQuery, [purchaseOrderId, item.item_id, item.quantity, item.price_at_purchase], function (err) {
              if (!err) {
                const updateActualItemQuery = `UPDATE items SET stock = stock + ? WHERE id = ?`;
                db.run(updateActualItemQuery, [item.quantity, item.item_id]);
              }
            });
          }
        });

        // Commit transaction
        db.run("COMMIT", (err) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({ message: "Purchase order and items updated successfully" });
        });
      });
    });
  });
});

// Delete a purchase order and its items
router.delete("/purchase_orders/:purchaseOrderId", (req, res) => {
  const { purchaseOrderId } = req.params;
  const { orgId } = req.body;
  const db = getDatabaseInstance(orgId);

  // Begin transaction
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    const fetchItems = "SELECT item_id, quantity FROM purchase_orders_items WHERE purchase_order_id = ?";
    db.all(fetchItems, [purchaseOrderId], (err, items) => {
      if (err) {
        db.run("ROLLBACK");
        res.status(500).json({ error: err.message });
        return;
      }

      items.forEach((item) => {
        const updateStock = "UPDATE items SET stock = stock - ? WHERE id = ?";
        db.run(updateStock, [item.quantity, item.item_id], (err) => {
          if (err) {
            console.log(`Error updating stock for item_id ${item.item_id}: ${err.message}`);
          }
        });
      });

      const deletePOItems = "DELETE FROM purchase_orders_items WHERE purchase_order_id = ?";
      db.run(deletePOItems, [purchaseOrderId], (err) => {
        if (err) {
          db.run("ROLLBACK");
          res.status(500).json({ error: err.message });
          return;
        }
        db.get(`SELECT * FROM purchase_orders WHERE id = ?`, [purchaseOrderId], function (err, row) {
          if (err) {
            db.run("ROLLBACK");
            res.status(500).json({ error: err.message });
            return;
          }
          db.run(`UPDATE vendors SET previous_orders = previous_orders - 1 WHERE id = ?`, [row.vendor_id], (err) => {
            if (!err) {
              const deletePO = "DELETE FROM purchase_orders WHERE id = ?";
              db.run(deletePO, [purchaseOrderId], function (err) {
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
                  res.json({ message: "Purchase order deleted successfully" });
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
