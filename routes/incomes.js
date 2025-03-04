const express = require("express");
const { ensureLoggedIn } = require("../middleware/auth");
const Income = require("../models/incomes");
const User = require("../models/users");

const router = express.Router();

router.post("/add/new", ensureLoggedIn, async function (req, res, next) {
  try {
    const {
      title,
      salary,
      cronString,
      readableUpdateTimeString,
      lastReceived,
      nextReceived,
    } = req.body;
    const income = await Income.addIncome(
      title,
      res.locals.user.id,
      salary,
      cronString,
      readableUpdateTimeString,
      lastReceived,
      nextReceived
    );
    const user = await User.addIncome(income._id, res.locals.user.id);
    return res.status(201).json({ newUserIncomes: user.incomes });
  } catch (err) {
    return next(err);
  }
});

router.delete("/delete/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const { id } = req.params;
    await Income.deleteIncome(id);
    const newUserIncomes = await Income.getUserIncomes(res.locals.user.id);
    return res.status(200).json({ newUserIncomes });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
