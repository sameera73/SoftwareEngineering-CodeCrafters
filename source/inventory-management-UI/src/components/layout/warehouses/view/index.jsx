import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import api from "../../../../services/axiosConfig";

// eslint-disable-next-line react/prop-types
function WarehouseDetailsDialog({ open, onClose, warehouseId }) {
  const [itemsDetails, setItemsDetails] = useState([]);

  useEffect(() => {
    const fetchItemDetails = async (itemIds) => {
      try {
        const responses = await Promise.all(itemIds.map((itemId) => api.get(`/items/details/${itemId}`)));
        return responses.map((res) => res.data);
      } catch (error) {
        console.error("Error fetching item details:", error);
        return [];
      }
    };

    const fetchBinLocations = async () => {
      try {
        const response = await api.get(`/bin-locations`);
        const binLocations = response.data.data.filter((loc) => loc.warehouse_id === warehouseId);
        const itemIds = binLocations.map((loc) => loc.item_id);
        const itemsDetails = await fetchItemDetails(itemIds);
        const itemsWithLocation = itemsDetails.map((item, index) => ({
          ...item,
          bin_location: binLocations[index].bin_location,
        }));
        setItemsDetails(itemsWithLocation);
      } catch (error) {
        console.error("Error fetching bin locations for warehouse:", error);
        setItemsDetails([]);
      }
    };

    if (warehouseId) fetchBinLocations();
  }, [warehouseId]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Items in Warehouse</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item ID</TableCell>
                <TableCell>Item Name</TableCell>
                <TableCell>Bin Location</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {itemsDetails.length > 0 ? (
                itemsDetails.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.bin_location}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3}>No items found in this warehouse.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default WarehouseDetailsDialog;
