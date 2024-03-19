import { useState, useEffect, useRef } from "react";
import api from "../../../services/axiosConfig";
import { Box, Button } from "@mui/material";
import DataTable from "../DataTable";
import EditVendorDialog from "./edit";
import NewVendorDialog from "./new";

const Vendors = () => {
  const tableRef = useRef();

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [currentVendorId, setCurrentVendorId] = useState(null);

  const columns = [
    { id: "id", label: "ID", sortable: false },
    { id: "name", label: "Name", sortable: true },
    { id: "contact_name", label: "Contact Name", sortable: false },
    { id: "contact_email", label: "Contact Email", sortable: true },
    { id: "address", label: "Address", sortable: false },
    { id: "phone", label: "Phone", sortable: true },
    { id: "previous_orders", label: "Previous Orders", sortable: true },
    { id: "notes", label: "Notes", sortable: false },
  ];

  const fields = [
    { name: "name", label: "Name", type: "text" },
    { name: "contact_name", label: "Contact Name", type: "text" },
    { name: "contact_email", label: "Contact Email", type: "email" },
    { name: "address", label: "Address", type: "text" },
    { name: "phone", label: "Phone", type: "text" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  const handleVendorUpdate = (updatedVendor) => {
    const updatedVendors = vendors.map((vendor) => (vendor.id === updatedVendor.id ? updatedVendor : vendor));
    setVendors(updatedVendors);
  };

  const handleNewVendor = (newVendor) => {
    setVendors((prevVendors) => [...prevVendors, newVendor]);
  };

  const editAction = (id) => {
    tableRef.current.closeFunction();
    setCurrentVendorId(id);
    setIsEditDialogOpen(true);
  };

  const newAction = () => {
    setIsNewDialogOpen(true);
  };

  const deleteAction = async (id) => {
    try {
      tableRef.current.closeFunction();
      await api.delete(`/vendors/delete/${id}`);
      setVendors(vendors.filter((vendor) => vendor.id !== id));
    } catch (error) {
      console.error("Error deleting vendor:", error);
    }
  };

  const actionCaller = (actionName, vendorId) => {
    if (actionName === "delete") {
      deleteAction(vendorId);
    } else if (actionName === "edit") {
      editAction(vendorId);
    }
  };

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await api.get("/vendors");
        setVendors(response.data.vendors);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching vendors:", error);
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <Box position="absolute" top={0} right={0} mt={2}>
        <Button variant="contained" color="primary" onClick={() => newAction()}>
          Add New Vendor
        </Button>
      </Box>
      <DataTable
        ref={tableRef}
        loading={loading}
        loadingMessage={"Vendors are loading"}
        columns={columns}
        data={vendors}
        onActionClick={actionCaller}
        searchParam={"name"}
      />
      <EditVendorDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        vendorId={currentVendorId}
        vendors={vendors}
        onVendorUpdate={handleVendorUpdate}
        fields={fields}
      />
      <NewVendorDialog open={isNewDialogOpen} onClose={() => setIsNewDialogOpen(false)} onVendorCreate={handleNewVendor} fields={fields} />
    </Box>
  );
};

export default Vendors;
