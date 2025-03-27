const express = require("express");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const User = require("../models/users");
const Expenses = require("../models/expenses");

const router = express.Router();

// finds and returns data from the user document with the specified user id as well as any recent expenses
// that user has made
router.get("/:id", ensureCorrectUser, async function (req, res, next) {
  try {
    const user = await User.get(req.params.id);
    let recentExpenses = await Expenses.getUserRecentExpenses(req.params.id);
    return res.status(200).json({ user, recentExpenses });
  } catch (err) {
    return next(err);
  }
});

// finds and returns data from the user document with the user id found in the access token
// as well as any recent expenses that user has made
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

// updates the total assets value and returns new data from the user document with the user id
// found in the access token as well as any recent expenses that user has made
router.patch("/update/assets", ensureLoggedIn, async function (req, res, next) {
  try {
    const { value } = req.body;
    const user = await User.updateAssets(res.locals.user.id, value);
    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
