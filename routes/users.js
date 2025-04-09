const express = require("express");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const User = require("../models/users");
const Transaction = require("../models/miscTransactions");

const router = express.Router();

// finds and returns data from the user document with the specified user id as well as any recent expenses
// that user has made
router.get("/:id", ensureCorrectUser, async function (req, res, next) {
  try {
    const user = await User.get(req.params.id);
    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
});

// finds and returns data from the user document with the user id found in the access token
// as well as any recent expenses that user has made
router.get("/get/currentuser", ensureLoggedIn, async function (req, res, next) {
  try {
    const user = await User.get(res.locals.user.id);
    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
});

// updates the total assets value and returns new data from the user document with the user id
// found in the access token as well as any recent expenses that user has made
router.patch("/update/assets", ensureLoggedIn, async function (req, res, next) {
  try {
    const { title, value, operation, date } = req.body;
    const user = await User.updateAssets(res.locals.user.id, value);
    await Transaction.addTransaction(
      title,
      res.locals.user.id,
      value,
      operation,
      date
    );

    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
