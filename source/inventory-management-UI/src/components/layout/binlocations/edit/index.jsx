import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, TextField, MenuItem, Button, DialogActions } from "@mui/material";
import api from "../../../../services/axiosConfig";
import PropTypes from "prop-types";

function EditBinLocationDialog({ open, onClose, binLocationId, binLocations, items, warehouses, onBinLocationUpdate }) {
  const [binLocation, setBinLocation] = useState({ item_id: "", warehouse_id: "", bin_location: "", stock: 0 });

  useEffect(() => {
    if (open) {
      const location = binLocations.find((location) => location.id === binLocationId);
      if (location) {
        setBinLocation(location);
      }
    }
  }, [binLocationId, binLocations, open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setBinLocation((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await api.put(`/bin-locations/${binLocationId}`, binLocation);
      onBinLocationUpdate(binLocation);
      onClose();
    } catch (error) {
      console.error("Error updating bin location:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Bin Location</DialogTitle>
      <DialogContent>
        <TextField select label="Item" value={binLocation.item_id} onChange={handleChange} name="item_id" fullWidth margin="dense" disabled>
          {items.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Warehouse"
          value={binLocation.warehouse_id}
          onChange={handleChange}
          name="warehouse_id"
          fullWidth
          disabled
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
          value={binLocation.bin_location}
          onChange={handleChange}
          name="bin_location"
          fullWidth
          margin="dense"
        />
        <TextField label="Stock" type="number" value={binLocation.stock} onChange={handleChange} name="stock" fullWidth margin="dense" />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

EditBinLocationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  binLocationId: PropTypes.number.isRequired,
  binLocations: PropTypes.array.isRequired,
  items: PropTypes.array.isRequired,
  warehouses: PropTypes.array.isRequired,
  onBinLocationUpdate: PropTypes.func.isRequired,
};

export default EditBinLocationDialog;
