const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const paymentController = require("../controllers/paymentController");

router.post("/", authMiddleware, paymentController.createPayment);
router.post("/:id/capture", authMiddleware, paymentController.capturePayment);
router.post("/:id/refund", authMiddleware, paymentController.refundPayment);

module.exports = router;