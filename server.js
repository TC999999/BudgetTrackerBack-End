const app = require("./app");
const mongoose = require("mongoose");
const { PORT, DATABASE_URL } = require("./config");
const { makeIncomeJobHandler } = require("./cron/incomeJobHandler");
const cron = require("node-cron");

mongoose.connect(DATABASE_URL).then(async () => {
  console.log("***** Successfully connected to database *****");
  await makeIncomeJobHandler();
  app.listen(PORT, () => {
    console.log(`***** Server starting on port ${PORT} *****`);
  });
});
