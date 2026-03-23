const pool = require("../config/db");

const logAudit = async (userId, action, metadata) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (users, action, metadata)
       VALUES ($1, $2, $3)`,
      [userId, action, metadata]
    );
  } catch (err) {
    console.error("Audit log failed:", err.message);
  }
};

module.exports = { logAudit };