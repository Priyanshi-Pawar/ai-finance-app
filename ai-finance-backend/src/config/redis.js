const Redis = require("ioredis");

const redis = new Redis({
  host: process.env.REDIS_HOST || "redis",
  port: 6379,
});

redis.on("connect", () => {
  console.log("Redis Connected ✅");
});

redis.on("error", (err) => {
  console.error("Redis error:", err.message);
});

module.exports = redis;