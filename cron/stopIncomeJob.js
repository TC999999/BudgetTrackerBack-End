const { incomeJobs } = require("./incomeJobMap");

function stopIncomeJob(id) {
  const incomeJob = incomeJobs.get(id);
  if (incomeJob) {
    incomeJob.stop();
    incomeJobs.delete(id);
  }
}

module.exports = { stopIncomeJob };
