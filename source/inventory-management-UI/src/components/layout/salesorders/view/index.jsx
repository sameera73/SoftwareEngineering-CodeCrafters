import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import api from "../../../../services/axiosConfig";

function ViewSalesOrder({ open, onClose, orderId }) {
  const initialSalesOrderState = {
    customer_id: "",
    status: "",
    order_date: "",
    notes: "",
    items: [],
  };

  const [salesOrder, setSalesOrder] = useState(initialSalesOrderState);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchSalesOrderDetailsAndCustomers = async () => {
      if (open) {
        try {
          const customersResponse = await api.get("/customers");
          setCustomers(customersResponse.data.customers);

          const itemsResponse = await api.get("/items");
          setItems(itemsResponse.data.items);

          const response = await api.get(`/sales_orders/${orderId}`);
          const { items, sales_order } = response.data;
          setSalesOrder({ ...sales_order[0], items });
        } catch (error) {
          console.error("Failed to fetch sales order details or customers:", error);
        }
      }
    };

    fetchSalesOrderDetailsAndCustomers();
  }, [open, orderId]);

  const findCustomerNameById = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : "Unknown Customer";
  };

  const findItemNameById = (itemId) => {
    const item = items.find((i) => i.id === itemId);
    return item ? item.name : "Unknown Item";
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>View Sales Order</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Customer"
          fullWidth
          value={findCustomerNameById(salesOrder.customer_id)}
          InputProps={{
            readOnly: true,
          }}
          variant="outlined"
        />
        <TextField
          margin="dense"
          label="Status"
          fullWidth
          value={salesOrder.status}
          InputProps={{
            readOnly: true,
          }}
          variant="outlined"
        />
        <TextField
          margin="dense"
          label="Notes"
          fullWidth
          multiline
          minRows={3}
          value={salesOrder.notes}
          InputProps={{
            readOnly: true,
          }}
          variant="outlined"
        />
        {salesOrder.items.map((item, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", width: "100%" }}>
            <TextField
              style={{ flex: 3 }}
              margin="dense"
              label={`Item #${index + 1}`}
              value={`${findItemNameById(item.item_id)} - $${item.price_at_sale}`}
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
            />
            <TextField
              style={{ flex: 1, marginLeft: "10px" }}
              margin="dense"
              label="Quantity"
              value={item.quantity}
              variant="outlined"
              InputProps={{
                readOnly: true,
              }}
            />
          </div>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

ViewSalesOrder.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  orderId: PropTypes.number,
};

export default ViewSalesOrder;
