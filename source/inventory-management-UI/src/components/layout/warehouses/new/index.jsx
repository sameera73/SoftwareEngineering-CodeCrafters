import NewTemplate from "../../NewTemplate";
import api from "../../../../services/axiosConfig";
import PropTypes from "prop-types";

function NewWarehouseDialog({ open, fields, onClose, onWarehouseCreate }) {
  const handleCreate = async (newWarehouse) => {
    try {
      const response = await api.post(`/warehouses`, {
        name: newWarehouse.name,
        address: newWarehouse.address,
      });
      newWarehouse.id = response.data.id;
      onWarehouseCreate(newWarehouse);
      onClose();
    } catch (error) {
      console.error("An error occurred while creating the warehouse", error);
    }
  };

  return (
    <>
      <NewTemplate open={open} onClose={onClose} onCreate={handleCreate} fields={fields} creationMessage={"New Warehouse"} />
    </>
  );
}

NewWarehouseDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onWarehouseCreate: PropTypes.func.isRequired,
  fields: PropTypes.array.isRequired,
};

export default NewWarehouseDialog;
