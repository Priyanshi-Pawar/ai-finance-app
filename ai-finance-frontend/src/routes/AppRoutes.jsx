import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import AIChatPanel from "../components/AIChatPanel";
import TransferForm from "../components/TransferForm";
import TransactionTable from "../components/TransactionTable";

import { useAuth } from "../context/AuthContext";
import { getWalletBalance } from "../api/walletApi";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";


/* ------------------ Chart Data ------------------ */

const chartData = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 3000 },
  { name: "Mar", revenue: 5000 },
  { name: "Apr", revenue: 4780 },
  { name: "May", revenue: 5890 },
  { name: "Jun", revenue: 6390 },
];


/* ------------------ Public Pages ------------------ */

const Home = () => (
  <div className="min-h-screen flex items-center justify-center bg-background text-light">
    <h1 className="text-4xl font-bold tracking-wide">
      AI Finance Platform
    </h1>
  </div>
);


/* ------------------ Login Page ------------------ */

const Login = () => {

  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {

      await login(email, password);

      navigate("/dashboard");

    } catch (error) {
      console.error("Login failed", error);
    }
  };

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-light">

      <div className="bg-white p-10 rounded-xl shadow-lg w-96 border border-gray-100">

        <h2 className="text-2xl font-semibold mb-8 text-center">
          Secure Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 border rounded-lg"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-primary text-white p-3 rounded-lg"
        >
          Sign In
        </button>

      </div>

    </div>
  );
};


/* ------------------ Dashboard ------------------ */

const DashboardHome = () => {

  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const balanceData = await getWalletBalance();
      setBalance(balanceData.balance);

      const txRes = await fetch("http://localhost:5000/api/transactions", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      const txData = await txRes.json();

      setTransactions(txData.data || []);

    } catch (error) {
      console.error("Error loading dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ transform data for chart
  const chartData = transactions.map((t, i) => ({
    name: `T${i + 1}`,
    amount: Number(t.amount),
  }));

  return (

    <div className="space-y-14">

      {/* Wallet Balance */}
      <div className="bg-white p-8 rounded-xl shadow-sm border">
        <p className="text-sm text-muted">
          Current Wallet Balance
        </p>
        <h3 className="text-4xl font-semibold mt-3">
          {loading ? "Loading..." : `$${balance}`}
        </h3>
      </div>

      {/* REAL Chart */}
      <div className="bg-white p-8 rounded-xl shadow-sm border">

        <h2 className="text-lg font-semibold mb-8">
          Transaction Trend
        </h2>

        <div className="h-80">

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

      <TransferForm onSuccess={fetchData} />
      <TransactionTable />
      <AIChatPanel />

    </div>
  );
};


/* ------------------ Other Pages ------------------ */

const Analytics = () => (
  <div className="text-2xl font-semibold">
    Advanced Analytics Coming Soon
  </div>
);

const Settings = () => (
  <div className="text-2xl font-semibold">
    Account Settings
  </div>
);

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-3xl font-bold text-red-500">
      404 - Not Found
    </h1>
  </div>
);


/* ------------------ Routes ------------------ */

function AppRoutes() {

  return (

    <Routes>

      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />


      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >

        <Route index element={<DashboardHome />} />

        <Route path="analytics" element={<Analytics />} />

        <Route path="settings" element={<Settings />} />

      </Route>


      <Route path="/home" element={<Navigate to="/" />} />

      <Route path="*" element={<NotFound />} />

    </Routes>

  );
}

export default AppRoutes;