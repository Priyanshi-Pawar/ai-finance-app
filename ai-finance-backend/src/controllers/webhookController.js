const crypto = require("crypto");
const pool = require("../config/db");

exports.handlePaymentWebhook = async (req, res) => {
  const signature = req.headers["x-webhook-signature"];
  const payload = JSON.stringify(req.body);

  // Generate expected signature
  const expectedSignature = crypto
    .createHmac("sha256", process.env.WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(400).json({ message: "Invalid signature" });
  }

  const { paymentId, status } = req.body;

  try {
    await pool.query(
      "UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [status, paymentId]
    );

    res.json({ message: "Webhook processed successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};