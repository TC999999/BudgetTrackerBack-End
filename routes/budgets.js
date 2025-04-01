const express = require("express");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const Budget = require("../models/budgets");
const User = require("../models/users");
const Expense = require("../models/expenses");

const router = express.Router();

// adds a new budget with a title and allocated funds to db as well as reduces user's total assets by
// allocated funds value
router.post(
  "/add/user/:id",
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      const { title, moneyAllocated } = req.body;
      const budget = await Budget.addBudget(
        title,
        moneyAllocated,
        res.locals.user.id
      );
      const user = await User.addBudget(
        res.locals.user.id,
        moneyAllocated,
        budget._id
      );
      return res
        .status(201)
        .json({ newUserBudget: budget, newAssets: user.totalAssets });
    } catch (err) {
      return next(err);
    }
  }
);

// updates a user's budget (title and allocated funds) on db as well as update user's total assets by
// added or reduced funds value
router.patch(
  "/update/:budgetID/user/:id",
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      const { budgetID } = req.params;
      await Budget.findUserBudget(budgetID, res.locals.user.id);
      const { title, addedMoney } = req.body;
      let newUserBudget = await Budget.updateBudget(
        budgetID,
        title,
        addedMoney
      );
      const { totalAssets } = await User.updateAssetsAndBudgets(
        res.locals.user.id,
        addedMoney
      );
      return res.status(200).json({
        newUserBudget,
        newAssets: totalAssets,
      });
    } catch (err) {
      return next(err);
    }
  }
);

// deletes budget with specific id as well as any expenses from that budget and id from user budget array.
// returns new user info and new recent expenses without the deleted expenses
router.delete(
  "/delete/:budgetID",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const { budgetID } = req.params;
      await Budget.findUserBudget(budgetID, res.locals.user.id);
      const { addBackToAssets } = req.body;
      await Expense.deleteManyExpenses(budgetID);
      let delBudget = await Budget.deleteBudget(budgetID);
      const { totalAssets } = await User.deleteBudget(
        res.locals.user.id,
        addBackToAssets,
        budgetID
      );
      return res.status(200).json({ delBudget, totalAssets });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
