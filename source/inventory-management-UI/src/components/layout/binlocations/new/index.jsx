import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, TextField, MenuItem, Button, DialogActions } from "@mui/material";
import api from "../../../../services/axiosConfig";
import PropTypes from "prop-types";

function NewBinLocationDialog({ open, onClose, items, warehouses, onBinLocationCreate }) {
  const [newLocation, setNewLocation] = useState({ item_id: "", warehouse_id: "", bin_location: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewLocation((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    try {
      const response = await api.post("/bin-locations", {
        item_id: newLocation.item_id,
        warehouse_id: newLocation.warehouse_id,
        bin_location: newLocation.bin_location,
      });

      const item = items.find((i) => i.id === newLocation.item_id);
      const warehouse = warehouses.find((w) => w.id === newLocation.warehouse_id);
      const createdLocation = {
        ...newLocation,
        id: response.data.id,
        itemName: item ? item.name : "",
        warehouseName: warehouse ? warehouse.name : "",
      };

      onBinLocationCreate(createdLocation);
      onClose();
    } catch (error) {
      console.error("Error creating bin location:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Bin Location</DialogTitle>
      <DialogContent>
        <TextField select label="Item" value={newLocation.item_id} onChange={handleChange} name="item_id" fullWidth margin="dense">
          {items.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Warehouse"
          value={newLocation.warehouse_id}
          onChange={handleChange}
          name="warehouse_id"
          fullWidth
          margin="dense"
        >
          {warehouses.map((warehouse) => (
            <MenuItem key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Bin Location"
          value={newLocation.bin_location}
          onChange={handleChange}
          name="bin_location"
          fullWidth
          margin="dense"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleCreate} color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

NewBinLocationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
  warehouses: PropTypes.array.isRequired,
  onBinLocationCreate: PropTypes.func.isRequired,
};

export default NewBinLocationDialog;
