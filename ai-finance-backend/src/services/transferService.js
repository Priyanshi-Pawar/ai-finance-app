const pool = require("../config/db");

exports.transferMoney = async (
  senderUserId,
  receiverUserId,
  amount,
  idempotencyKey
) => {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    /*
    =============================
    1️⃣ Idempotency check
    =============================
    */

    const existingTransfer = await client.query(
      "SELECT * FROM transfers WHERE idempotency_key = $1",
      [idempotencyKey]
    );

    if (existingTransfer.rows.length > 0) {
      await client.query("ROLLBACK");
      return existingTransfer.rows[0];
    }

    /*
    =============================
    2️⃣ Get sender wallet
    =============================
    */

    const senderWalletRes = await client.query(
      "SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE",
      [senderUserId]
    );

    if (senderWalletRes.rows.length === 0) {
      throw new Error("Sender wallet not found");
    }

    const senderWallet = senderWalletRes.rows[0];

    /*
    =============================
    3️⃣ Get receiver wallet
    =============================
    */

    const receiverWalletRes = await client.query(
      "SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE",
      [receiverUserId]
    );

    if (receiverWalletRes.rows.length === 0) {
      throw new Error("Receiver wallet not found");
    }

    const receiverWallet = receiverWalletRes.rows[0];

    /*
    =============================
    4️⃣ Check balance
    =============================
    */

    if (Number(senderWallet.balance) < Number(amount)) {
      throw new Error("Insufficient balance");
    }

    /*
    =============================
    5️⃣ Debit sender
    =============================
    */

    await client.query(
      "UPDATE wallets SET balance = balance - $1 WHERE id = $2",
      [amount, senderWallet.id]
    );

    /*
    =============================
    6️⃣ Credit receiver
    =============================
    */

    await client.query(
      "UPDATE wallets SET balance = balance + $1 WHERE id = $2",
      [amount, receiverWallet.id]
    );

    /*
    =============================
    7️⃣ Create transfer record
    =============================
    */

    const transfer = await client.query(
      `
      INSERT INTO transfers
      (sender_wallet_id, receiver_wallet_id, amount, idempotency_key)
      VALUES ($1,$2,$3,$4)
      RETURNING *
      `,
      [
        senderWallet.id,
        receiverWallet.id,
        amount,
        idempotencyKey
      ]
    );

    /*
    =============================
    8️⃣ Sender expense transaction
    =============================
    */

    await client.query(
      `
      INSERT INTO transactions
      (type, amount, category, description, users)
      VALUES ($1,$2,$3,$4,$5)
      `,
      [
        "expense",
        amount,
        "transfer",
        "Money sent",
        senderUserId
      ]
    );

    /*
    =============================
    9️⃣ Receiver income transaction
    =============================
    */

    await client.query(
      `
      INSERT INTO transactions
      (type, amount, category, description, users)
      VALUES ($1,$2,$3,$4,$5)
      `,
      [
        "income",
        amount,
        "transfer",
        "Money received",
        receiverUserId
      ]
    );

    await client.query("COMMIT");

    return transfer.rows[0];

  } catch (error) {

    await client.query("ROLLBACK");
    throw error;

  } finally {

    client.release();

  }
};