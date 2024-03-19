import { useNavigate, useLocation, Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import Button from "@mui/material/Button";
import RouteAR from "../routes/RouteAR";

const drawerWidth = 240;

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Items", icon: <Inventory2Icon />, path: "/items" },
    { text: "Customers", icon: <PeopleIcon />, path: "/customers" },
    { text: "Vendors", icon: <StorefrontIcon />, path: "/vendors" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <List>
          {menuItems.map((item, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1, padding: 1 }}>
              <Button
                variant="contained"
                color={location.pathname === item.path ? "primary" : "secondary"}
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  justifyContent: "flex-start",
                  width: "100%",
                  backgroundColor: location.pathname === item.path ? undefined : "#ffffff",
                  color: location.pathname === item.path ? undefined : "rgba(0, 0, 0, 0.87)",
                  "&:hover": {
                    backgroundColor: location.pathname === item.path ? undefined : "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                {item.text}
              </Button>
            </Box>
          ))}
          <ListItem disablePadding>
            <Button
              variant="contained"
              color="error"
              startIcon={<ExitToAppIcon />}
              onClick={handleLogout}
              sx={{
                margin: 1,
                width: "calc(100% - 8px)",
              }}
            >
              Logout
            </Button>
          </ListItem>
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}>
        <RouteAR>
          <Outlet />
        </RouteAR>
      </Box>
    </Box>
  );
};

export default Layout;
