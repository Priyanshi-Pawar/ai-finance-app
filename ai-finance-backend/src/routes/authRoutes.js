const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  register,
  login,
  refreshToken,
  logout
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", authMiddleware, logout);

module.exports = router;