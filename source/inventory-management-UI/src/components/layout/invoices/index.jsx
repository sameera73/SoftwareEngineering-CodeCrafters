import { useState, useEffect, useRef } from "react";
import api from "../../../services/axiosConfig";
import { Box, Button } from "@mui/material";
import DataTable from "../DataTable";
import NewInvoice from "./new";
import EditInvoice from "./edit";
import Alert from "@mui/material/Alert";

const Invoices = () => {
  const tableRef = useRef();

  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await api.get("/invoices");
        setInvoices(
          response.data.invoices.map((invoice) => ({
            ...invoice,
            invoice_date: new Date(invoice.invoice_date).toLocaleDateString(),
            amount_due: invoice.amount_due.toFixed(2),
          }))
        );
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch Invoices:", error);
        setLoading(false);
        setError("Failed to fetch Invoices. Please try again later.");
      }
    };

    fetchInvoices();
  }, []);

  const columns = [
    { id: "id", label: "ID", sortable: false },
    { id: "customer_id", label: "Customer ID", sortable: false },
    { id: "sales_order_id", label: "Sales Order ID", sortable: false },
    { id: "invoice_date", label: "Invoice Date", sortable: true },
    { id: "amount_due", label: "Amount Due", sortable: false },
    { id: "status", label: "Status", sortable: false },
    { id: "notes", label: "Notes", sortable: false },
  ];

  const handleActionClick = (action, id) => {
    if (action === "delete") {
      deleteAction(id);
    } else if (action === "edit") {
      editAction(id);
    } else if (action === "update") {
      updateAction(id);
    }
  };

  const deleteAction = async (id) => {
    try {
      tableRef.current.closeFunction();
      await api.delete(`/invoices/${id}`);
      setInvoices(invoices.filter((invoice) => invoice.id !== id));
    } catch (error) {
      console.error("Error deleting invoice:", error);
      setError("Failed to delete invoice. Please try again later.");
    }
  };

  const updateAction = async (id) => {
    tableRef.current.closeFunction();
    try {
      const updatedInvoices = await Promise.all(
        invoices.map(async (invoice) => {
          if (invoice.id === id) {
            invoice.invoice_date = new Date().toISOString();
            const res = await api.put(`/invoices/${id}`, invoice);
            invoice.invoice_date = new Date(invoice.invoice_date).toLocaleDateString();
            invoice.amount_due = res.data.amount_due;
            return invoice;
          } else {
            return invoice;
          }
        })
      );
      setInvoices(updatedInvoices);
    } catch (error) {
      console.error("Error updating invoice:", error);
      setError("Failed to update invoice. Please try again later.");
    }
  };

  const handleInvoiceUpdate = (updatedInvoice) => {
    setInvoices(invoices.map((invoice) => (invoice.id === updatedInvoice.id ? updatedInvoice : invoice)));
    setIsEditDialogOpen(false);
  };

  const editAction = (id) => {
    const invoice = invoices.find((invoice) => invoice.id === id);
    setSelectedInvoice(invoice);
    setIsEditDialogOpen(true);
  };

  const newAction = () => {
    setIsNewDialogOpen(true);
  };

  const handleInvoiceCreation = (invoice) => {
    setInvoices((prevInvoices) => [...prevInvoices, invoice]);
  };

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
        <Button variant="contained" color="primary" onClick={newAction}>
          Create Invoice
        </Button>
      </Box>
      <div>
        <h2>Invoices</h2>
        <DataTable
          ref={tableRef}
          columns={columns}
          data={invoices}
          onActionClick={handleActionClick}
          loading={loading}
          loadingMessage="Loading Invoices..."
          searchParam="id"
          actions={["update"]}
        />
      </div>
      <NewInvoice open={isNewDialogOpen} onClose={() => setIsNewDialogOpen(false)} onCreate={handleInvoiceCreation} />
      {selectedInvoice && (
        <EditInvoice
          open={isEditDialogOpen}
          invoiceDetails={selectedInvoice}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={handleInvoiceUpdate}
        />
      )}
    </Box>
  );
};

export default Invoices;
