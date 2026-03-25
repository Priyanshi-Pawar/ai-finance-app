const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const walletController = require("../controllers/walletController");

// ✅ correct route
router.get("/balance", authMiddleware, walletController.getBalance);

module.exports = router;