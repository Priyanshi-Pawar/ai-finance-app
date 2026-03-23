const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const transferController = require("../controllers/transferController");

router.post("/", authMiddleware, transferController.transfer);

module.exports = router;