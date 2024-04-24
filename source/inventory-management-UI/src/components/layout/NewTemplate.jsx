import { useEffect, useState, useCallback } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from "@mui/material";
import PropTypes from "prop-types";

function NewItemTemplate({ open, onClose, onCreate, fields, creationMessage }) {
  const initializeNewItem = useCallback(
    () =>
      fields.reduce((acc, field) => {
        acc[field.name] = "";
        return acc;
      }, {}),
    [fields]
  );

  const [newItem, setNewItem] = useState(initializeNewItem());
  useEffect(() => {
    setNewItem(initializeNewItem());
  }, [fields, open, initializeNewItem]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    onCreate(newItem);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{creationMessage}</DialogTitle>
      <DialogContent>
        {fields.map((field) => (
          <TextField
            key={field.name}
            margin="dense"
            name={field.name}
            label={field.label}
            type={field.type}
            fullWidth
            variant="outlined"
            value={newItem[field.name] || ""}
            onChange={handleChange}
          />
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Create</Button>
      </DialogActions>
    </Dialog>
  );
}

NewItemTemplate.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  fields: PropTypes.array.isRequired,
  creationMessage: PropTypes.string.isRequired,
};

export default NewItemTemplate;
