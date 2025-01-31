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
    await Budget.addExpense(budgetID, expense._id, transaction);
    const user = await User.addExpense(res.locals.user.username, expense._id);
    return res
      .status(201)
      .json({ newUserBudgets: user.budgets, newUserExpenses: user.expenses });
  } catch (err) {
    return next(err);
  }
});

router.delete("/delete", ensureLoggedIn, async function (req, res, next) {
  try {
    const { _id, budgetID, transaction } = req.body;
    await Expense.deleteExpense(_id);
    await Budget.removeExpense(budgetID, _id, transaction);
    let user = await User.removeExpense(res.locals.user.username, _id);
    return res.status(200).json({
      newUserBudgets: user.budgets,
      newUserExpenses: user.expenses,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
