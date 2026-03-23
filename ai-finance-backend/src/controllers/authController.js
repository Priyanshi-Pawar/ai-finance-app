const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { successResponse, errorResponse } = require("../utils/response");

/**
 * ===============================
 * REGISTER
 * ===============================
 */
exports.register = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, "Email and password required", 400);
    }

    await client.query("BEGIN");

    const existingUser = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      await client.query("ROLLBACK");
      return errorResponse(res, "User already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await client.query(
      "INSERT INTO users (email, password) VALUES ($1,$2) RETURNING id,email",
      [email, hashedPassword]
    );

    const user = newUser.rows[0];

    // create wallet automatically
    await client.query(
      "INSERT INTO wallets (user_id) VALUES ($1)",
      [user.id]
    );

    await client.query("COMMIT");

    return successResponse(
      res,
      { user },
      "User registered successfully",
      201
    );

  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
};

/**
 * ===============================
 * LOGIN
 * ===============================
 */
exports.login = async (req, res, next) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, "Email and password required", 400);
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    const accessToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    await pool.query(
      "UPDATE users SET refresh_token=$1 WHERE id=$2",
      [refreshToken, user.id]
    );

    return successResponse(
      res,
      {
        accessToken,
        refreshToken
      },
      "Login successful",
      200
    );

  } catch (err) {
    next(err);
  }
};

/**
 * ===============================
 * REFRESH TOKEN
 * ===============================
 */
exports.refreshToken = async (req, res, next) => {
  try {

    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, "Refresh token required", 401);
    }

    let decoded;

    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
      );
    } catch {
      return errorResponse(res, "Invalid refresh token", 403);
    }

    const result = await pool.query(
      "SELECT id FROM users WHERE id=$1 AND refresh_token=$2",
      [decoded.id, refreshToken]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, "Invalid refresh token", 403);
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return successResponse(
      res,
      { accessToken: newAccessToken },
      "Token refreshed",
      200
    );

  } catch (err) {
    next(err);
  }
};

/**
 * ===============================
 * LOGOUT
 * ===============================
 */
exports.logout = async (req, res, next) => {
  try {

    if (!req.user) {
      return errorResponse(res, "Unauthorized", 401);
    }

    await pool.query(
      "UPDATE users SET refresh_token=NULL WHERE id=$1",
      [req.user.id]
    );

    return successResponse(
      res,
      null,
      "Logged out successfully",
      200
    );

  } catch (err) {
    next(err);
  }
};