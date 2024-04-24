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

function NewInvoice({ open, onClose, onCreate }) {
  const initialInvoiceState = {
    customer_id: "",
    sales_order_id: "",
    status: "Pending",
    invoice_date: new Date().toISOString(),
    notes: "",
  };
  const [invoice, setInvoice] = useState(initialInvoiceState);
  const [customers, setCustomers] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [availableSalesOrders, setAvailableSalesOrders] = useState([]);
  const [customerErrorMessage, setCustomerErrorMessage] = useState("");
  const [salesOrderErrorMessage, setSalesOrderErrorMessage] = useState("");

  useEffect(() => {
    setInvoice(initialInvoiceState);
    const fetchCustomersAndSO = async () => {
      try {
        const soResponse = await api.get("/sales_orders");
        setSalesOrders(soResponse.data.sales_orders);

        const customersResponse = await api.get("/customers");
        setCustomers(customersResponse.data.customers);
      } catch (error) {
        console.error("Failed to fetch items or customers:", error);
      }
    };

    fetchCustomersAndSO();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleInvoiceChange = (field, value) => {
    setInvoice((prevState) => ({
      ...prevState,
      [field]: value,
    }));

    if (field === "customer_id") {
      const filteredSalesOrders = salesOrders.filter((so) => so.customer_id === value);
      setAvailableSalesOrders(filteredSalesOrders);
      if (!value) {
        setCustomerErrorMessage("Please select a customer");
      } else {
        setCustomerErrorMessage("");
      }
    }

    if (field === "sales_order_id") {
      if (!value) {
        setSalesOrderErrorMessage("No sales orders listed under the selected customer");
      } else {
        setSalesOrderErrorMessage("");
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await api.post(`/invoices/create`, invoice);
      invoice.id = response.data.id;
      invoice.amount_due = response.data.amount_due.toFixed(2);
      invoice.invoice_date = new Date(invoice.invoice_date).toLocaleDateString();
      onCreate(invoice);
    } catch (error) {
      console.error("An error occurred while creating the invoice", error);
    }

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} style={{ minWidth: "200px" }}>
      <DialogTitle>{"New Invoice"}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="dense">
          <InputLabel id="customer-select-label">Customer</InputLabel>
          <Select
            labelId="customer-select-label"
            value={invoice.customer_id}
            label="Customer"
            onChange={(e) => handleInvoiceChange("customer_id", e.target.value)}
          >
            {customers.map((customer) => (
              <MenuItem key={customer.id} value={customer.id}>
                {customer.name}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText error>{customerErrorMessage}</FormHelperText>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel id="so-select-label">Sales Order</InputLabel>
          <Select
            labelId="so-select-label"
            value={invoice.sales_order_id}
            label="Sales Order"
            onChange={(e) => handleInvoiceChange("sales_order_id", e.target.value)}
          >
            {invoice.customer_id ? (
              availableSalesOrders.length ? (
                availableSalesOrders.map((so) => (
                  <MenuItem key={so.id} value={so.id}>
                    {so.id}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="">No sales orders listed under the selected customer</MenuItem>
              )
            ) : (
              <MenuItem value="">Please select a customer first</MenuItem>
            )}
          </Select>
          <FormHelperText error>{salesOrderErrorMessage}</FormHelperText>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel id="status-select-label">Status</InputLabel>
          <Select
            labelId="status-select-label"
            value={invoice.status}
            label="Status"
            onChange={(e) => handleInvoiceChange("status", e.target.value)}
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
          value={invoice.notes}
          onChange={(e) => handleInvoiceChange("notes", e.target.value)}
        />
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Create</Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

NewInvoice.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default NewInvoice;
