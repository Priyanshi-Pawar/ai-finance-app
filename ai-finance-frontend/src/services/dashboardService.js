import API from "./api";

export const getDashboardStats = async () => {
  // For now we simulate backend delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalBalance: 24560,
        monthlyRevenue: 8240,
        investments: 12300,
      });
    }, 800);
  });
};