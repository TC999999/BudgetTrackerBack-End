const express = require("express");
const { ensureLoggedIn } = require("../middleware/auth");
const Budget = require("../models/budgets");
const User = require("../models/users");
const Expense = require("../models/expenses");

const router = express.Router();

router.post("/add/new", ensureLoggedIn, async function (req, res, next) {
  try {
    const { title, transaction, budgetID } = req.body;
    const expense = await Expense.addExpense(title, transaction);
    const budget = await Budget.addExpense(budgetID, expense._id, transaction);
    await User.addExpense(res.locals.user.username, expense._id);
    return res.status(201).json({ expense, budget });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
