import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import api from "../../services/axiosConfig";

const RouteNAR = ({ children }) => {
  const navigate = useNavigate();

  const checkTokenValidity = async () => {
    try {
      const response = await api.get("/auth/isValidToken");
      return response.status === 200;
    } catch (error) {
      return false;
    }
  };

  const RequireNoAuth = ({ children }) => {
    const [isValid, setIsValid] = React.useState(null);

    React.useEffect(() => {
      const validateToken = async () => {
        const isValidToken = await checkTokenValidity();
        setIsValid(isValidToken);
        if (isValidToken) {
          navigate("/");
        }
      };

      validateToken();
    }, []);

    return !isValid ? children : null;
  };

  RequireNoAuth.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return (
    <>
      <RequireNoAuth>{children}</RequireNoAuth>
    </>
  );
};

RouteNAR.propTypes = {
  children: PropTypes.node.isRequired,
};

export default RouteNAR;
