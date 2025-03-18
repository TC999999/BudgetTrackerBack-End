const { UserCollection } = require("../schemas/users");
const { IncomeCollection } = require("../schemas/incomes");
const Income = require("../models/incomes");
const { makeCronDates } = require("../helpers/setUserIDIncomes");
const { cronEvent } = require("./cronEvents");
const { sendIncomeEmail } = require("../sendEmail");

async function incomeJob(_id, salary, cronString, user) {
  let newTotalAssets = await UserCollection.findByIdAndUpdate(
    user,
    {
      $inc: { totalAssets: salary },
    },
    { new: true }
  ).select("username totalAssets email");
  let { username, totalAssets, email } = newTotalAssets;
  let { nextReceived, lastReceived } = makeCronDates(cronString);
  let income = await IncomeCollection.findByIdAndUpdate(
    _id,
    { lastReceived, nextReceived },
    { new: true }
  ).select("title salary lastReceived nextReceived");
  let { title } = income;
  let newUserIncomes = await Income.getUserIncomes(user);

  cronEvent.emit(`income_for_${user}`, {
    newTotalAssets,
    newUserIncomes,
  });
  await sendIncomeEmail(email, username, title, salary, totalAssets);
}

module.exports = { incomeJob };
