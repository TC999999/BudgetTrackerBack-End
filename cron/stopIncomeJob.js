const { incomeJobs } = require("./incomeJobMap");

function stopIncomeJob(_id) {
  const incomeJob = incomeJobs.get(_id);
  if (incomeJob) {
    incomeJob.stop();
    incomeJobs.delete(_id);
  }
}

module.exports = { stopIncomeJob };
