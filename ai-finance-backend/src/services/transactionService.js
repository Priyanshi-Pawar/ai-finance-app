const pool = require("../config/db");

/**
 * ======================================
 * CREATE TRANSACTION
 * ======================================
 */
const createTransaction = async ({
  type,
  amount,
  category,
  description,
  userId,
}) => {
  if (!type || !amount || !userId) {
    throw new Error("Missing required transaction fields");
  }

  const query = `
    INSERT INTO transactions
    (type, amount, category, description, user_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, type, amount, category, description, user_id, created_at
  `;

  const values = [
    type,
    amount,
    category || null,
    description || null,
    userId,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};


/**
 * ======================================
 * GET USER TRANSACTIONS (PAGINATION)
 * ======================================
 */
const getAllTransactions = async (userId, page = 1, limit = 10) => {
  const safePage = Math.max(parseInt(page) || 1, 1);
  const safeLimit = Math.min(parseInt(limit) || 10, 50);

  const offset = (safePage - 1) * safeLimit;

  const dataQuery = `
    SELECT
      id,
      type,
      amount,
      category,
      description,
      created_at
    FROM transactions
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM transactions
    WHERE user_id = $1
  `;

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, [userId, safeLimit, offset]),
    pool.query(countQuery, [userId]),
  ]);

  const total = parseInt(countResult.rows[0].total);

  return {
    transactions: dataResult.rows,
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};


/**
 * ======================================
 * UPDATE TRANSACTION
 * ======================================
 */
const updateTransaction = async (
  id,
  userId,
  { type, amount, category, description }
) => {
  const query = `
    UPDATE transactions
    SET
      type = $1,
      amount = $2,
      category = $3,
      description = $4
    WHERE id = $5
    AND user_id = $6
    RETURNING id, type, amount, category, description, created_at
  `;

  const values = [
    type,
    amount,
    category || null,
    description || null,
    id,
    userId,
  ];

  const result = await pool.query(query, values);

  return result.rows[0] || null;
};


/**
 * ======================================
 * DELETE TRANSACTION
 * ======================================
 */
const deleteTransaction = async (id, userId) => {
  const query = `
    DELETE FROM transactions
    WHERE id = $1
    AND user_id = $2
    RETURNING id, type, amount
  `;

  const result = await pool.query(query, [id, userId]);

  return result.rows[0] || null;
};


module.exports = {
  createTransaction,
  getAllTransactions,
  updateTransaction,
  deleteTransaction,
};