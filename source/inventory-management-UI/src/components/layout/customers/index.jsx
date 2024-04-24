import { useState, useEffect, useRef } from "react";
import api from "../../../services/axiosConfig";
import { Box, Button } from "@mui/material";
import DataTable from "../DataTable";
import EditCustomerDialog from "./edit";
import NewCustomerDialog from "./new";
import Alert from "@mui/material/Alert";

const Customers = () => {
  const tableRef = useRef();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [currentCustomerId, setCurrentCustomerId] = useState(null);
  const [error, setError] = useState("");

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

  const handleCustomerUpdate = (updatedCustomer) => {
    const updatedCustomers = customers.map((customer) => (customer.id === updatedCustomer.id ? updatedCustomer : customer));
    setCustomers(updatedCustomers);
  };

  const handleNewCustomer = (newCustomer) => {
    setCustomers((prevCustomers) => [...prevCustomers, newCustomer]);
  };

  const editAction = (id) => {
    tableRef.current.closeFunction();
    setCurrentCustomerId(id);
    setIsEditDialogOpen(true);
  };

  const newAction = () => {
    setIsNewDialogOpen(true);
  };

  const deleteAction = async (id) => {
    try {
      tableRef.current.closeFunction();
      await api.delete(`/customers/delete/${id}`);
      setCustomers(customers.filter((customer) => customer.id !== id));
    } catch (error) {
      console.error("Error deleting customer:", error);
      setError("Error: Unable to delete customer. Referenced in another module.");
      setTimeout(() => {
        setError("");
      }, 5000);
    }
  };

  const actionCaller = (actionName, customerId) => {
    if (actionName === "delete") {
      deleteAction(customerId);
    } else if (actionName === "edit") {
      editAction(customerId);
    }
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get("/customers");
        setCustomers(response.data.customers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setLoading(false);
        setError("Error: Unable to fetch customers. Please try again later.");
      }
    };

    fetchCustomers();
  }, []);

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      {error && (
        <Alert
          severity="error"
          style={{
            position: "fixed",
            top: "50px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "fit-content",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
          }}
        >
          {error}
        </Alert>
      )}
      <Box position="absolute" top={0} right={0} mt={2}>
        <Button variant="contained" color="primary" onClick={() => newAction()}>
          Add New Customer
        </Button>
      </Box>
      <h2>Customers</h2>
      <DataTable
        ref={tableRef}
        loading={loading}
        loadingMessage={"Customers are loading"}
        columns={columns}
        data={customers}
        onActionClick={actionCaller}
        searchParam={"name"}
      />
      <EditCustomerDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        customerId={currentCustomerId}
        customers={customers}
        onCustomerUpdate={handleCustomerUpdate}
        fields={fields}
      />
      <NewCustomerDialog
        open={isNewDialogOpen}
        onClose={() => setIsNewDialogOpen(false)}
        onCustomerCreate={handleNewCustomer}
        fields={fields}
      />
    </Box>
  );
};

export default Customers;
