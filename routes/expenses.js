const express = require("express");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const Budget = require("../models/budgets");
const Expenses = require("../models/expenses");

const router = express.Router();

// gets all expenses made using funds from a particular budget
router.get(
  "/budget/:budgetID/user/:id",
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      const { budgetID, id } = req.params;
      let expenses = await Expenses.getAllBudgetExpenses(budgetID, id);
      return res.status(200).json({
        expenses,
      });
    } catch (err) {
      return next(err);
    }
  }
);

// gets the 5 most transactions and budget expenses for a single user
router.get(
  "/user/:id/recent",
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      let { id } = req.params;
      let expenses = await Expenses.getUserRecentExpenses(id);
      return res.status(200).json({ expenses });
    } catch (err) {
      return next(err);
    }
  }
);

// adds new expense to expense collection in db, adds expense id to user and budget expenses array field.
// returns new lists of user budgets and recent expenses
router.post(
  "/add/budget/:budgetID/user/:id",
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      const { budgetID, id } = req.params;
      const { title, transaction, date } = req.body;
      const spentMoney = await Budget.addExpense(budgetID, id, transaction);
      const newExpense = await Expenses.addExpense(
        title,
        transaction,
        date,
        budgetID,
        res.locals.user.id
      );

      return res.status(201).json({
        newExpense,
        spentMoney,
      });
    } catch (err) {
      return next(err);
    }
  }
);

// deletes a single expense
router.delete(
  "/delete/:expenseID/budget/:budgetID/user/:id",
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      const { expenseID, budgetID, id } = req.params;
      const { transaction } = req.body;
      const newUserBudget = await Budget.removeExpense(
        budgetID,
        id,
        transaction
      );
      const delExpense = await Expenses.deleteExpense(expenseID);
      return res.status(200).json({
        delExpense,
        newUserBudget,
      });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
