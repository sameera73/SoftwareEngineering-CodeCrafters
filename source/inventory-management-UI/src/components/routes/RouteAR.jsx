import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import api from "../../services/axiosConfig";

const RouteAR = ({ children }) => {
  const navigate = useNavigate();

  const checkTokenValidity = async () => {
    try {
      const response = await api.get("/auth/isValidToken");
      return response.status === 200;
    } catch (error) {
      return false;
    }
  };

  const RequireAuth = ({ children }) => {
    const [isValid, setIsValid] = React.useState(null);

    React.useEffect(() => {
      const validateToken = async () => {
        const isValidToken = await checkTokenValidity();
        setIsValid(isValidToken);
        if (!isValidToken) {
          navigate("/login");
        }
      };

      validateToken();
    }, []);

    return isValid ? children : null;
  };

  RequireAuth.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return (
    <>
      <RequireAuth>{children}</RequireAuth>
    </>
  );
};

RouteAR.propTypes = {
  children: PropTypes.node.isRequired,
};

export default RouteAR;
