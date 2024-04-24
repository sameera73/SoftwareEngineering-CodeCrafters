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

function EditSalesOrder({ open, onClose, onUpdate, orderId }) {
  const initialSalesOrderState = {
    customer_id: "",
    status: "Pending",
    order_date: "",
    notes: "",
    items: [{ item_id: "", quantity: "", price_at_sale: "" }],
  };
  const [salesOrder, setSalesOrder] = useState(initialSalesOrderState);
  const [availableItems, setAvailableItems] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchItemsAndCustomers = async () => {
      try {
        const itemsResponse = await api.get("/items");
        setAvailableItems(itemsResponse.data.items);

        const customersResponse = await api.get("/customers");
        setCustomers(customersResponse.data.customers);
      } catch (error) {
        console.error("Failed to fetch items or customers:", error);
      }
    };

    const fetchSalesOrderDetails = async () => {
      try {
        const response = await api.get(`/sales_orders/${orderId}`);
        const { items, sales_order } = response.data;
        setSalesOrder({ ...sales_order[0], items });
      } catch (error) {
        console.error(`Failed to fetch sales order ${orderId}:`, error);
      }
    };

    if (open) {
      fetchItemsAndCustomers();
      fetchSalesOrderDetails();
    }
  }, [open, orderId]);

  const handleSalesOrderChange = (field, value) => {
    setSalesOrder((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...salesOrder.items];
    newItems[index][field] = value;

    if (field === "item_id") {
      const selectedItem = availableItems.find((item) => item.id === value);
      if (selectedItem) {
        newItems[index]["price_at_sale"] = selectedItem.price;
      }
    }

    setSalesOrder((prevState) => ({
      ...prevState,
      items: newItems,
    }));
  };

  const handleAddItem = () => {
    setSalesOrder((prevState) => ({
      ...prevState,
      items: [...prevState.items, { item_id: "", quantity: "", price_at_sale: "" }],
    }));
  };

  const handleRemoveItem = (index) => {
    const newItems = salesOrder.items.filter((_, i) => i !== index);
    setSalesOrder((prevState) => ({
      ...prevState,
      items: newItems,
    }));
  };

  const handleSubmit = async () => {
    try {
      const { items, ...salesOrderWithoutItems } = salesOrder;
      await api.put(`/sales_orders/${orderId}`, {
        ...salesOrderWithoutItems,
        items,
      });
      salesOrderWithoutItems.order_date = new Date(salesOrderWithoutItems.order_date).toLocaleDateString();
      onUpdate(salesOrderWithoutItems);
    } catch (error) {
      console.error("An error occurred while updating the order", error);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Sales Order</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="dense">
          <InputLabel id="customer-select-label">Customer</InputLabel>
          <Select
            labelId="customer-select-label"
            value={salesOrder.customer_id}
            label="Customer"
            onChange={(e) => handleSalesOrderChange("customer_id", e.target.value)}
            disabled
          >
            {customers.map((customer) => (
              <MenuItem key={customer.id} value={customer.id}>
                {customer.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel id="status-select-label">Status</InputLabel>
          <Select
            labelId="status-select-label"
            value={salesOrder.status}
            label="Status"
            onChange={(e) => handleSalesOrderChange("status", e.target.value)}
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
          value={salesOrder.notes}
          onChange={(e) => handleSalesOrderChange("notes", e.target.value)}
        />
        {salesOrder.items.map((item, index) => (
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
                    {`${availableItem.name} - $${availableItem.price}`}
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
        <Button onClick={handleSubmit}>Update</Button>
      </DialogActions>
    </Dialog>
  );
}

EditSalesOrder.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  orderId: PropTypes.number,
};

export default EditSalesOrder;
