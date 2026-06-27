import API from "../services/api";

export const getTransactions = async () => {
  const res = await API.get("/transactions");
  return res?.data?.data?.transactions || [];
};
