import NewTemplate from "../../NewTemplate";
import api from "../../../../services/axiosConfig";
import PropTypes from "prop-types";

function NewVendorDialog({ open, fields, onClose, onVendorCreate }) {
  const handleCreate = async (newVendor) => {
    try {
      const response = await api.post(`/vendors/create`, {
        name: newVendor.name,
        contact_name: newVendor.contact_name,
        contact_email: newVendor.contact_email,
        address: newVendor.address,
        phone: newVendor.phone,
        previous_orders: 0,
        notes: newVendor.notes,
      });
      newVendor.id = response.data.id;
      newVendor.previous_orders = 0;
      onVendorCreate(newVendor);
    } catch (error) {
      console.error("An error occurred while creating the vendor", error);
    }
  };

  return (
    <>
      <NewTemplate open={open} onClose={onClose} onCreate={handleCreate} fields={fields} creationMessage={"New Vendor"} />
    </>
  );
}

NewVendorDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onVendorCreate: PropTypes.func.isRequired,
  fields: PropTypes.array.isRequired,
};

export default NewVendorDialog;
