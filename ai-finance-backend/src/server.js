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

// CORS for frontend (Vite default port)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // limit each IP
});
app.use(limiter);

/**
 * =============================
 * ROUTES (API PREFIXED)
 * =============================
 */

app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/transfer", transferRoutes);
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

/**
 * Root Check
 */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Fintech API running 🚀",
  });
});

/**
 * =============================
 * GLOBAL ERROR HANDLER
 * =============================
 */
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});