const cron = require("node-cron");
const { incomeJobs } = require("./incomeJobMap");
const { incomeJob } = require("./incomeJob");

// sets an income job to the income job hashmap to update a user's
// total savings, add a new income transaction, and update the update
// times on that particular income at scheduled
// cron string interval
async function scheduleIncomeJob(income) {
  const { _id, salary, cronString, user } = income;
  let numSalary = typeof salary === "number" ? salary : parseFloat(salary);
  if (incomeJobs.get(_id.toString())) return;
  const newJob = cron.schedule(cronString, () =>
    incomeJob(_id, numSalary, cronString, user)
  );
  incomeJobs.set(_id.toString(), newJob);
}

// sets multiple income jobs to the income job hashmap to update a user's
// total savings, add a new income transaction, and update the update
// times on that particular income at scheduled
// cron string interval
async function scheduleManyIncomeJobs(incomes) {
  for (let income of incomes) {
    await scheduleIncomeJob(income);
  }
}

module.exports = { scheduleIncomeJob, scheduleManyIncomeJobs };
