const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const pool = require("../config/db");

/**
 * GET Dashboard Stats
 */
router.get("/stats", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user's wallet
    const walletResult = await pool.query(
      "SELECT id FROM wallets WHERE user_id = $1",
      [userId]
    );

    if (walletResult.rows.length === 0) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    const walletId = walletResult.rows[0].id;

    // Calculate balance
    const balanceResult = await pool.query(
      `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'credit' THEN amount END), 0) -
        COALESCE(SUM(CASE WHEN type = 'debit' THEN amount END), 0)
        AS balance
      FROM ledger_entries
      WHERE wallet_id = $1
      `,
      [walletId]
    );

    const totalBalance = Number(balanceResult.rows[0].balance);

    res.json({
      totalBalance,
      monthlyRevenue: totalBalance * 0.3,   // temporary mock logic
      investments: totalBalance * 0.5       // temporary mock logic
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;