import { useState, useEffect, useRef } from "react";
import api from "../../../services/axiosConfig";
import { Box, Button } from "@mui/material";
import DataTable from "../DataTable";
import EditItemDialog from "./edit";
import NewItemDialog from "./new";

const Items = () => {
  const tableRef = useRef();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);

  const columns = [
    { id: "id", label: "ID", sortable: false },
    { id: "name", label: "Name", sortable: true },
    { id: "description", label: "Description", sortable: false },
    { id: "price", label: "Price", sortable: true },
    { id: "sku", label: "SKU", sortable: false },
    { id: "stock", label: "Stock", sortable: true },
    { id: "last_modified", label: "Last Modified", sortable: true },
  ];

  const fields = [
    { name: "name", label: "Name", type: "text" },
    { name: "description", label: "Description", type: "text" },
    { name: "price", label: "Price", type: "number" },
    { name: "sku", label: "SKU", type: "text" },
    { name: "stock", label: "Stock", type: "number" },
  ];

  const handleItemUpdate = (updatedItem) => {
    const updatedItems = items.map((item) => (item.id === updatedItem.id ? updatedItem : item));
    setItems(updatedItems);
  };

  const handleNewItem = (newItem) => {
    setItems((prevItems) => [...prevItems, newItem]);
  };

  const editAction = (id) => {
    tableRef.current.closeFunction();
    setCurrentItemId(id);
    setIsEditDialogOpen(true);
  };

  const newAction = () => {
    setIsNewDialogOpen(true);
  };

  const deleteAction = async (id) => {
    try {
      tableRef.current.closeFunction();
      await api.delete(`/items/delete/${id}`);
      setItems(items.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const actionCaller = (actionName, itemId) => {
    if (actionName === "delete") {
      deleteAction(itemId);
    } else if (actionName === "edit") {
      editAction(itemId);
    }
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get("/items");
        setItems(response.data.items.map((item) => ({ ...item, last_modified: new Date(item.last_modified).toLocaleDateString() })));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching items:", error);
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <Box position="absolute" top={0} right={0} mt={2}>
        <Button variant="contained" color="primary" onClick={() => newAction()}>
          Add New Item
        </Button>
      </Box>
      <DataTable
        ref={tableRef}
        loading={loading}
        loadingMessage={"Items are loading"}
        columns={columns}
        data={items}
        onActionClick={actionCaller}
        searchParam={"name"}
      />
      <EditItemDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        itemId={currentItemId}
        items={items}
        onItemUpdate={handleItemUpdate}
        fields={fields}
      />
      <NewItemDialog open={isNewDialogOpen} onClose={() => setIsNewDialogOpen(false)} onItemCreate={handleNewItem} fields={fields} />
    </Box>
  );
};

export default Items;
