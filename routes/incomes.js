const express = require("express");
const {
  addNewUserIncome,
  getAllUserIncomes,
  updateSingleUserIncome,
  deleteSingleUserIncome,
} = require("../controllers/incomes");
const { ensureCorrectUser } = require("../middleware/auth");

const router = express.Router();

// route for adding a new income for a single user
router.post("/add/new/user/:id", ensureCorrectUser, addNewUserIncome);

// route for getting all incomes for a single user
router.get("/user/:id", ensureCorrectUser, getAllUserIncomes);

// route for updating a single income that belongs to a single user
router.patch(
  "/:incomeID/update/user/:id",
  ensureCorrectUser,
  updateSingleUserIncome
);

// route for deleting a single income that belongs to a single user
router.delete(
  "/:incomeID/delete/user/:id",
  ensureCorrectUser,
  deleteSingleUserIncome
);

module.exports = router;
