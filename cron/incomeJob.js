const { UserCollection } = require("../schemas/users");
const { IncomeCollection } = require("../schemas/incomes");
const { makeCronDates } = require("../helpers/setUserIDIncomes");

async function incomeJob(_id, salary, cronString, user) {
  await UserCollection.findByIdAndUpdate(user, {
    $inc: { totalAssets: salary },
  });
  let { nextReceived, lastReceived } = makeCronDates(cronString);
  await IncomeCollection.findByIdAndUpdate(_id, { lastReceived, nextReceived });
}

module.exports = { incomeJob };
