const pool = require("../config/db");

/* 1️⃣ SUMMARY */
const getSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS total_expense
      FROM transactions
      WHERE users = $1
      `,
      [userId]
    );

    const totalIncome = Number(result.rows[0].total_income);
    const totalExpense = Number(result.rows[0].total_expense);

    res.json({
      total_income: totalIncome,
      total_expense: totalExpense,
      balance: totalIncome - totalExpense
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
};

/* 2️⃣ CATEGORY BREAKDOWN */
const getCategoryBreakdown = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT category, SUM(amount) AS total
      FROM transactions
      WHERE users = $1 AND type = 'expense'
      GROUP BY category
      ORDER BY total DESC
      `,
      [userId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch category breakdown" });
  }
};

/* 3️⃣ MONTHLY ANALYTICS */
const getMonthlyAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        TO_CHAR(created_at, 'YYYY-MM') AS month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense
      FROM transactions
      WHERE users = $1
      GROUP BY month
      ORDER BY month ASC
      `,
      [userId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch monthly analytics" });
  }
};

/* 4️⃣ BALANCE */
const getBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0) -
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0)
        AS balance
      FROM transactions
      WHERE users = $1
      `,
      [userId]
    );

    res.json({ balance: Number(result.rows[0].balance) });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch balance" });
  }
};

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getMonthlyAnalytics,
  getBalance
};