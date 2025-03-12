const express = require("express");
const { ensureLoggedIn } = require("../middleware/auth");
const { scheduleIncomeJob } = require("../cron/scheduleIncomeJob");
const { stopIncomeJob } = require("../cron/stopIncomeJob");
const { updateIncomeJob } = require("../cron/updateIncomeJob");
const Income = require("../models/incomes");
const User = require("../models/users");

const router = express.Router();

router.post("/add/new", ensureLoggedIn, async function (req, res, next) {
  try {
    const { title, salary, cronString, readableUpdateTimeString } = req.body;
    const income = await Income.addIncome(
      title,
      res.locals.user.id,
      salary,
      cronString,
      readableUpdateTimeString
    );
    const user = await User.addIncome(income._id, res.locals.user.id);
    await scheduleIncomeJob({
      _id: income._id,
      salary: salary.toFixed(2),
      cronString,
      user: res.locals.user.id,
    });
    return res.status(201).json({ newUserIncomes: user.incomes });
  } catch (err) {
    return next(err);
  }
});

router.patch("/update/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const { id } = req.params;
    const { title, salary, cronString, readableUpdateTimeString } = req.body;
    await Income.updateIncome(
      id,
      title,
      salary,
      cronString,
      readableUpdateTimeString
    );
    await updateIncomeJob({
      _id: id,
      salary: salary.toFixed(2),
      cronString,
      user: res.locals.user.id,
    });
    const newUserIncomes = await Income.getUserIncomes(res.locals.user.id);
    return res.status(200).json({ newUserIncomes });
  } catch (err) {
    return next(err);
  }
});

router.delete("/delete/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const { id } = req.params;
    await Income.deleteIncome(id);
    stopIncomeJob(id);
    const user = await User.removeIncome(id, res.locals.user.id);
    return res.status(200).json({ newUserIncomes: user.incomes });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
