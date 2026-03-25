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

    // ✅ Idempotency check
    const existing = await client.query(
      "SELECT * FROM transfers WHERE idempotency_key = $1",
      [idempotencyKey]
    );

    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");
      return existing.rows[0];
    }

    // ✅ Get wallets
    const senderRes = await client.query(
      "SELECT * FROM wallets WHERE user_id=$1 FOR UPDATE",
      [senderUserId]
    );

    const receiverRes = await client.query(
      "SELECT * FROM wallets WHERE user_id=$1 FOR UPDATE",
      [receiverUserId]
    );

    if (!senderRes.rows.length)
      throw new Error("Sender wallet not found");

    if (!receiverRes.rows.length)
      throw new Error("Receiver wallet not found");

    const senderWallet = senderRes.rows[0];
    const receiverWallet = receiverRes.rows[0];

    // ✅ REAL balance from ledger
    const balanceRes = await client.query(
      `
      SELECT 
        COALESCE(SUM(CASE WHEN type='credit' THEN amount END),0) -
        COALESCE(SUM(CASE WHEN type='debit' THEN amount END),0)
        AS balance
      FROM ledger_entries
      WHERE wallet_id = $1
      `,
      [senderWallet.id]
    );

    const balance = Number(balanceRes.rows[0].balance);

    if (balance < amount) {
      throw new Error("Insufficient balance");
    }

    // ✅ Ledger entries
    await client.query(
      `INSERT INTO ledger_entries (wallet_id, type, amount, description)
       VALUES ($1,'debit',$2,'Transfer sent')`,
      [senderWallet.id, amount]
    );

    await client.query(
      `INSERT INTO ledger_entries (wallet_id, type, amount, description)
       VALUES ($1,'credit',$2,'Transfer received')`,
      [receiverWallet.id, amount]
    );

    // ✅ Transfer record
    const transfer = await client.query(
      `INSERT INTO transfers 
       (sender_wallet_id, receiver_wallet_id, amount, idempotency_key)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [senderWallet.id, receiverWallet.id, amount, idempotencyKey]
    );

    // ✅ Transactions
    await client.query(
      `INSERT INTO transactions
       (user_id,type,amount,category,description)
       VALUES ($1,'expense',$2,'Transfer',$3)`,
      [senderUserId, amount, `To user ${receiverUserId}`]
    );

    await client.query(
      `INSERT INTO transactions
       (user_id,type,amount,category,description)
       VALUES ($1,'income',$2,'Transfer',$3)`,
      [receiverUserId, amount, `From user ${senderUserId}`]
    );

    await client.query("COMMIT");

    return transfer.rows[0];

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};