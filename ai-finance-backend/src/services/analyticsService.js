const pool = require("../db");
const { get } = require("../routes/transactionRoutes");

// Total income & expense
const getSummary = async () => {
  const result = await pool.query(`
    SELECT
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense
    FROM transactions;
  `);

  const { total_income, total_expense } = result.rows[0];

  return {
    total_income: total_income || 0,
    total_expense: total_expense || 0,
    balance: (total_income || 0) - (total_expense || 0)
  };
};
const getCategoryBreakdown = async () => {
  const result = await pool.query(`
    SELECT category, SUM(amount) as total
    FROM transactions
    WHERE type = 'expense'
    GROUP BY category
  `);

  return result.rows;
};
module.exports = {
  getSummary,
  getCategoryBreakdown
};