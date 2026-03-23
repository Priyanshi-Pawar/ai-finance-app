const checkVelocity = require("./velocityChecker");

const fraudCheck = async (transaction) => {

  if (transaction.amount > 100000) {
    return { flagged: true, reason: "High transaction amount" };
  }

  const velocityFlag = await checkVelocity(transaction.userId);
  if (velocityFlag) {
    return { flagged: true, reason: "Too many transactions" };
  }

  return { flagged: false };
};

module.exports = fraudCheck;