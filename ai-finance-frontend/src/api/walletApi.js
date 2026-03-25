import API from "../services/api";

export const getWalletBalance = async () => {
  const res = await API.get("/wallet/balance");
  return res.data.balance;
};