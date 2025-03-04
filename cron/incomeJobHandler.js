const cron = require("node-cron");
const { loadIncomeJobs } = require("./loadIncomeJobs");

async function makeIncomeJobHandler() {
  await loadIncomeJobs();
  cron.schedule("* * * * *", loadIncomeJobs);
  console.log("Income Cron Manager Initialized");
}

module.exports = { makeIncomeJobHandler };
