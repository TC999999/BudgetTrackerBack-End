const { CronExpressionParser } = require("cron-parser");

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

const incomeMapUserID = (incomeArr, user) => {
  let newIncomeArr = incomeArr.map((v) => {
    let { lastReceived, nextReceived } = makeCronDates(v.cronString);
    return { ...v, user, lastReceived, nextReceived };
  });
  return newIncomeArr;
};

module.exports = { incomeMapUserID, makeCronDates };
