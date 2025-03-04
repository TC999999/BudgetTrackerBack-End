const cron = require("node-cron");
const { incomeJobs } = require("./incomeJobMap");
const { incomeJob } = require("./incomeJob");

async function scheduleIncomeJob(income) {
  const { _id, salary, cronString, user } = income;
  if (incomeJobs.get(_id)) return;
  const newJob = cron.schedule(cronString, () =>
    incomeJob(_id, salary, cronString, user)
  );
  incomeJobs.set(_id, newJob);
}

module.exports = { scheduleIncomeJob };
