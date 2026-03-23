const pool = require("../config/db");
const walletService = require("./walletService");
const fraudCheck = require("../fraud/fraudEngine");
const { logAudit } = require("./auditService");

/**
 * CREATE PAYMENT (IDEMPOTENT)
 */
const createPayment = async (senderId, receiverId, amount, idempotencyKey) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Idempotency check
    const existing = await client.query(
      "SELECT * FROM payments WHERE idempotency_key = $1",
      [idempotencyKey]
    );

    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");
      return existing.rows[0];
    }

    const senderWallet = await walletService.getWalletByUser(senderId);
    const receiverWallet = await walletService.getWalletByUser(receiverId);

    const paymentRes = await client.query(
      `INSERT INTO payments 
       (sender_wallet_id, receiver_wallet_id, amount, idempotency_key, status, refunded_amount)
       VALUES ($1, $2, $3, $4, 'created', 0)
       RETURNING *`,
      [senderWallet.id, receiverWallet.id, amount, idempotencyKey]
    );

    await client.query("COMMIT");

    await logAudit(senderId, "PAYMENT_CREATED", {
      paymentId: paymentRes.rows[0].id,
      amount
    });

    return paymentRes.rows[0];

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};


/**
 * CAPTURE PAYMENT
 */
const capturePayment = async (paymentId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Lock payment row
    const paymentRes = await client.query(
      "SELECT * FROM payments WHERE id = $1 FOR UPDATE",
      [paymentId]
    );

    if (paymentRes.rows.length === 0)
      throw new Error("Payment not found");

    const payment = paymentRes.rows[0];

    if (payment.status !== "created")
      throw new Error("Payment already processed");

    // 🔥 FRAUD CHECK
    const fraudResult = await fraudCheck({
      userId: payment.sender_wallet_id,
      amount: payment.amount
    });

    if (fraudResult.flagged) {
      await client.query(
        "UPDATE payments SET status = 'fraud_flagged' WHERE id = $1",
        [paymentId]
      );
      throw new Error(`Fraud detected: ${fraudResult.reason}`);
    }

    // Balance check
    const balance = await walletService.getBalance(payment.sender_wallet_id);

    if (balance < payment.amount)
      throw new Error("Insufficient funds");

    // Ledger debit
    await client.query(
      `INSERT INTO ledger_entries (wallet_id, type, amount, description)
       VALUES ($1, 'debit', $2, 'Payment Debit')`,
      [payment.sender_wallet_id, payment.amount]
    );

    // Ledger credit
    await client.query(
      `INSERT INTO ledger_entries (wallet_id, type, amount, description)
       VALUES ($1, 'credit', $2, 'Payment Credit')`,
      [payment.receiver_wallet_id, payment.amount]
    );

    await client.query(
      `UPDATE payments 
       SET status = 'captured',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [paymentId]
    );

    await client.query("COMMIT");

    await logAudit(payment.sender_wallet_id, "PAYMENT_CAPTURED", {
      paymentId,
      amount: payment.amount
    });

    return { success: true };

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};


/**
 * PARTIAL / FULL REFUND
 */
const refundPayment = async (paymentId, refundAmount) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const paymentRes = await client.query(
      "SELECT * FROM payments WHERE id = $1 FOR UPDATE",
      [paymentId]
    );

    if (paymentRes.rows.length === 0)
      throw new Error("Payment not found");

    const payment = paymentRes.rows[0];

    if (payment.status !== "captured" && payment.status !== "partially_refunded")
      throw new Error("Refund not allowed");

    const remaining = Number(payment.amount) - Number(payment.refunded_amount);

    if (refundAmount > remaining)
      throw new Error("Refund exceeds remaining amount");

    // Reverse ledger entries
    await client.query(
      `INSERT INTO ledger_entries (wallet_id, type, amount, description)
       VALUES ($1, 'debit', $2, 'Refund Debit')`,
      [payment.receiver_wallet_id, refundAmount]
    );

    await client.query(
      `INSERT INTO ledger_entries (wallet_id, type, amount, description)
       VALUES ($1, 'credit', $2, 'Refund Credit')`,
      [payment.sender_wallet_id, refundAmount]
    );

    const newRefunded = Number(payment.refunded_amount) + Number(refundAmount);

    const newStatus =
      newRefunded === Number(payment.amount)
        ? "refunded"
        : "partially_refunded";

    await client.query(
      `UPDATE payments
       SET refunded_amount = $1,
           status = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [newRefunded, newStatus, paymentId]
    );

    await client.query("COMMIT");

    await logAudit(payment.sender_wallet_id, "PAYMENT_REFUND", {
      paymentId,
      refundAmount
    });

    return { success: true };

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};


module.exports = {
  createPayment,
  capturePayment,
  refundPayment
};