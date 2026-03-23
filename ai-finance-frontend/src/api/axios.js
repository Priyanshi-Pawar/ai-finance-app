import axios from "axios";
import { getAccessToken, getRefreshToken, setAccessToken } from "../utils/tokenManager";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

/* Attach Access Token */
API.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* Auto Refresh */
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();

        const res = await axios.post(
          "http://localhost:5000/api/auth/refresh",
          { refreshToken }
        );

        setAccessToken(res.data.accessToken);

        originalRequest.headers.Authorization =
          `Bearer ${res.data.accessToken}`;

        return API(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default API;