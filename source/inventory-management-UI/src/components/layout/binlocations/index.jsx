import { useState, useEffect, useRef } from "react";
import api from "../../../services/axiosConfig";
import { Box, Button } from "@mui/material";
import DataTable from "../DataTable";
import EditBinLocationDialog from "./edit";
import NewBinLocationDialog from "./new";
import Alert from "@mui/material/Alert";

const BinLocations = () => {
  const tableRef = useRef();

  const [binLocations, setBinLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [currentBinLocationId, setCurrentBinLocationId] = useState(null);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const columns = [
    { id: "id", label: "Location ID", sortable: true },
    { id: "itemName", label: "Item", sortable: true },
    { id: "warehouseName", label: "Warehouse", sortable: true },
    { id: "bin_location", label: "Bin Location", sortable: true },
    { id: "stock", label: "Stock", sortable: true },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const itemsResponse = await api.get("/items");
        const warehousesResponse = await api.get("/warehouses");
        const binLocationsResponse = await api.get("/bin-locations");

        setItems(itemsResponse.data.items);
        setWarehouses(warehousesResponse.data.data);

        const enrichedBinLocations = binLocationsResponse.data.data.map((binLocation) => {
          const item = itemsResponse.data.items.find((item) => item.id === binLocation.item_id) || {};
          const warehouse = warehousesResponse.data.data.find((warehouse) => warehouse.id === binLocation.warehouse_id) || {};
          return {
            ...binLocation,
            itemName: item.name,
            warehouseName: warehouse.name,
          };
        });

        setBinLocations(enrichedBinLocations);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
        setError("Failed to fetch data");
      }
    };

    fetchData();
  }, []);

  const handleNewBinLocation = (newBinLocation) => {
    setBinLocations((prev) => [...prev, newBinLocation]);
  };

  const handleBinLocationUpdate = (updatedBinLocation) => {
    const updatedBinLocations = binLocations.map((binLocation) =>
      binLocation.id === updatedBinLocation.id ? updatedBinLocation : binLocation
    );
    setBinLocations(updatedBinLocations);
  };

  const newAction = () => {
    setIsNewDialogOpen(true);
  };

  const editAction = (id) => {
    setCurrentBinLocationId(id);
    setIsEditDialogOpen(true);
  };

  const deleteAction = async (id) => {
    try {
      await api.delete(`/bin-locations/${id}`);
      setBinLocations((prev) => prev.filter((binLocation) => binLocation.id !== id));
    } catch (error) {
      console.error("Error deleting bin location:", error);
      setError("Error: Bin location is used by other modules!");
      setTimeout(() => {
        setError("");
      }, 5000);
    }
  };

  const actionCaller = (actionName, binLocationId) => {
    if (actionName === "delete") {
      deleteAction(binLocationId);
    } else if (actionName === "edit") {
      editAction(binLocationId);
    }
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
          Add New Bin Location
        </Button>
      </Box>
      <h2>Bin Locations</h2>
      <DataTable
        ref={tableRef}
        loading={loading}
        columns={columns}
        data={binLocations}
        onActionClick={actionCaller}
        searchParam="itemName"
      />
      {isEditDialogOpen && (
        <EditBinLocationDialog
          open={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          binLocationId={currentBinLocationId}
          binLocations={binLocations}
          items={items}
          warehouses={warehouses}
          onBinLocationUpdate={handleBinLocationUpdate}
        />
      )}
      {isNewDialogOpen && (
        <NewBinLocationDialog
          open={isNewDialogOpen}
          onClose={() => setIsNewDialogOpen(false)}
          items={items}
          warehouses={warehouses}
          onBinLocationCreate={handleNewBinLocation}
        />
      )}
    </Box>
  );
};

export default BinLocations;
