import { useState, useEffect } from "react";
import EditTemplate from "../../EditTemplate";
import api from "../../../../services/axiosConfig";
import PropTypes from "prop-types";

function EditItemDialog({ open, onClose, itemId, fields, items, onItemUpdate }) {
  const [item, setItem] = useState(null);

  useEffect(() => {
    if (items && itemId != null) {
      const foundItem = items.find((item) => item.id === itemId);
      setItem(foundItem);
    }
  }, [itemId, items]);

  const handleSave = async (editedItem) => {
    try {
      await api.put(`/items/edit/${editedItem.id}`, {
        name: editedItem.name,
        description: editedItem.description,
        price: editedItem.price,
        sku: editedItem.sku,
        stock: editedItem.stock,
        last_modified: new Date().toISOString(),
      });
      onItemUpdate(editedItem);
    } catch (error) {
      console.error("An error occurred while updating the item", error);
    }
  };

  return (
    <>
      {itemId !== null && item && (
        <EditTemplate open={open} onClose={onClose} item={item} onSave={handleSave} fields={fields} editMessage={"Edit Item"} />
      )}
    </>
  );
}

EditItemDialog.propTypes = {
  itemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
  onItemUpdate: PropTypes.func.isRequired,
  fields: PropTypes.array.isRequired,
};

export default EditItemDialog;
