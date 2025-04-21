const express = require("express");
const { ensureCorrectUser } = require("../middleware/auth");
const {
  getUserBudgetExpenses,
  getRecentUserExpenses,
  addNewUserExpense,
  deleteUserExpense,
} = require("../controllers/expenses");

const router = express.Router();

// route for getting all expenses that belongs to single budget that also belongs to a
// single user
router.get(
  "/budget/:budgetID/user/:id",
  ensureCorrectUser,
  getUserBudgetExpenses
);

// route for getting a single user's 5 most recent budget expenses
router.get("/user/:id/recent", ensureCorrectUser, getRecentUserExpenses);

// route for adding a new expense from a single budget that belongs to a single user
router.post(
  "/add/budget/:budgetID/user/:id",
  ensureCorrectUser,
  addNewUserExpense
);

// route for deleting a single expense that belongs to a single budget that belongs to a
// single user
router.delete(
  "/delete/:expenseID/budget/:budgetID/user/:id",
  ensureCorrectUser,
  deleteUserExpense
);

module.exports = router;
