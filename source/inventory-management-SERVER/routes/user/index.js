const { router, path, fs, sqlite3, getDatabaseInstance, bcrypt } = require("../requires");

async function hashPassword(plainTextPassword) {
  const saltRounds = 10;

  try {
    const hash = await bcrypt.hash(plainTextPassword, saltRounds);
    return hash;
  } catch (error) {
    console.error("Error hashing password:", error);
  }
}

const createOrganizationDatabase = (organizationId) => {
  const orgDbPath = path.resolve(__dirname, `../../db/org/${organizationId}.sqlite`);
  const exists = fs.existsSync(orgDbPath);

  if (!exists) {
    const orgDb = new sqlite3.Database(orgDbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        console.error(`Error opening database for organization ID: ${organizationId}`, err.message);
        return;
      }

      // Define SQL for creating necessary tables
      const tableCreationSqlStatements = [
        `CREATE TABLE IF NOT EXISTS items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          price REAL,
          sku TEXT,
          stock INTEGER,
          last_modified DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,
        `CREATE TABLE IF NOT EXISTS vendors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          contact_name TEXT,
          contact_email TEXT,
          address TEXT,
          phone TEXT,
          previous_orders INTEGER,
          notes TEXT
        );`,
        `CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          contact_name TEXT,
          contact_email TEXT,
          address TEXT,
          phone TEXT,
          previous_orders INTEGER,
          notes TEXT
        );`,
        `CREATE TABLE IF NOT EXISTS sales_orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_id INTEGER NOT NULL,
          order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT CHECK( status IN ('Pending','Completed','Cancelled') ) NOT NULL DEFAULT 'Pending',
          notes TEXT,
          FOREIGN KEY (customer_id) REFERENCES customers(id)
        );`,
        `CREATE TABLE IF NOT EXISTS purchase_orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          vendor_id INTEGER NOT NULL,
          order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT CHECK( status IN ('Pending','Completed','Cancelled') ) NOT NULL DEFAULT 'Pending',
          notes TEXT,
          FOREIGN KEY (vendor_id) REFERENCES vendors(id)
        );`,
        `CREATE TABLE IF NOT EXISTS sales_orders_items (
          sales_order_id INTEGER NOT NULL,
          item_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          price_at_sale REAL NOT NULL,
          PRIMARY KEY (sales_order_id, item_id),
          FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id),
          FOREIGN KEY (item_id) REFERENCES items(id)
        );`,
        `CREATE TABLE IF NOT EXISTS purchase_orders_items (
          purchase_order_id INTEGER NOT NULL,
          item_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          price_at_purchase REAL NOT NULL,
          PRIMARY KEY (purchase_order_id, item_id),
          FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id),
          FOREIGN KEY (item_id) REFERENCES items(id)
        );`,
        `CREATE TABLE IF NOT EXISTS bills (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          vendor_id INTEGER NOT NULL,
          purchase_order_id INTEGER,
          bill_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          amount_due REAL NOT NULL,
          status TEXT CHECK( status IN ('Pending','Paid') ) NOT NULL DEFAULT 'Pending',
          notes TEXT,
          FOREIGN KEY (vendor_id) REFERENCES vendors(id),
          FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id)
        );`,
        `CREATE TABLE IF NOT EXISTS invoices (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_id INTEGER NOT NULL,
          sales_order_id INTEGER,
          invoice_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          amount_due REAL NOT NULL,
          status TEXT CHECK( status IN ('Pending','Paid') ) NOT NULL DEFAULT 'Pending',
          notes TEXT,
          FOREIGN KEY (customer_id) REFERENCES customers(id),
          FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id)
        );`,
        `CREATE TABLE IF NOT EXISTS warehouses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          address TEXT NOT NULL
        );`,
        `CREATE TABLE IF NOT EXISTS item_locations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          item_id INTEGER NOT NULL,
          warehouse_id INTEGER NOT NULL,
          bin_location TEXT NOT NULL,
          stock INTEGER NOT NULL,
          FOREIGN KEY (item_id) REFERENCES items(id),
          FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
        );`,
      ];

      // Execute each SQL statement to create the tables
      tableCreationSqlStatements.forEach((sql) => {
        orgDb.run(sql, [], (err) => {
          if (err) {
            console.error("Error creating table", err.message);
          }
        });
      });

      // Closing the database
      orgDb.close();
    });
  }
};

// Route to create user and organization
router.post("/createUserAndOrganization", async (req, res) => {
  const { userName, userEmail, userPassword, organizationName } = req.body;
  let userId;
  let organizationId;
  const hashedUserPassword = await hashPassword(userPassword);

  db = getDatabaseInstance("", "main");

  // Start a serialized transaction
  db.serialize(() => {
    db.run(`BEGIN TRANSACTION;`);

    // Insert user
    db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`, [userName, userEmail, hashedUserPassword], function (err) {
      if (err) {
        console.error(err.message);
        db.run(`ROLLBACK;`);
        return res.status(500).send("Error creating user");
      }
      userId = this.lastID;

      // Insert organization
      db.run(`INSERT INTO organizations (name) VALUES (?)`, [organizationName], function (err) {
        if (err) {
          console.error(err.message);
          db.run(`ROLLBACK;`);
          return res.status(500).send("Error creating organization");
        }
        organizationId = this.lastID;
        createOrganizationDatabase(organizationId); // Create org-specific DB

        // Link user to organization
        db.run(`INSERT INTO organization_users (organization_id, user_id) VALUES (?, ?)`, [organizationId, userId], function (err) {
          if (err) {
            console.error(err.message);
            db.run(`ROLLBACK;`);
            return res.status(500).send("Error linking user to organization");
          }

          db.run(`COMMIT;`);
          res.send("User and organization created successfully");
          db.close();
        });
      });
    });
  });
});

module.exports = router;
