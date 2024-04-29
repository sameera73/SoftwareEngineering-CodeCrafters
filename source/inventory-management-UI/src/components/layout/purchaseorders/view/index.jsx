import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import api from "../../../../services/axiosConfig";

function ViewPurchaseOrder({ open, onClose, orderId }) {
  const initialPurchaseOrderState = {
    vendor_id: "",
    status: "",
    order_date: "",
    notes: "",
    items: [],
  };

  const [purchaseOrder, setPurchaseOrder] = useState(initialPurchaseOrderState);
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchPurchaseOrderDetailsAndVendors = async () => {
      if (open) {
        try {
          const vendorsResponse = await api.get("/vendors");
          setVendors(vendorsResponse.data.vendors);

          const itemsResponse = await api.get("/items");
          setItems(itemsResponse.data.items);

          const response = await api.get(`/purchase_orders/${orderId}`);
          const { items, purchase_order } = response.data;
          setPurchaseOrder({ ...purchase_order[0], items });
        } catch (error) {
          console.error("Failed to fetch purchase order details or vendors:", error);
        }
      }
    };

    fetchPurchaseOrderDetailsAndVendors();
  }, [open, orderId]);

  const findVendorNameById = (vendorId) => {
    const vendor = vendors.find((v) => v.id === vendorId);
    return vendor ? vendor.name : "Unknown Vendor";
  };

  const findItemNameById = (itemId) => {
    const item = items.find((i) => i.id === itemId);
    return item ? item.name : "Unknown Item";
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>View Purchase Order</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Vendor"
          fullWidth
          value={findVendorNameById(purchaseOrder.vendor_id)}
          InputProps={{
            readOnly: true,
          }}
          variant="outlined"
        />
        <TextField
          margin="dense"
          label="Status"
          fullWidth
          value={purchaseOrder.status}
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
          value={purchaseOrder.notes}
          InputProps={{
            readOnly: true,
          }}
          variant="outlined"
        />
        {purchaseOrder.items.map((item, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", width: "100%" }}>
            <TextField
              style={{ flex: 3 }}
              margin="dense"
              label={`Item #${index + 1}`}
              value={`${findItemNameById(item.item_id)} - $${item.price_at_purchase}`}
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

ViewPurchaseOrder.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  orderId: PropTypes.number,
};

export default ViewPurchaseOrder;
