import API from "../services/api";

export const loginUser = async (email, password) => {
  const res = await API.post("/auth/login", { email, password });

  // ✅ FIX: match backend response
  return {
    accessToken: res.data.accessToken,
    refreshToken: res.data.refreshToken,
  };
};

export const getCurrentUser = async () => {
  const res = await API.get("/auth/me");
  return res.data;
};

export const logoutUser = async () => {
  return API.post("/auth/logout");
};