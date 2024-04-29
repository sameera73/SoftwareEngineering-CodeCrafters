import axios from "axios";

const redirectToLogin = () => {
  window.location = "/login";
};

var api = axios.create({
  baseURL: `${window.location.protocol}//${window.location.hostname}:3000`,
  timeout: 100000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["x-access-token"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response.status === 440) {
      localStorage.removeItem("token");
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);

export default api;
