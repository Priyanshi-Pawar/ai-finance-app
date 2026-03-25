const pool = require("../config/db");

/**
 * ===============================
 * GET WALLET BALANCE (FIXED)
 * ===============================
 */
exports.getBalance = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1️⃣ Get wallet
    const walletRes = await pool.query(
      "SELECT * FROM wallets WHERE user_id = $1",
      [userId]
    );

    if (!walletRes.rows.length) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    const wallet = walletRes.rows[0];

    // 2️⃣ Calculate REAL balance from ledger
    const balanceRes = await pool.query(
      `
      SELECT 
        COALESCE(SUM(CASE WHEN type='credit' THEN amount END),0) -
        COALESCE(SUM(CASE WHEN type='debit' THEN amount END),0)
        AS balance
      FROM ledger_entries
      WHERE wallet_id = $1
      `,
      [wallet.id]
    );

    const balance = Number(balanceRes.rows[0].balance);

    // 3️⃣ Return balance
    res.json({
      success: true,
      balance,
    });

  } catch (err) {
    next(err);
  }
};