const pool = require("../config/db");

/**
 * Get wallet by user ID
 */
const getWalletByUser = async (userId) => {
  const result = await pool.query(
    "SELECT * FROM wallets WHERE user_id = $1",
    [userId]
  );

  return result.rows[0];
};

/**
 * Calculate wallet balance using wallet_id
 */
const getBalance = async (walletId) => {
  const result = await pool.query(
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

  return Number(result.rows[0].balance);
};

module.exports = {
  getWalletByUser,
  getBalance
};