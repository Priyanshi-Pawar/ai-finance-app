import axios from "axios";
import { getAccessToken } from "../utils/tokenManager";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// ✅ Attach token to every request
API.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;