const transferService = require("../services/transferService");
const { successResponse, errorResponse } = require("../utils/response");

/**
 * ===============================
 * TRANSFER MONEY
 * ===============================
 */
exports.transfer = async (req, res, next) => {
  try {
    // ✅ Auth check
    if (!req.user || !req.user.id) {
      return errorResponse(res, "Unauthorized", 401);
    }

    // ✅ Extract + normalize
    let { receiverId, amount } = req.body;

    receiverId = Number(receiverId);
    amount = Number(amount);

    // ✅ Idempotency key (important for fintech)
    const idempotencyKey =
      req.headers["idempotency-key"] ||
      req.headers["Idempotency-Key"];

    if (!idempotencyKey) {
      return errorResponse(
        res,
        "Idempotency-Key header required",
        400
      );
    }

    // ✅ Validations
    if (!receiverId) {
      return errorResponse(res, "Receiver ID required", 400);
    }

    if (receiverId === req.user.id) {
      return errorResponse(res, "Cannot transfer to yourself", 400);
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      return errorResponse(
        res,
        "Amount must be a valid number greater than 0",
        400
      );
    }

    // 🚀 CALL SERVICE (this is where real logic happens)
    const result = await transferService.transferMoney(
      req.user.id,
      receiverId,
      amount,
      idempotencyKey
    );

    // ✅ Response
    return successResponse(
      res,
      result,
      "Transfer successful",
      200
    );

  } catch (err) {
    console.error("TRANSFER ERROR:", err);
    next(err);
  }
};