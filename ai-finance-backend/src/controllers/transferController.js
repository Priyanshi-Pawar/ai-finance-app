const transferService = require("../services/transferService");
const { successResponse, errorResponse } = require("../utils/response");

/**
 * ===============================
 * TRANSFER MONEY
 * ===============================
 */
exports.transfer = async (req, res, next) => {

  try {

    if (!req.user) {
      return errorResponse(res, "Unauthorized", 401);
    }

    let { receiverId, amount } = req.body;

    receiverId = Number(receiverId);
    amount = Number(amount);

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

    if (!receiverId) {
      return errorResponse(
        res,
        "Receiver ID required",
        400
      );
    }

    if (receiverId === req.user.id) {
      return errorResponse(
        res,
        "Cannot transfer to yourself",
        400
      );
    }

    if (!amount || amount <= 0) {
      return errorResponse(
        res,
        "Amount must be greater than 0",
        400
      );
    }

    const result = await transferService.transferMoney(
      req.user.id,
      receiverId,
      amount,
      idempotencyKey
    );

    return successResponse(
      res,
      result,
      "Transfer successful",
      200
    );

  } catch (err) {
    next(err);
  }
};