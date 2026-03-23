const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "ai_finance",
  password: "2203",
  port: 5432,
});

module.exports = pool;