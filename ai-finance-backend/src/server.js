require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const transactionRoutes = require("./routes/transactionRoutes");
const authRoutes = require("./routes/authRoutes");
const walletRoutes = require("./routes/walletRoutes");
const transferRoutes = require("./routes/transferRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const errorHandler = require("./middleware/errorMiddleware");

const app = express();

/**
 * =============================
 * SECURITY MIDDLEWARE
 * =============================
 */

// Secure headers
app.use(helmet());

// CORS
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

/**
 * =============================
 * ROUTES
 * =============================
 */

app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);

// 🔥 FIXED HERE
app.use("/api/transfers", transferRoutes);

app.use("/api/payments", paymentRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/transactions", transactionRoutes);

/**
 * =============================
 * HEALTH CHECK
 * =============================
 */

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    message: "Fintech API healthy 🚀",
  });
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Fintech API running 🚀",
  });
});

/**
 * =============================
 * ERROR HANDLER
 * =============================
 */

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});