import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Select,
  MenuItem,
  IconButton,
  FormControl,
  InputLabel,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import api from "../../../../services/axiosConfig";

function NewPurchaseOrder({ open, onClose, onCreate }) {
  const initialPurchaseOrderState = {
    vendor_id: "",
    status: "Pending",
    order_date: new Date().toISOString(),
    notes: "",
    items: [{ item_id: "", quantity: "", price_at_purchase: "" }],
  };

  const [purchaseOrder, setPurchaseOrder] = useState(initialPurchaseOrderState);
  const [availableItems, setAvailableItems] = useState([]);
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    setPurchaseOrder(initialPurchaseOrderState);
    const fetchItemsAndVendors = async () => {
      try {
        const itemsResponse = await api.get("/items");
        setAvailableItems(itemsResponse.data.items);

        const vendorsResponse = await api.get("/vendors");
        setVendors(vendorsResponse.data.vendors);
      } catch (error) {
        console.error("Failed to fetch items or vendors:", error);
      }
    };

    fetchItemsAndVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handlePurchaseOrderChange = (field, value) => {
    setPurchaseOrder((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...purchaseOrder.items];
    newItems[index][field] = value;
    setPurchaseOrder((prevState) => ({
      ...prevState,
      items: newItems,
    }));
  };

  const handleAddItem = () => {
    setPurchaseOrder((prevState) => ({
      ...prevState,
      items: [...prevState.items, { item_id: "", quantity: "", price_at_purchase: "" }],
    }));
  };

  const handleRemoveItem = (index) => {
    const newItems = purchaseOrder.items.filter((_, i) => i !== index);
    setPurchaseOrder((prevState) => ({
      ...prevState,
      items: newItems,
    }));
  };

  const handleSubmit = async () => {
    const { items, ...purchaseOrderWithoutItems } = purchaseOrder;
    try {
      const response = await api.post(`/purchase_orders/create`, {
        ...purchaseOrderWithoutItems,
        items,
      });
      purchaseOrderWithoutItems.id = response.data.id;
      purchaseOrderWithoutItems.order_date = new Date(purchaseOrderWithoutItems.order_date).toLocaleDateString();
      onCreate(purchaseOrderWithoutItems);
    } catch (error) {
      console.error("An error occurred while creating the item", error);
    }

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{"New Purchase Order"}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="dense">
          <InputLabel id="vendor-select-label">Vendor</InputLabel>
          <Select
            labelId="vendor-select-label"
            value={purchaseOrder.vendor_id}
            label="Vendor"
            onChange={(e) => handlePurchaseOrderChange("vendor_id", e.target.value)}
          >
            {vendors.map((vendor) => (
              <MenuItem key={vendor.id} value={vendor.id}>
                {vendor.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel id="status-select-label">Status</InputLabel>
          <Select
            labelId="status-select-label"
            value={purchaseOrder.status}
            label="Status"
            onChange={(e) => handlePurchaseOrderChange("status", e.target.value)}
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        </FormControl>
        <TextField
          fullWidth
          style={{ marginBottom: "10px" }}
          margin="dense"
          label="Notes"
          variant="outlined"
          value={purchaseOrder.notes}
          onChange={(e) => handlePurchaseOrderChange("notes", e.target.value)}
        />
        {purchaseOrder.items.map((item, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <FormControl fullWidth>
              <InputLabel id={`item-select-label-${index}`}>{`Item #${index + 1}`}</InputLabel>
              <Select
                value={item.item_id}
                labelId={`item-select-label-${index}`}
                label={`Item #${index + 1}`}
                onChange={(e) => handleItemChange(index, "item_id", e.target.value)}
              >
                <MenuItem disabled value="">
                  Select an item
                </MenuItem>
                {availableItems.map((availableItem) => (
                  <MenuItem key={availableItem.id} value={availableItem.id}>
                    {availableItem.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              type="number"
              label="Quantity"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
              variant="outlined"
            />
            <TextField
              type="number"
              label="Price"
              value={item.price_at_purchase}
              onChange={(e) => handleItemChange(index, "price_at_purchase", e.target.value)}
              variant="outlined"
            />
            {index > 0 && (
              <IconButton onClick={() => handleRemoveItem(index)}>
                <RemoveCircleOutlineIcon />
              </IconButton>
            )}
          </div>
        ))}
        <IconButton onClick={handleAddItem}>
          <AddCircleOutlineIcon />
        </IconButton>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Create</Button>
      </DialogActions>
    </Dialog>
  );
}

NewPurchaseOrder.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default NewPurchaseOrder;
