import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";
import TransactionTable from "../components/TransactionTable";
import TransferForm from "../components/TransferForm";
import AIChatPanel from "../components/AIChatPanel";
import { getWalletBalance } from "../api/walletApi";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

/**
 * =========================
 * DASHBOARD COMPONENT
 * =========================
 */
const Dashboard = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  const fetchData = async () => {
    try {
      // ✅ wallet
      const walletRes = await getWalletBalance();
      setBalance(walletRes?.balance || 0);

      // ✅ transactions
      const txRes = await fetch("http://localhost:5000/api/transactions", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      const txData = await txRes.json();

      setTransactions(txData?.data || []);
    } catch (err) {
      console.error("Dashboard error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ chart data
  const chartData = transactions.map((t, i) => ({
    name: `T${i + 1}`,
    amount: Number(t?.amount || 0),
  }));

  return (
    <div className="space-y-10">

      {/* 💰 WALLET */}
      <div className="bg-white p-6 rounded-xl border">
        <p className="text-sm text-gray-500">
          Wallet Balance
        </p>
        <h2 className="text-3xl font-bold mt-2">
          ₹{balance}
        </h2>
      </div>

      {/* 📊 CHART */}
      <div className="bg-white p-6 rounded-xl border">
        <h2 className="text-lg font-semibold mb-6">
          Transaction Trend
        </h2>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#10B981"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 💸 TRANSFER */}
      <TransferForm onSuccess={fetchData} />

      {/* 📜 TRANSACTIONS */}
      <TransactionTable />

      {/* 🤖 AI */}
      <AIChatPanel />

    </div>
  );
};

/**
 * =========================
 * ROUTES
 * =========================
 */
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;