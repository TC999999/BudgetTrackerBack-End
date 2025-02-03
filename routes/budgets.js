const express = require("express");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const Budget = require("../models/budgets");
const User = require("../models/users");

const router = express.Router();

router.post("/add/new", ensureLoggedIn, async function (req, res, next) {
  try {
    const { title, moneyAllocated } = req.body;
    const budget = await Budget.addBudget(title, moneyAllocated);
    const assets = await User.updateAssets(
      res.locals.user.username,
      -moneyAllocated
    );
    const user = await User.addBudget(res.locals.user.username, budget._id);

    return res
      .status(201)
      .json({ newUserBudgets: user.budgets, newAssets: assets.totalAssets });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
