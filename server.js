const app = require("./app");
const mongoose = require("mongoose");
const { PORT, DATABASE_URL } = require("./config");
const { makeIncomeJobHandler } = require("./cron/incomeJobHandler");

// connects to mongodb, loads the income job handler with a schedule of income jobs, and starts the server
mongoose.connect(DATABASE_URL).then(async () => {
  console.log("***** Successfully connected to database *****");
  await makeIncomeJobHandler();
  app.listen(PORT, () => {
    console.log(`***** Server starting on port ${PORT} *****`);
  });
});
