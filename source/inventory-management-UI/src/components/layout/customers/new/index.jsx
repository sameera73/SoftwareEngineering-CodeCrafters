import NewTemplate from "../../NewTemplate";
import api from "../../../../services/axiosConfig";
import PropTypes from "prop-types";

function NewCustomerDialog({ open, fields, onClose, onCustomerCreate }) {
  const handleCreate = async (newCustomer) => {
    try {
      const response = await api.post(`/customers/create`, {
        name: newCustomer.name,
        contact_name: newCustomer.contact_name,
        contact_email: newCustomer.contact_email,
        address: newCustomer.address,
        phone: newCustomer.phone,
        previous_orders: 0,
        notes: newCustomer.notes,
      });
      newCustomer.previous_orders = 0;
      newCustomer.id = response.data.id;
      onCustomerCreate(newCustomer);
    } catch (error) {
      console.error("An error occurred while creating the customer", error);
    }
  };

  return (
    <>
      <NewTemplate open={open} onClose={onClose} onCreate={handleCreate} fields={fields} creationMessage={"New Customer"} />
    </>
  );
}

NewCustomerDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onCustomerCreate: PropTypes.func.isRequired,
  fields: PropTypes.array.isRequired,
};

export default NewCustomerDialog;
