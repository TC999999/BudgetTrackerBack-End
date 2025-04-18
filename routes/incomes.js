const express = require("express");
const { ensureCorrectUser } = require("../middleware/auth");
const { scheduleIncomeJob } = require("../cron/scheduleIncomeJob");
const { stopIncomeJob } = require("../cron/stopIncomeJob");
const { updateIncomeJob } = require("../cron/updateIncomeJob");
const Income = require("../models/incomes");

const router = express.Router();

// adds a new income to the db with a specified user id attached to it; also schedules a new income job
// to the income jobs map
router.post(
  "/add/new/user/:id",
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      const { title, salary, cronString, readableUpdateTimeString } = req.body;
      const newUserIncome = await Income.addIncome(
        title,
        res.locals.user.id,
        salary,
        cronString,
        readableUpdateTimeString
      );
      await scheduleIncomeJob({
        _id: newUserIncome._id,
        salary: salary.toFixed(2),
        cronString,
        user: res.locals.user.id,
      });
      return res.status(201).json({ newUserIncome });
    } catch (err) {
      return next(err);
    }
  }
);

router.get("/user/:id", ensureCorrectUser, async function (req, res, next) {
  try {
    const { id } = req.params;
    const userIncomes = await Income.getUserIncomes(id);
    return res.status(200).json({ userIncomes });
  } catch (err) {
    return next(err);
  }
});

// updates a single income with the specified id, also updates the correlated income job on the hashmap
// of scheduled income jobs
router.patch(
  "/:incomeID/update/user/:id",
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      const { incomeID } = req.params;
      const { title, salary, cronString, readableUpdateTimeString } = req.body;
      let updatedIncome = await Income.updateIncome(
        res.locals.user.id,
        incomeID,
        title,
        salary,
        cronString,
        readableUpdateTimeString
      );
      await updateIncomeJob({
        _id: incomeID,
        salary: salary.toFixed(2),
        cronString,
        user: res.locals.user.id,
      });
      return res.status(200).json({ updatedIncome });
    } catch (err) {
      return next(err);
    }
  }
);

// deletes an income from the income collection in the db; also stops and removes the job from the income
// job hashmap
router.delete(
  "/:incomeID/delete/user/:id",
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      const { incomeID } = req.params;
      let delIncome = await Income.deleteIncome(incomeID, res.locals.user.id);
      stopIncomeJob(incomeID);
      return res.status(200).json({ delIncome });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
