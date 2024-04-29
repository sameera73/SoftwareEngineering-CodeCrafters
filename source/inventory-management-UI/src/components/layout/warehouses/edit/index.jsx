import { useState, useEffect } from "react";
import EditTemplate from "../../EditTemplate";
import api from "../../../../services/axiosConfig";
import PropTypes from "prop-types";

function EditWarehouseDialog({ open, onClose, warehouseId, fields, warehouses, onWarehouseUpdate }) {
  const [warehouse, setWarehouse] = useState(null);

  useEffect(() => {
    if (warehouses && warehouseId != null) {
      const foundWarehouse = warehouses.find((wh) => wh.id === warehouseId);
      setWarehouse(foundWarehouse);
    }
  }, [warehouseId, warehouses]);

  const handleSave = async (editedWarehouse) => {
    try {
      await api.put(`/warehouses/${editedWarehouse.id}`, {
        name: editedWarehouse.name,
        address: editedWarehouse.address,
        manager: editedWarehouse.manager,
      });
      onWarehouseUpdate(editedWarehouse);
      onClose();
    } catch (error) {
      console.error("An error occurred while updating the warehouse", error);
    }
  };

  return (
    <>
      {warehouseId !== null && warehouse && (
        <EditTemplate open={open} onClose={onClose} item={warehouse} onSave={handleSave} fields={fields} editMessage={"Edit Warehouse"} />
      )}
    </>
  );
}

EditWarehouseDialog.propTypes = {
  warehouseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  warehouses: PropTypes.array.isRequired,
  onWarehouseUpdate: PropTypes.func.isRequired,
  fields: PropTypes.array.isRequired,
};

export default EditWarehouseDialog;
