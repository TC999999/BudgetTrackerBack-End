const express = require("express");
const { ensureCorrectUser } = require("../middleware/auth");

const Transaction = require("../models/miscTransactions");

const router = express.Router();

// gets all transactions (miscellaneous and spent on budgets) for a single user
router.get("/user/:id", ensureCorrectUser, async function (req, res, next) {
  try {
    let { id } = req.params;
    let transactions = await Transaction.getUserTransactions(id);
    return res.status(200).json({ transactions });
  } catch (err) {
    return next(err);
  }
});

// gets the ten most transactions for a single user
router.get(
  "/user/:id/recent",
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      let { id } = req.params;
      let transactions = await Transaction.getUserRecentTransactions(id);
      return res.status(200).json({ transactions });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
