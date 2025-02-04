const express = require("express");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const Budget = require("../models/budgets");
const User = require("../models/users");
const Expense = require("../models/expenses");

const router = express.Router();

router.post("/add/new", ensureLoggedIn, async function (req, res, next) {
  try {
    const { title, moneyAllocated } = req.body;
    const budget = await Budget.addBudget(title, moneyAllocated);
    const user = await User.addBudget(
      res.locals.user.username,
      moneyAllocated,
      budget._id
    );
    return res
      .status(201)
      .json({ newUserBudgets: user.budgets, newAssets: user.totalAssets });
  } catch (err) {
    return next(err);
  }
});

router.patch("/update/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const { id } = req.params;
    const { title, addedMoney } = req.body;
    await Budget.updateBudget(id, title, addedMoney);
    const user = await User.updateAssetsAndBudgets(
      res.locals.user.username,
      addedMoney
    );
    return res
      .status(200)
      .json({ newUserBudgets: user.budgets, newAssets: user.totalAssets });
  } catch (err) {
    return next(err);
  }
});

router.delete("/delete/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const { id } = req.params;
    const { expenses, addBackToAssets } = req.body;
    await Expense.deleteManyExpenses(expenses);
    await Budget.deleteBudget(id);
    const user = await User.deleteBudget(
      res.locals.user.username,
      addBackToAssets,
      id,
      expenses
    );

    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
