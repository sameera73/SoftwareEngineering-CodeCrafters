import { useState, useEffect, useRef } from "react";
import api from "../../../services/axiosConfig";
import { Box, Button } from "@mui/material";
import DataTable from "../DataTable";
import EditWarehouseDialog from "./edit";
import NewWarehouseDialog from "./new";
import WarehouseDetailsDialog from "./view";
import Alert from "@mui/material/Alert";

const Warehouses = () => {
  const tableRef = useRef();

  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [currentWarehouseId, setCurrentWarehouseId] = useState(null);
  const [error, setError] = useState("");

  const columns = [
    { id: "id", label: "ID", sortable: false },
    { id: "name", label: "Name", sortable: true },
    { id: "address", label: "Address", sortable: true },
  ];

  const fields = [
    { name: "name", label: "Name", type: "text" },
    { name: "address", label: "Address", type: "text" },
  ];

  const handleWarehouseUpdate = (updatedWarehouse) => {
    const updatedWarehouses = warehouses.map((warehouse) => (warehouse.id === updatedWarehouse.id ? updatedWarehouse : warehouse));
    setWarehouses(updatedWarehouses);
  };

  const handleNewWarehouse = (newWarehouse) => {
    setWarehouses((prevWarehouses) => [...prevWarehouses, newWarehouse]);
  };

  const editAction = (id) => {
    tableRef.current.closeFunction();
    setCurrentWarehouseId(id);
    setIsEditDialogOpen(true);
  };

  const newAction = () => {
    setIsNewDialogOpen(true);
  };

  const deleteAction = async (id) => {
    try {
      tableRef.current.closeFunction();
      await api.delete(`/warehouses/${id}`);
      setWarehouses(warehouses.filter((warehouse) => warehouse.id !== id));
    } catch (error) {
      console.error("Error deleting warehouse:", error);
      setError("Error: Warehouse is used by other modules!");
      setTimeout(() => {
        setError("");
      }, 5000);
    }
  };

  const detailsAction = (id) => {
    setCurrentWarehouseId(id);
    setIsDetailsDialogOpen(true);
  };

  const actionCaller = (actionName, warehouseId) => {
    if (actionName === "delete") {
      deleteAction(warehouseId);
    } else if (actionName === "viewDetails") {
      detailsAction(warehouseId);
    } else if (actionName === "edit") {
      editAction(warehouseId);
    }
  };

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await api.get("/warehouses");
        setWarehouses(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching warehouses:", error);
        setLoading(false);
      }
    };

    fetchWarehouses();
  }, []);

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
          Add New Warehouse
        </Button>
      </Box>
      <h2>Warehouses</h2>
      <DataTable
        ref={tableRef}
        loading={loading}
        loadingMessage={"Warehouses are loading"}
        columns={columns}
        data={warehouses}
        onActionClick={actionCaller}
        actions={["details"]}
        searchParam={"name"}
      />
      <EditWarehouseDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        warehouseId={currentWarehouseId}
        warehouses={warehouses}
        onWarehouseUpdate={handleWarehouseUpdate}
        fields={fields}
      />
      <NewWarehouseDialog
        open={isNewDialogOpen}
        onClose={() => setIsNewDialogOpen(false)}
        onWarehouseCreate={handleNewWarehouse}
        fields={fields}
      />
      <WarehouseDetailsDialog open={isDetailsDialogOpen} onClose={() => setIsDetailsDialogOpen(false)} warehouseId={currentWarehouseId} />
    </Box>
  );
};

export default Warehouses;
