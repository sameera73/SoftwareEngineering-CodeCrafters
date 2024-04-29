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
} from "@mui/material";
import api from "../../../../services/axiosConfig";

function EditInvoice({ open, onClose, onSave, invoiceDetails }) {
  const [invoice, setInvoice] = useState(invoiceDetails);

  useEffect(() => {
    setInvoice(invoiceDetails);
  }, [invoiceDetails, open]);

  const handleInvoiceChange = (field, value) => {
    setInvoice((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await api.put(`/invoices/${invoice.id}`, {
        sales_order_id: invoice.sales_order_id,
        status: invoice.status,
        notes: invoice.notes,
      });
      onSave({ ...invoice, ...response.data });
    } catch (error) {
      console.error("An error occurred while updating the invoice", error);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Invoice</DialogTitle>
      <DialogContent>
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
          margin="dense"
          label="Notes"
          variant="outlined"
          value={invoice.notes}
          onChange={(e) => handleInvoiceChange("notes", e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

EditInvoice.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  invoiceDetails: PropTypes.object.isRequired,
};

export default EditInvoice;
