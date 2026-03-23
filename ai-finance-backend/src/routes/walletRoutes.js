const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const walletController = require("../controllers/walletController");

router.get("/balance", authMiddleware, walletController.getBalance);
router.post("/deposit", authMiddleware, walletController.deposit);

module.exports = router;