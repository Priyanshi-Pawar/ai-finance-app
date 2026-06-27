import API from "../services/api";

export const loginUser = async (identifier, password) => {
  const res = await API.post("/auth/login", { email: identifier, password });

  console.log("LOGIN RAW:", res.data);

  // ✅ SAFE ACCESS
  return {
    accessToken: res?.data?.data?.accessToken,
    refreshToken: res?.data?.data?.refreshToken,
  };
};

export const registerUser = async (name, password) => {
  const res = await API.post("/auth/register", {
    email: name,
    password,
  });

  console.log("REGISTER RAW:", res.data);

  return res.data;
};

export const getCurrentUser = async () => {
  const res = await API.get("/auth/me");
  return res.data;
};

export const logoutUser = async () => {
  return API.post("/auth/logout");
};
