import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import HomeIcon from "@mui/icons-material/Home";

const NotFound = () => {
  const navigate = useNavigate();
  const text = "We can't seem to find the page you're looking for.";
  return (
    <Container maxWidth="sm" style={{ textAlign: "center", marginTop: "100px" }}>
      <Typography variant="h3" gutterBottom>
        Oops! Page Not Found.
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        {text}
      </Typography>
      <Button variant="contained" color="primary" startIcon={<HomeIcon />} onClick={() => navigate("/")}>
        Go Back Home
      </Button>
    </Container>
  );
};

export default NotFound;
