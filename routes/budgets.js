const express = require("express");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const {
  getAllUserBudgets,
  getSingleUserBudget,
  addNewUserBudget,
  updateSingleUserBudget,
  deleteSingleUserBudget,
} = require("../controllers/budgets");

const router = express.Router();

// route for getting all budgets that belong to a single user
router.get("/all/user/:id", ensureCorrectUser, getAllUserBudgets);

// route for getting a single budget that belongs to a single user
router.get("/:budgetID/user/:id", ensureCorrectUser, getSingleUserBudget);

// route for adding a single budget for a single user
router.post("/add/user/:id", ensureCorrectUser, addNewUserBudget);

// route for updating a single budget that belongs to a single user
router.patch(
  "/update/:budgetID/user/:id",
  ensureCorrectUser,
  updateSingleUserBudget
);

// route for deleting a single budget that belongs to a single user
router.delete(
  "/delete/:budgetID/user/:id",
  ensureLoggedIn,
  deleteSingleUserBudget
);

module.exports = router;
