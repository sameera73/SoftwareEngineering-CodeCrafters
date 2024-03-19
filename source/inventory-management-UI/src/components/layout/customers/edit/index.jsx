import { useState, useEffect } from "react";
import EditTemplate from "../../EditTemplate";
import api from "../../../../services/axiosConfig";
import PropTypes from "prop-types";

function EditCustomerDialog({ open, onClose, customerId, fields, customers, onCustomerUpdate }) {
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    if (customers && customerId != null) {
      const foundCustomer = customers.find((customer) => customer.id === customerId);
      setCustomer(foundCustomer);
    }
  }, [customerId, customers]);

  const handleSave = async (editedCustomer) => {
    try {
      await api.put(`/customers/edit/${editedCustomer.id}`, {
        name: editedCustomer.name,
        contact_name: editedCustomer.contact_name,
        contact_email: editedCustomer.contact_email,
        address: editedCustomer.address,
        phone: editedCustomer.phone,
        notes: editedCustomer.notes,
      });
      onCustomerUpdate(editedCustomer);
    } catch (error) {
      console.error("An error occurred while updating the customer", error);
    }
  };

  return (
    <>
      {customerId !== null && customer && (
        <EditTemplate open={open} onClose={onClose} item={customer} onSave={handleSave} fields={fields} editMessage={"Edit Customer"} />
      )}
    </>
  );
}

EditCustomerDialog.propTypes = {
  customerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  customers: PropTypes.array.isRequired,
  onCustomerUpdate: PropTypes.func.isRequired,
  fields: PropTypes.array.isRequired,
};

export default EditCustomerDialog;
