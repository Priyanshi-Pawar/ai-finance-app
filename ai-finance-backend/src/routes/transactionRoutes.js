const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction
} = require("../controllers/transactionController");


/**
 * ==========================
 * TRANSACTION ROUTES
 * ==========================
 */

router.post(
  "/",
  authMiddleware,
  addTransaction
);

router.get(
  "/",
  authMiddleware,
  getTransactions
);

router.put(
  "/:id",
  authMiddleware,
  updateTransaction
);

router.delete(
  "/:id",
  authMiddleware,
  deleteTransaction
);


module.exports = router;