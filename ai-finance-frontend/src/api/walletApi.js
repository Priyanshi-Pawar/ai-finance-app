import API from "./axios";

export const getWalletBalance = async () => {
  const res = await API.get("/wallet/balance");
  return res.data;
};