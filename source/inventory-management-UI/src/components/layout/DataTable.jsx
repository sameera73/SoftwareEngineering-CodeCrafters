import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Menu,
  MenuItem,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  TextField,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PropTypes from "prop-types";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UpdateIcon from "@mui/icons-material/Update";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LoadingComponent from "./LoadingComponent";

const DataTable = forwardRef(({ columns, data, onActionClick, loading, loadingMessage, searchParam, actions = [] }, ref) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [searchText, setSearchText] = useState("");
  const [filteredItems, setFilteredItems] = useState(data);

  const [anchorEl, setAnchorEl] = useState(null);
  const [currentItemId, setCurrentItemId] = useState(null);

  useImperativeHandle(ref, () => ({
    closeFunction() {
      handleClose();
    },
  }));

  useEffect(() => {
    const filteredData = data.filter((item) => item[searchParam].toString().toLowerCase().includes(searchText.toLowerCase()));
    setFilteredItems(filteredData);
  }, [searchText, data, searchParam]);

  const handleClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setCurrentItemId(id);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setCurrentItemId(null);
  };

  const sortData = (key) => {
    if (sortConfig.key === key && sortConfig.direction === "descending") {
      setSortConfig({ key, direction: "ascending" });
    } else if (sortConfig.key === key && sortConfig.direction === "ascending") {
      setSortConfig({ key: null, direction: null });
    } else {
      setSortConfig({ key, direction: "descending" });
    }
  };

  useEffect(() => {
    if (sortConfig.key !== null && sortConfig.direction !== null) {
      const sortedItems = [...filteredItems].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
      setFilteredItems(sortedItems);
    } else {
      setFilteredItems(filteredItems);
    }
  }, [sortConfig, filteredItems]);

  return (
    <>
      {loading === true && <LoadingComponent message={loadingMessage} />}
      {loading === false && (
        <>
          <div style={{ width: "40%" }}>
            <TextField
              label="Search"
              variant="outlined"
              fullWidth
              margin="normal"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <TableContainer component={Paper}>
            <Table aria-label="data table">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      onClick={() => column.sortable && sortData(column.id)}
                      style={{ cursor: column.sortable ? "pointer" : "default" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <b>{column.label}</b>
                        {column.sortable &&
                          sortConfig.key === column.id &&
                          (sortConfig.direction === "ascending" ? (
                            <ArrowUpwardIcon sx={{ fontSize: "small" }} />
                          ) : sortConfig.direction === "descending" ? (
                            <ArrowDownwardIcon sx={{ fontSize: "small" }} />
                          ) : null)}
                      </div>
                    </TableCell>
                  ))}
                  <TableCell>
                    <b>Actions</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.map((item, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell key={column.id}>{item[column.id]}</TableCell>
                    ))}
                    <TableCell>
                      <IconButton onClick={(event) => handleClick(event, item.id)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu id="action-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                        {!actions.includes("noedit") && (
                          <MenuItem onClick={() => onActionClick("edit", currentItemId)}>
                            <EditIcon sx={{ fontSize: "medium" }} />
                          </MenuItem>
                        )}
                        <MenuItem onClick={() => onActionClick("delete", currentItemId)}>
                          <DeleteIcon sx={{ fontSize: "medium" }} />
                        </MenuItem>
                        {actions.includes("details") && (
                          <MenuItem onClick={() => onActionClick("viewDetails", currentItemId)}>
                            <VisibilityIcon sx={{ fontSize: "medium" }} />
                          </MenuItem>
                        )}
                        {actions.includes("update") && (
                          <MenuItem onClick={() => onActionClick("update", currentItemId)}>
                            <UpdateIcon sx={{ fontSize: "medium" }} />
                          </MenuItem>
                        )}
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      {loading === false && filteredItems.length === 0 && (
        <Typography
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "2rem",
            color: "primary.main",
            textTransform: "uppercase",
            padding: "1em 0",
            letterSpacing: "0.1em",
          }}
        >
          Nothing Found
        </Typography>
      )}
    </>
  );
});

DataTable.displayName = "DataTable";

DataTable.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  onActionClick: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  loadingMessage: PropTypes.string,
  searchParam: PropTypes.string.isRequired,
  actions: PropTypes.array,
};

export default DataTable;
