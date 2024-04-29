import { useState, useEffect } from "react";
import EditTemplate from "../../EditTemplate";
import api from "../../../../services/axiosConfig";
import PropTypes from "prop-types";

function EditVendorDialog({ open, onClose, vendorId, fields, vendors, onVendorUpdate }) {
  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    if (vendors && vendorId != null) {
      const foundVendor = vendors.find((vendor) => vendor.id === vendorId);
      setVendor(foundVendor);
    }
  }, [vendorId, vendors]);

  const handleSave = async (editedVendor) => {
    try {
      await api.put(`/vendors/edit/${editedVendor.id}`, {
        name: editedVendor.name,
        contact_name: editedVendor.contact_name,
        contact_email: editedVendor.contact_email,
        address: editedVendor.address,
        phone: editedVendor.phone,
        notes: editedVendor.notes,
      });
      onVendorUpdate(editedVendor);
    } catch (error) {
      console.error("An error occurred while updating the vendor", error);
    }
  };

  return (
    <>
      {vendorId !== null && vendor && (
        <EditTemplate open={open} onClose={onClose} item={vendor} onSave={handleSave} fields={fields} editMessage={"Edit Vendor"} />
      )}
    </>
  );
}

EditVendorDialog.propTypes = {
  vendorId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  vendors: PropTypes.array.isRequired,
  onVendorUpdate: PropTypes.func.isRequired,
  fields: PropTypes.array.isRequired,
};

export default EditVendorDialog;
