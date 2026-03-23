const { z } = require("zod");
const transactionService = require("../services/transactionService");
const { successResponse, errorResponse } = require("../utils/response");

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive(),
  category: z.string().min(1),
  description: z.string().optional()
});

/**
 * ===============================
 * ADD TRANSACTION
 * ===============================
 */
const addTransaction = async (req, res, next) => {
  try {
    const validatedData = transactionSchema.parse(req.body);

    const result = await transactionService.createTransaction({
      ...validatedData,
      userId: req.user.id
    });

    return successResponse(
      res,
      result,
      "Transaction created",
      201
    );

  } catch (error) {

    if (error.name === "ZodError") {
      return errorResponse(res, "Invalid transaction data", 400);
    }

    next(error);
  }
};

/**
 * ===============================
 * GET TRANSACTIONS
 * ===============================
 */
const getTransactions = async (req, res, next) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const result = await transactionService.getAllTransactions(
      req.user.id,
      page,
      limit
    );

    return successResponse(
      res,
      result,
      "Transactions fetched",
      200
    );

  } catch (error) {
    next(error);
  }
};

/**
 * ===============================
 * UPDATE TRANSACTION
 * ===============================
 */
const updateTransaction = async (req, res, next) => {
  try {

    const validatedData = transactionSchema.parse(req.body);

    const updated = await transactionService.updateTransaction(
      req.params.id,
      req.user.id,
      validatedData
    );

    if (!updated) {
      return errorResponse(res, "Transaction not found", 404);
    }

    return successResponse(
      res,
      updated,
      "Transaction updated",
      200
    );

  } catch (error) {

    if (error.name === "ZodError") {
      return errorResponse(res, "Invalid transaction data", 400);
    }

    next(error);
  }
};

/**
 * ===============================
 * DELETE TRANSACTION
 * ===============================
 */
const deleteTransaction = async (req, res, next) => {
  try {

    const deleted = await transactionService.deleteTransaction(
      req.params.id,
      req.user.id
    );

    if (!deleted) {
      return errorResponse(res, "Transaction not found", 404);
    }

    return successResponse(
      res,
      deleted,
      "Transaction deleted",
      200
    );

  } catch (error) {
    next(error);
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction
};