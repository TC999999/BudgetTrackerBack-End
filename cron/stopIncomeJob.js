const { incomeJobs } = require("./incomeJobMap");

// stops income job and removes it from hashmap when being updated or deleted
function stopIncomeJob(id) {
  const incomeJob = incomeJobs.get(id);
  if (incomeJob) {
    incomeJob.stop();
    incomeJobs.delete(id);
  }
}

module.exports = { stopIncomeJob };
