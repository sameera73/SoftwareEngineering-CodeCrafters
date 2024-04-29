import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/axiosConfig";
import { Button, CircularProgress, Grid } from "@mui/material";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import InputAdornment from "@mui/material/InputAdornment";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Alert from "@mui/material/Alert";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [severity, setSeverity] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setSeverity("info");
      setError("Please wait loading... This might take a while");
      const response = await api.post("/auth/login", {
        email,
        password,
      });
      if (response.status === 200) {
        const { token } = response.data;
        localStorage.setItem("token", token);
        navigate("/");
      }
    } catch (error) {
      if (error.response.status === 401) {
        setSeverity("error");
        setError("Login failed. Please check your credentials and try again.");
      } else {
        setSeverity("error");
        setError(error.response.data.message);
      }
    } finally {
      setTimeout(() => {
        setError("");
      }, 5000);
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
          Login
        </Typography>
        {error && (
          <Alert
            severity={severity}
            style={{
              position: "fixed",
              top: "50px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "fit-content",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          >
            {severity === "info" && (
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <CircularProgress style={{ verticalAlign: "middle" }} size={15} />
                </Grid>
                <Grid item>{error}</Grid>
              </Grid>
            )}
            {severity === "error" && error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
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
            variant="outlined"
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
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} startIcon={<LoginIcon />}>
            Login
          </Button>
          <Button fullWidth variant="outlined" sx={{ mt: 3, mb: 2 }} startIcon={<PersonAddIcon />} onClick={() => navigate("/signup")}>
            SignUp
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
