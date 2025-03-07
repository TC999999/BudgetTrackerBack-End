const { loadIncomeJobs } = require("./loadIncomeJobs");

async function makeIncomeJobHandler() {
  await loadIncomeJobs();
}

module.exports = { makeIncomeJobHandler };
