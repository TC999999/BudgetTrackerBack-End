const express = require("express");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const Budget = require("../models/budgets");
const User = require("../models/users");

const router = express.Router();

router.post("/add/new", ensureLoggedIn, async function (req, res, next) {
  try {
    const { title, username, moneyAllocated } = req.body;
    const budget = await Budget.addBudget(title, moneyAllocated);
    await User.addBudget(username, budget._id);
    return res.status(201).json({ budget });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
