import { useState, useEffect, useRef } from "react";
import api from "../../../services/axiosConfig";
import { Box, Button } from "@mui/material";
import DataTable from "../DataTable";
import NewPurchaseOrder from "./new";
import EditPurchaseOrder from "./edit";
import ViewPurchaseOrder from "./view";
import Alert from "@mui/material/Alert";

const PurchaseOrdres = () => {
  const tableRef = useRef();

  const [loading, setLoading] = useState(true);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentPOId, setCurrentPOId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      try {
        const response = await api.get("/purchase_orders");
        setPurchaseOrders(response.data.purchase_orders.map((PO) => ({ ...PO, order_date: new Date(PO.order_date).toLocaleDateString() })));
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch purchase orders:", error);
        setLoading(false);
        setError("Failed to fetch purchase orders. Please try again later.");
      }
    };

    fetchPurchaseOrders();
  }, []);

  const handleNewPO = (newPO) => {
    setPurchaseOrders((prevPO) => [...prevPO, newPO]);
  };

  const handlePOUpdate = (updatedPO) => {
    const updatedPOs = purchaseOrders.map((PO) => (PO.id === updatedPO.id ? updatedPO : PO));
    setPurchaseOrders(updatedPOs);
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
    setCurrentPOId(id);
    setIsEditDialogOpen(true);
  };

  const viewAction = (id) => {
    tableRef.current.closeFunction();
    setCurrentPOId(id);
    setIsViewDialogOpen(true);
  };

  const deleteAction = async (id) => {
    try {
      tableRef.current.closeFunction();
      await api.delete(`/purchase_orders/${id}`);
      setPurchaseOrders(purchaseOrders.filter((po) => po.id !== id));
    } catch (error) {
      console.error("Error deleting purchase order:", error);
      setError("Failed to delete purchase order. Referenced in another module.");
    }
  };

  const newAction = () => {
    setIsNewDialogOpen(true);
  };

  const columns = [
    { id: "id", label: "ID", sortable: true },
    { id: "vendor_id", label: "Vendor ID", sortable: false },
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
          Create Purchase Order
        </Button>
      </Box>
      <div>
        <h2>Purchase Orders</h2>
        <DataTable
          ref={tableRef}
          columns={columns}
          data={purchaseOrders}
          onActionClick={handleActionClick}
          loading={loading}
          loadingMessage="Loading purchase orders..."
          searchParam="id"
          actions={["details"]}
        />
      </div>
      <NewPurchaseOrder open={isNewDialogOpen} onClose={() => setIsNewDialogOpen(false)} onCreate={handleNewPO} />
      <EditPurchaseOrder
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onUpdate={handlePOUpdate}
        orderId={currentPOId}
      />
      <ViewPurchaseOrder open={isViewDialogOpen} onClose={() => setIsViewDialogOpen(false)} orderId={currentPOId} />
    </Box>
  );
};

export default PurchaseOrdres;
