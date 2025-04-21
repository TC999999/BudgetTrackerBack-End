const express = require("express");
const { ensureCorrectUser } = require("../middleware/auth");
const {
  getAllUserTransactions,
  getRecentUserTransactions,
} = require("../controllers/miscTransactions");

const router = express.Router();

// route for getting all transactions spent with funds directly from savings for a single user
router.get("/user/:id", ensureCorrectUser, getAllUserTransactions);

// route for getting most recent transactions spent with funds directly from savings
// for a single user
router.get("/user/:id/recent", ensureCorrectUser, getRecentUserTransactions);

module.exports = router;
