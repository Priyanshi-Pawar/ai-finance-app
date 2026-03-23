const { Pool } = require("pg");
require("dotenv").config();

const isDocker = process.env.DB_HOST === "postgres";

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "ai_finance",
  port: 5432,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
});

pool.connect()
  .then(() => console.log("PostgreSQL Connected ✅"))
  .catch((err) => console.error("Database Connection Error ❌", err));

module.exports = pool;