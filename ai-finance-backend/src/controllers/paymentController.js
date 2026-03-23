const paymentService = require("../services/paymentService");

exports.createPayment = async (req, res) => {
  const { receiverId, amount } = req.body;
  const idempotencyKey = req.headers["idempotency-key"];

  if (!idempotencyKey)
    return res.status(400).json({ message: "Idempotency-Key required" });

  try {
    const payment = await paymentService.createPayment(
      req.user.id,
      receiverId,
      amount,
      idempotencyKey
    );

    res.json(payment);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.capturePayment = async (req, res) => {
  try {
    const result = await paymentService.capturePayment(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.refundPayment = async (req, res) => {
  try {
    const result = await paymentService.refundPayment(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};