const cron = require("node-cron");
const { incomeJobs } = require("./incomeJobMap");
const { incomeJob } = require("./incomeJob");
const { stopIncomeJob } = require("./stopIncomeJob");

// creates a new income job and deletes old one when data such as income value or cron interval string
// has been updated
async function updateIncomeJob(income) {
  const { _id, salary, cronString, user } = income;
  // let numSalary = typeof salary === "number" ? salary : parseFloat(salary);
  if (incomeJobs.get(_id.toString())) {
    stopIncomeJob(_id.toString());
    const newJob = cron.schedule(cronString, () =>
      incomeJob(_id, salary, cronString, user)
    );
    incomeJobs.set(_id.toString(), newJob);
  } else {
    return;
  }
}

module.exports = { updateIncomeJob };
