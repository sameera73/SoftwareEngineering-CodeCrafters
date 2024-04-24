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
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import api from "../../../../services/axiosConfig";

function NewBill({ open, onClose, onCreate }) {
  const initialBillState = {
    vendor_id: "",
    purchase_order_id: "",
    status: "Pending",
    bill_date: new Date().toISOString(),
    notes: "",
  };
  const [bill, setBill] = useState(initialBillState);
  const [vendors, setVendors] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [availablePurchaseOrders, setAvailablePurchaseOrders] = useState([]);
  const [vendorErrorMessage, setVendorErrorMessage] = useState("");
  const [purchaseOrderErrorMessage, setPurchaseOrderErrorMessage] = useState("");

  useEffect(() => {
    setBill(initialBillState);
    const fetchVendorsAndPO = async () => {
      try {
        const poResponse = await api.get("/purchase_orders");
        setPurchaseOrders(poResponse.data.purchase_orders);

        const vendorsResponse = await api.get("/vendors");
        setVendors(vendorsResponse.data.vendors);
      } catch (error) {
        console.error("Failed to fetch items or vendors:", error);
      }
    };

    fetchVendorsAndPO();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleBillChange = (field, value) => {
    setBill((prevState) => ({
      ...prevState,
      [field]: value,
    }));

    if (field === "vendor_id") {
      const filteredPurchaseOrders = purchaseOrders.filter((po) => po.vendor_id === value);
      setAvailablePurchaseOrders(filteredPurchaseOrders);
      if (!value) {
        setVendorErrorMessage("Please select a vendor");
      } else {
        setVendorErrorMessage("");
      }
    }

    if (field === "purchase_order_id") {
      if (!value) {
        setPurchaseOrderErrorMessage("No purchase orders listed under the selected vendor");
      } else {
        setPurchaseOrderErrorMessage("");
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await api.post(`/bills/create`, bill);
      bill.id = response.data.id;
      bill.amount_due = response.data.amount_due.toFixed(2);
      bill.bill_date = new Date(bill.bill_date).toLocaleDateString();
      onCreate(bill);
    } catch (error) {
      console.error("An error occurred while creating the item", error);
    }

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} style={{ minWidth: "200px" }}>
      <DialogTitle>{"New Bill"}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="dense">
          <InputLabel id="vendor-select-label">Vendor</InputLabel>
          <Select
            labelId="vendor-select-label"
            value={bill.vendor_id}
            label="Vendor"
            onChange={(e) => handleBillChange("vendor_id", e.target.value)}
          >
            {vendors.map((vendor) => (
              <MenuItem key={vendor.id} value={vendor.id}>
                {vendor.name}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText error>{vendorErrorMessage}</FormHelperText>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel id="po-select-label">Purchase Order</InputLabel>
          <Select
            labelId="po-select-label"
            value={bill.purchase_order_id}
            label="Purchase Order"
            onChange={(e) => handleBillChange("purchase_order_id", e.target.value)}
          >
            {bill.vendor_id ? (
              availablePurchaseOrders.length ? (
                availablePurchaseOrders.map((po) => (
                  <MenuItem key={po.id} value={po.id}>
                    {po.id}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="">No purchase orders listed under the selected vendor</MenuItem>
              )
            ) : (
              <MenuItem value="">Please select a vendor first</MenuItem>
            )}
          </Select>
          <FormHelperText error>{purchaseOrderErrorMessage}</FormHelperText>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel id="status-select-label">Status</InputLabel>
          <Select
            labelId="status-select-label"
            value={bill.status}
            label="Status"
            onChange={(e) => handleBillChange("status", e.target.value)}
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Paid">Paid</MenuItem>
          </Select>
        </FormControl>
        <TextField
          fullWidth
          style={{ marginBottom: "10px" }}
          margin="dense"
          label="Notes"
          variant="outlined"
          value={bill.notes}
          onChange={(e) => handleBillChange("notes", e.target.value)}
        />
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Create</Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

NewBill.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default NewBill;
