const { loadIncomeJobs } = require("./loadIncomeJobs");

// loads income jobs whenever the server starts or resets
async function makeIncomeJobHandler() {
  await loadIncomeJobs();
}

module.exports = { makeIncomeJobHandler };
