const { CronExpressionParser } = require("cron-parser");

// converts cron strings to an ISO date string for both the previous date they would have been updated and
// the next time they will be updated
const makeCronDates = (cronString) => {
  const date = CronExpressionParser.parse(cronString, {
    currentDate: new Date(),
  });
  let newCronDates = {
    lastReceived: date.prev().toString(),
    nextReceived: date.next().toString(),
  };
  return newCronDates;
};

// when a new user is created, makes an array of incomes to be added to income collection in db with that
// new user id and the next and previous dates those incomes were receieved
const incomeMapUserID = (incomeArr, user) => {
  let newIncomeArr = incomeArr.map((v) => {
    let { lastReceived, nextReceived } = makeCronDates(v.cronString);
    return { ...v, user, lastReceived, nextReceived };
  });
  return newIncomeArr;
};

module.exports = { incomeMapUserID, makeCronDates };
