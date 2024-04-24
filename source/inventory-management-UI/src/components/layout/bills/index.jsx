import { useState, useEffect, useRef } from "react";
import api from "../../../services/axiosConfig";
import { Box, Button } from "@mui/material";
import DataTable from "../DataTable";
import NewBill from "./new";
import Alert from "@mui/material/Alert";

const Bills = () => {
  const tableRef = useRef();

  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState([]);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await api.get("/bills");
        setBills(
          response.data.bills.map((bill) => ({
            ...bill,
            bill_date: new Date(bill.bill_date).toLocaleDateString(),
            amount_due: bill.amount_due.toFixed(2),
          }))
        );

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch Bills:", error);
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  const columns = [
    { id: "id", label: "ID", sortable: false },
    { id: "vendor_id", label: "Vendor ID", sortable: false },
    { id: "purchase_order_id", label: "Purchase Order ID", sortable: false },
    { id: "bill_date", label: "Order Date", sortable: true },
    { id: "amount_due", label: "Amount Due", sortable: false },
    { id: "status", label: "Status", sortable: false },
    { id: "notes", label: "Notes", sortable: false },
  ];

  const handleActionClick = (action, id) => {
    if (action === "delete") {
      deleteAction(id);
    } else if (action === "update") {
      updateAction(id);
    }
  };

  const deleteAction = async (id) => {
    try {
      tableRef.current.closeFunction();
      await api.delete(`/bills/${id}`);
      setBills(bills.filter((po) => po.id !== id));
    } catch (error) {
      console.error("Error deleting bill:", error);
      setError("Error: Bill is used by other modules!");
      setTimeout(() => {
        setError("");
      }, 5000);
    }
  };

  const updateAction = async (id) => {
    tableRef.current.closeFunction();
    const updatedBills = await Promise.all(
      bills.map(async (bill) => {
        if (bill.id === id) {
          bill.bill_date = new Date().toISOString();
          const res = await api.put(`/bills/${id}`, bill);
          bill.bill_date = new Date(bill.bill_date).toLocaleDateString();
          bill.amount_due = res.data.amount_due;
          return bill;
        } else {
          return bill;
        }
      })
    );
    setBills(updatedBills);
  };

  const newAction = () => {
    setIsNewDialogOpen(true);
  };

  const handleBillCreation = (bill) => {
    setBills((prevBills) => [...prevBills, bill]);
  };

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      {error && (
        <Alert
          severity="error"
          style={{
            position: "fixed",
            top: "50px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "fit-content",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
          }}
        >
          {error}
        </Alert>
      )}
      <Box position="absolute" top={0} right={0} mt={2}>
        <Button variant="contained" color="primary" onClick={newAction}>
          Create Bill
        </Button>
      </Box>
      <div>
        <h2>Bills</h2>
        <DataTable
          ref={tableRef}
          columns={columns}
          data={bills}
          onActionClick={handleActionClick}
          loading={loading}
          loadingMessage="Loading Bills..."
          searchParam="id"
          actions={["update", "noedit"]}
        />
      </div>
      <NewBill open={isNewDialogOpen} onClose={() => setIsNewDialogOpen(false)} onCreate={handleBillCreation} />
    </Box>
  );
};

export default Bills;
