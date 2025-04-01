const express = require("express");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const { scheduleIncomeJob } = require("../cron/scheduleIncomeJob");
const { stopIncomeJob } = require("../cron/stopIncomeJob");
const { updateIncomeJob } = require("../cron/updateIncomeJob");
const Income = require("../models/incomes");
const User = require("../models/users");

const router = express.Router();

// adds a new income to the db with a specified user id attached to it; also schedules a new income job
// to the income jobs map
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

// updates a single income with the specified id, also updates the correlated income job on the hashmap
// of scheduled income jobs
router.patch(
  "/update/:incomeID",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const { incomeID } = req.params;
      await Income.getUserIncome(incomeID, res.locals.user.id);
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
  }
);

// deletes an income from the income collection in the db; also stops and removes the job from the income
// job hashmap
router.delete(
  "/delete/:incomeID",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const { incomeID } = req.params;
      await Income.getUserIncome(incomeID, res.locals.user.id);
      await Income.deleteIncome(incomeID);
      stopIncomeJob(id);
      // const user = await User.removeIncome(incomeID, res.locals.user.id);
      return res
        .status(200)
        .json({ message: `Income ${incomeID} deleted successfully!` });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
