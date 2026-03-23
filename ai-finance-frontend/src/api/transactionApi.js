import API from "../services/apis";

export const getTransactions = async () => {
  const res = await API.get("/transactions");
  return res.data.data.transactions;
};