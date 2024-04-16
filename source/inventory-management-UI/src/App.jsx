import { Routes, Route } from "react-router-dom";
import Login from "./components/login/Login";
import Signup from "./components/create/Create";
import Layout from "./components/layout/Layout";
import NotFound from "./components/404/NotFound";
import RouteNAR from "./components/routes/RouteNAR";

// Important Modules
import Dashboard from "./components/layout/dashboard/Dashboard";
import Items from "./components/layout/items";
import Customers from "./components/layout/customers/";
import Vendors from "./components/layout/vendors/";
import PurchaseOrdres from "./components/layout/purchaseorders";
import Bills from "./components/layout/bills";
import SalesOrders from "./components/layout/salesorders";
import Invoices from "./components/layout/invoices";

const App = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RouteNAR>
            <Login />
          </RouteNAR>
        }
      />
      <Route
        path="/signup"
        element={
          <RouteNAR>
            <Signup />
          </RouteNAR>
        }
      />

      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="items" element={<Items />} />
        <Route path="customers" element={<Customers />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="sales-orders" element={<SalesOrders />} />
        <Route path="purchase-orders" element={<PurchaseOrdres />} />
        <Route path="bills" element={<Bills />} />
        <Route path="invoices" element={<Invoices />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
