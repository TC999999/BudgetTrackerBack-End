const { IncomeCollection } = require("../schemas/incomes");
const { scheduleIncomeJob } = require("./scheduleIncomeJob");

// collects all income jobs in db and schedules them in the income job map
async function loadIncomeJobs() {
  const allIncomeJobs = await IncomeCollection.find();
  for (let income of allIncomeJobs) {
    await scheduleIncomeJob(income);
  }
  console.log("***** New Income Jobs Loaded *****");
}

module.exports = { loadIncomeJobs };
