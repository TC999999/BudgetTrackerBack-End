const express = require("express");
const { ensureLoggedIn } = require("../middleware/auth");
const Budget = require("../models/budgets");
const User = require("../models/users");
const Expenses = require("../models/expenses");

const router = express.Router();

// adds new expense to expense collection in db, adds expense id to user and budget expenses array field.
// returns new lists of user budgets and recent expenses
router.post("/add/new", ensureLoggedIn, async function (req, res, next) {
  try {
    const { title, transaction, date, budgetID } = req.body;
    await Budget.findUserBudget(budgetID, res.locals.user.id);
    const expense = await Expenses.addExpense(
      title,
      transaction,
      date,
      budgetID,
      res.locals.user.id
    );
    await Budget.addExpense(budgetID, expense._id, transaction);
    const newUserBudgets = await Budget.getNewUserBudgets(res.locals.user.id);
    const newUserExpenses = await Expenses.getUserRecentExpenses(
      res.locals.user.id
    );
    return res.status(201).json({
      newUserBudgets,
      newUserExpenses,
    });
  } catch (err) {
    return next(err);
  }
});

router.delete("/delete", ensureLoggedIn, async function (req, res, next) {
  try {
    const { _id, budgetID, transaction } = req.body;
    await Expenses.findUserAndBudgetExpense(_id, budgetID, res.locals.user.id);
    await Expenses.deleteExpense(_id);
    await Budget.removeExpense(budgetID, _id, transaction);
    const newUserBudgets = await Budget.getNewUserBudgets(res.locals.user.id);
    const newUserExpenses = await Expenses.getUserRecentExpenses(
      res.locals.user.id
    );
    return res.status(200).json({
      newUserBudgets,
      newUserExpenses,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
