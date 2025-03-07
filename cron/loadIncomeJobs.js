const { IncomeCollection } = require("../schemas/incomes");
const { scheduleIncomeJob } = require("./scheduleIncomeJob");

async function loadIncomeJobs() {
  const allIncomeJobs = await IncomeCollection.find();
  for (let income of allIncomeJobs) {
    await scheduleIncomeJob(income);
  }
  console.log("***** Initial Income Jobs Loaded *****");
}

module.exports = { loadIncomeJobs };
