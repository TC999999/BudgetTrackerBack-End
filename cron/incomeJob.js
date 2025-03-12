const { UserCollection } = require("../schemas/users");
const { IncomeCollection } = require("../schemas/incomes");
const Income = require("../models/incomes");
const { makeCronDates } = require("../helpers/setUserIDIncomes");
const { cronEvent } = require("./cronEvents");

async function incomeJob(_id, salary, cronString, user) {
  let newTotalAssets = await UserCollection.findByIdAndUpdate(
    user,
    {
      $inc: { totalAssets: salary },
    },
    { new: true }
  ).select("totalAssets");
  let { nextReceived, lastReceived } = makeCronDates(cronString);
  await IncomeCollection.findByIdAndUpdate(
    _id,
    { lastReceived, nextReceived },
    { new: true }
  ).select("lastReceived nextReceived");
  let newUserIncomes = await Income.getUserIncomes(user);

  cronEvent.emit(`income_for_${user}`, {
    newTotalAssets,
    newUserIncomes,
  });

  // cronEvent.emit("done", { newTotalAssets, newUserIncomes });
}

module.exports = { incomeJob };
