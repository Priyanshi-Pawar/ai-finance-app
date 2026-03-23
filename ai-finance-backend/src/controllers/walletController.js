const pool = require("../config/db");
const walletService = require("../services/walletService");

/**
 * Get wallet balance
 */
exports.getBalance = async (req, res, next) => {
  try {
    const wallet = await walletService.getWalletByUser(req.user.id);

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    const balance = await walletService.getBalance(wallet.id);

    res.json({ balance });
  } catch (err) {
    next(err);
  }
};

/**
 * Deposit money
 */
exports.deposit = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid deposit amount" });
    }

    const wallet = await walletService.getWalletByUser(req.user.id);

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    await pool.query(
      `
      INSERT INTO ledger_entries (wallet_id, type, amount, description)
      VALUES ($1, 'credit', $2, 'Deposit')
      `,
      [wallet.id, amount]
    );

    res.json({ message: "Deposit successful" });
  } catch (err) {
    next(err);
  }
};