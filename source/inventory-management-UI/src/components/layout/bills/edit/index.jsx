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

function EditBill({ open, onClose, onSave, billDetails }) {
  const [bill, setBill] = useState(billDetails);

  useEffect(() => {
    setBill(billDetails);
  }, [billDetails, open]);

  const handleBillChange = (field, value) => {
    setBill((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await api.put(`/bills/${bill.id}`, {
        purchase_order_id: bill.purchase_order_id,
        status: bill.status,
        notes: bill.notes,
      });
      onSave({ ...bill, ...response.data });
    } catch (error) {
      console.error("An error occurred while updating the bill", error);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Bill</DialogTitle>
      <DialogContent>
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
          margin="dense"
          label="Notes"
          variant="outlined"
          value={bill.notes}
          onChange={(e) => handleBillChange("notes", e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

EditBill.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  billDetails: PropTypes.object.isRequired,
};

export default EditBill;
