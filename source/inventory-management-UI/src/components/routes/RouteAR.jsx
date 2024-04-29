import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import api from "../../services/axiosConfig";
import LoadingComponent from "../layout/LoadingComponent";

const RouteAR = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  const checkTokenValidity = async () => {
    try {
      const response = await api.get("/auth/isValidToken");
      return response.status === 200;
    } catch (error) {
      console.error("Error validating token:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const validateToken = async () => {
      const isValidToken = await checkTokenValidity();
      setIsValid(isValidToken);
      if (!isValidToken) {
        navigate("/login");
      }
    };

    validateToken();
  }, []);

  return (
    <>
      {loading && <LoadingComponent message="Please wait, this can take a while" />}
      {!loading && isValid && children}
    </>
  );
};

RouteAR.propTypes = {
  children: PropTypes.node.isRequired,
};

export default RouteAR;
