import { useState } from "react";
import api from "../../services/axiosConfig";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import BusinessIcon from "@mui/icons-material/Business";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const Create = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organization, setOrganization] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/user/createUserAndOrganization", {
        userName,
        userEmail: email,
        userPassword: password,
        organizationName: organization,
      });

      if (response.status === 200) {
        navigate("/login");
      } else {
        setError("Create failed. Please try again.");
        setTimeout(() => {
          setError("");
        }, 5000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Email is already registred");
      setTimeout(() => {
        setError("");
      }, 5000);
      console.error("An error occurred:", error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Create Account
        </Typography>
        <Box component="form" onSubmit={handleCreate} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="User Name"
            name="email"
            autoComplete="email"
            autoFocus
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircleIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="userName"
            label="Email Address"
            name="userName"
            autoComplete="userName"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="organization"
            label="Organization Name"
            name="organization"
            autoComplete="organization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BusinessIcon />
                </InputAdornment>
              ),
            }}
          />
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
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} startIcon={<PersonAddIcon />}>
            Sign Up
          </Button>
          <Button fullWidth variant="outlined" onClick={() => navigate("/login")} startIcon={<ArrowBackIcon />}>
            Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Create;
