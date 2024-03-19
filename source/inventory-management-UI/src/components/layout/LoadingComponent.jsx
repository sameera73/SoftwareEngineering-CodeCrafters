import { Box, CircularProgress, Typography } from "@mui/material";

// eslint-disable-next-line react/prop-types
const LoadingComponent = ({ message }) => (
  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="75vh">
    <CircularProgress />
    <Typography variant="h6" sx={{ marginTop: 2 }}>
      {message}
    </Typography>
  </Box>
);

export default LoadingComponent;
