const cron = require("node-cron");
const { incomeJobs } = require("./incomeJobMap");
const { incomeJob } = require("./incomeJob");

async function scheduleIncomeJob(income) {
  const { _id, salary, cronString, user } = income;
  let numSalary = typeof salary === "number" ? salary : parseFloat(salary);
  if (incomeJobs.get(_id.toString())) return;
  const newJob = cron.schedule(cronString, () =>
    incomeJob(_id, numSalary, cronString, user)
  );
  incomeJobs.set(_id.toString(), newJob);
}

module.exports = { scheduleIncomeJob };
