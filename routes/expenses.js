const express = require("express");
const { ensureLoggedIn } = require("../middleware/auth");
const Budget = require("../models/budgets");
const User = require("../models/users");
const Expense = require("../models/expenses");

const router = express.Router();

router.post("/add/new", ensureLoggedIn, async function (req, res, next) {
  try {
    const { title, transaction, date, userID, budgetID } = req.body;
    const expense = await Expense.addExpense(title, transaction, date);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
