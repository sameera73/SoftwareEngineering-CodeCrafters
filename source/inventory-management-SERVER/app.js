const express = require("express");
const { db, init } = require("./db");
const cors = require("cors");
const itemRoute = require("./routes/items");
const userRoute = require("./routes/user");
const customersRoute = require("./routes/customers");
const vendorsRoute = require("./routes/vendors");
const purchaseOrdersRoute = require("./routes/purchaseorders");
const salesOrdersRoute = require("./routes/salesorders");
const billsRoute = require("./routes/bills");
const invoicesRoute = require("./routes/invoices");
const warehousesRoute = require("./routes/warehouses");
const binLocationsRoute = require("./routes/binlocations");
const statsRoute = require("./routes/stats");

// Auth
const authRoutes = require("./routes/auth").router;
const { verifyToken, verifyOrgAccess } = require("./routes/auth");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

init(); // Initialize the database

// Use authRoutes for authentication
app.use("/user", userRoute);
app.use("/auth", authRoutes);

// To verify every request except for login and signup
app.use(verifyToken);
app.use(verifyOrgAccess);

app.use(
  "/",
  itemRoute,
  customersRoute,
  vendorsRoute,
  purchaseOrdersRoute,
  salesOrdersRoute,
  billsRoute,
  invoicesRoute,
  statsRoute,
  warehousesRoute,
  binLocationsRoute
);

// Listen on
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

// Close the database connection when the app is closed
process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Closed the database connection.");
    process.exit(0);
  });
});
