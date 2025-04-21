const { scheduleIncomeJob } = require("../cron/scheduleIncomeJob");
const { stopIncomeJob } = require("../cron/stopIncomeJob");
const { updateIncomeJob } = require("../cron/updateIncomeJob");
const Income = require("../models/incomes");

// adds a new income to the db with a specified user id attached to it; also schedules a new income job
// to the income jobs map
const addNewUserIncome = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, salary, cronString, readableUpdateTimeString } = req.body;
    const newUserIncome = await Income.addIncome(
      title,
      id,
      salary,
      cronString,
      readableUpdateTimeString
    );
    await scheduleIncomeJob({
      _id: newUserIncome._id,
      salary: salary.toFixed(2),
      cronString,
      user: id,
    });
    return res.status(201).json({ newUserIncome });
  } catch (err) {
    return next(err);
  }
};

// gets all incomes from a single user with a certain id
const getAllUserIncomes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userIncomes = await Income.getUserIncomes(id);
    return res.status(200).json({ userIncomes });
  } catch (err) {
    return next(err);
  }
};

// updates a single income with the specified id, also updates the correlated income job on the hashmap
// of scheduled income jobs
const updateSingleUserIncome = async (req, res, next) => {
  try {
    const { incomeID, id } = req.params;
    const { title, salary, cronString, readableUpdateTimeString } = req.body;
    let updatedIncome = await Income.updateIncome(
      id,
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
      user: id,
    });
    return res.status(200).json({ updatedIncome });
  } catch (err) {
    return next(err);
  }
};

// deletes an income from the income collection in the db; also stops and removes the job from the income
// job hashmap
const deleteSingleUserIncome = async (req, res, next) => {
  try {
    const { incomeID, id } = req.params;
    let delIncome = await Income.deleteIncome(incomeID, id);
    stopIncomeJob(incomeID);
    return res.status(200).json({ delIncome });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  addNewUserIncome,
  getAllUserIncomes,
  updateSingleUserIncome,
  deleteSingleUserIncome,
};
