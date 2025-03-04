const { incomeJobs } = require("./incomeJobMap");
const { IncomeCollection } = require("../schemas/incomes");
const { stopIncomejob } = require("./stopIncomeJob");
const { scheduleIncomeJob } = require("./scheduleIncomeJob");

async function loadIncomeJobs() {
  const allIncomeJobs = await IncomeCollection.find();
  const activeIds = new Set(allIncomeJobs.map((i) => i._id));
  for (const id of incomeJobs.keys()) {
    if (!activeIds.has(id)) stopIncomejob(id);
  }
  for (let income of allIncomeJobs) {
    await scheduleIncomeJob(income);
  }
}

module.exports = { loadIncomeJobs };
