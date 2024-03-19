import NewTemplate from "../../NewTemplate";
import api from "../../../../services/axiosConfig";
import PropTypes from "prop-types";

function NewItemDialog({ open, fields, onClose, onItemCreate }) {
  const handleCreate = async (newItem) => {
    try {
      let date = new Date().toISOString();
      const response = await api.post(`/items/create`, {
        name: newItem.name,
        description: newItem.description,
        price: newItem.price,
        sku: newItem.sku,
        stock: newItem.stock,
        last_modified: date,
      });
      newItem.id = response.data.id;
      newItem.last_modified = new Date(date).toLocaleDateString();
      onItemCreate(newItem);
    } catch (error) {
      console.error("An error occurred while creating the item", error);
    }
  };

  return (
    <>
      <NewTemplate open={open} onClose={onClose} onCreate={handleCreate} fields={fields} creationMessage={"New Item"} />
    </>
  );
}

NewItemDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onItemCreate: PropTypes.func.isRequired,
  fields: PropTypes.array.isRequired,
};

export default NewItemDialog;
