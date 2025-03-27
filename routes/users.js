const express = require("express");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const User = require("../models/users");
const Expenses = require("../models/expenses");

const router = express.Router();

router.get("/:id", ensureCorrectUser, async function (req, res, next) {
  try {
    const user = await User.get(req.params.id);
    let recentExpenses = await Expenses.getUserRecentExpenses(req.params.id);
    return res.status(200).json({ user, recentExpenses });
  } catch (err) {
    return next(err);
  }
});

router.get("/get/currentuser", ensureLoggedIn, async function (req, res, next) {
  try {
    const user = await User.get(res.locals.user.id);
    let recentExpenses = await Expenses.getUserRecentExpenses(
      res.locals.user.id
    );
    return res.status(200).json({ user, recentExpenses });
  } catch (err) {
    return next(err);
  }
});

router.patch("/update/assets", ensureLoggedIn, async function (req, res, next) {
  try {
    const { value } = req.body;
    const user = await User.updateAssets(res.locals.user.username, value);
    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
