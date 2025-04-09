const express = require("express");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const Budget = require("../models/budgets");
const User = require("../models/users");
const Expense = require("../models/expenses");

const router = express.Router();

// retrieves all of a single user's budgets from the db
router.get("/all/user/:id", ensureCorrectUser, async function (req, res, next) {
  try {
    const { id } = req.params;
    const budgets = await Budget.getAllUserBudgets(id);
    return res.status(200).json({ budgets });
  } catch (err) {
    return next(err);
  }
});

// retrieves a single budget for a gets a single user from the db
router.get(
  "/:budgetID/user/:id",
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      const { budgetID, id } = req.params;
      const budget = await Budget.findUserBudget(budgetID, id);
      return res.status(200).json({ budget });
    } catch (err) {
      return next(err);
    }
  }
);

// adds a new budget with a title and allocated funds to db as well as reduces user's total assets by
// allocated funds value, returns the new budget and updated user savings value to the client side
router.post(
  "/add/user/:id",
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      const { id } = req.params;
      const { title, moneyAllocated } = req.body;
      const budget = await Budget.addBudget(title, moneyAllocated, id);
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
// added or reduced funds value; returns the updated budget date and updated user savings value
// to the client side
router.patch(
  "/update/:budgetID/user/:id",
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      const { budgetID, id } = req.params;
      const { title, addedMoney } = req.body;
      let newUserBudget = await Budget.updateBudget(
        budgetID,
        id,
        title,
        addedMoney
      );
      const { totalAssets } = await User.updateAssetsForBudget(id, addedMoney);
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
// returns the updated user savings value to the client side
router.delete(
  "/delete/:budgetID/user/:id",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const { budgetID, id } = req.params;
      const { addBackToAssets } = req.body;
      await Expense.deleteManyExpenses(budgetID, id);
      await Budget.deleteBudget(budgetID, id);
      const { totalAssets } = await User.deleteBudget(id, addBackToAssets);
      return res.status(200).json({ totalAssets });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
