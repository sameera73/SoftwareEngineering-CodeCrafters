import { useState, useEffect, useRef } from "react";
import api from "../../../services/axiosConfig";
import { Box, Button } from "@mui/material";
import DataTable from "../DataTable";
import NewSalesOrder from "./new";
import EditSalesOrder from "./edit";
import ViewSalesOrder from "./view";
import Alert from "@mui/material/Alert";

const SalesOrders = () => {
  const tableRef = useRef();

  const [loading, setLoading] = useState(true);
  const [salesOrders, setSalesOrders] = useState([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentSOId, setCurrentSOId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSalesOrders = async () => {
      try {
        const response = await api.get("/sales_orders");
        setSalesOrders(response.data.sales_orders.map((SO) => ({ ...SO, order_date: new Date(SO.order_date).toLocaleDateString() })));
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch sales orders:", error);
        setLoading(false);
        setError("Failed to fetch sales orders. Please try again later.");
      }
    };

    fetchSalesOrders();
  }, []);

  const handleNewSO = (newSO) => {
    setSalesOrders((prevSO) => [...prevSO, newSO]);
  };

  const handleSOUpdate = (updatedSO) => {
    const updatedSOs = salesOrders.map((SO) => (SO.id === updatedSO.id ? updatedSO : SO));
    setSalesOrders(updatedSOs);
  };

  const handleActionClick = (action, id) => {
    if (action === "delete") {
      deleteAction(id);
    } else if (action === "edit") {
      editAction(id);
    } else if (action === "viewDetails") {
      viewAction(id);
    }
  };

  const editAction = (id) => {
    tableRef.current.closeFunction();
    setCurrentSOId(id);
    setIsEditDialogOpen(true);
  };

  const viewAction = (id) => {
    tableRef.current.closeFunction();
    setCurrentSOId(id);
    setIsViewDialogOpen(true);
  };

  const deleteAction = async (id) => {
    try {
      tableRef.current.closeFunction();
      await api.delete(`/sales_orders/${id}`);
      setSalesOrders(salesOrders.filter((so) => so.id !== id));
    } catch (error) {
      console.error("Error deleting sales order:", error);
      setError("Failed to delete sales order. Referenced in another module.");
    }
  };

  const newAction = () => {
    setIsNewDialogOpen(true);
  };

  const columns = [
    { id: "id", label: "ID", sortable: true },
    { id: "customer_id", label: "Customer ID", sortable: false },
    { id: "order_date", label: "Order Date", sortable: true },
    { id: "status", label: "Status", sortable: false },
    { id: "notes", label: "Notes", sortable: false },
  ];

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
        <Button variant="contained" color="primary" onClick={() => newAction()}>
          Create Sales Order
        </Button>
      </Box>
      <div>
        <h2>Sales Orders</h2>
        <DataTable
          ref={tableRef}
          columns={columns}
          data={salesOrders}
          onActionClick={handleActionClick}
          loading={loading}
          loadingMessage="Loading sales orders..."
          searchParam="id"
          actions={["details"]}
        />
      </div>
      <NewSalesOrder open={isNewDialogOpen} onClose={() => setIsNewDialogOpen(false)} onCreate={handleNewSO} />
      <EditSalesOrder open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} onUpdate={handleSOUpdate} orderId={currentSOId} />
      <ViewSalesOrder open={isViewDialogOpen} onClose={() => setIsViewDialogOpen(false)} orderId={currentSOId} />
    </Box>
  );
};

export default SalesOrders;
