const redis = require("../config/redis");

const checkVelocity = async (userId) => {
  const key = `txn_count:${userId}`;

  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, 60); // 60 seconds window
  }

  if (count > 5) {
    return true; // suspicious
  }

  return false;
};

module.exports = checkVelocity;