const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getSummary,
  getCategoryBreakdown,
  getMonthlyAnalytics,
  getBalance
} = require("../controllers/analyticsController");

router.get("/summary", authMiddleware, getSummary);
router.get("/category-breakdown", authMiddleware, getCategoryBreakdown);
router.get("/monthly", authMiddleware, getMonthlyAnalytics);
router.get("/balance", authMiddleware, getBalance);

module.exports = router;