import React from "react";
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from "@mui/material";
import PropTypes from "prop-types";

function EditTemplate({ open, onClose, item, onSave, fields, editMessage }) {
  const [editedItem, setEditedItem] = React.useState(item);

  React.useEffect(() => {
    setEditedItem(item);
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedItem((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    onSave(editedItem);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{editMessage}</DialogTitle>
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
            value={editedItem[field.name]}
            onChange={handleChange}
          />
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

EditTemplate.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  item: PropTypes.any.isRequired,
  onSave: PropTypes.func.isRequired,
  fields: PropTypes.array.isRequired,
  editMessage: PropTypes.string.isRequired,
};

export default EditTemplate;
