import { Navigate, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";
import TransactionTable from "../components/TransactionTable";
import TransferForm from "../components/TransferForm";
import AIChatPanel from "../components/AIChatPanel";
import ProtectedRoute from "../components/ProtectedRoute";
import LoginPage from "../pages/LoginPage";
import { getWalletBalance } from "../api/walletApi";
import API from "../services/api";

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
      const walletBalance = await getWalletBalance();
      setBalance(walletBalance || 0);

      // ✅ transactions
      const txRes = await API.get("/transactions");
      setTransactions(txRes?.data?.data?.transactions || []);
    } catch (err) {
      console.error("Dashboard error:", err);
    }
  };

  useEffect(() => {
    let active = true;

    const loadDashboardData = async () => {
      try {
        // ✅ wallet
        const walletBalance = await getWalletBalance();
        if (!active) return;
        setBalance(walletBalance || 0);

        // ✅ transactions
        const txRes = await API.get("/transactions");
        if (!active) return;
        setTransactions(txRes?.data?.data?.transactions || []);
      } catch (err) {
        if (active) {
          console.error("Dashboard error:", err);
        }
      }
    };

    void loadDashboardData();

    return () => {
      active = false;
    };
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

const AnalyticsPage = () => (
  <div className="rounded-xl border bg-white p-6 shadow-sm">
    <h2 className="text-xl font-semibold text-slate-900">Analytics</h2>
    <p className="mt-2 text-sm text-slate-500">
      Your analytics overview can live here.
    </p>
  </div>
);

const SettingsPage = () => (
  <div className="rounded-xl border bg-white p-6 shadow-sm">
    <h2 className="text-xl font-semibold text-slate-900">Settings</h2>
    <p className="mt-2 text-sm text-slate-500">
      Account and dashboard preferences can live here.
    </p>
  </div>
);

/**
 * =========================
 * ROUTES
 * =========================
 */
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;