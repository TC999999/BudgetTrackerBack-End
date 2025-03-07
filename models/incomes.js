const { BadRequestError } = require("../expressError");
const { IncomeCollection } = require("../schemas/incomes");
const {
  incomeMapUserID,
  makeCronDates,
} = require("../helpers/setUserIDIncomes");

class Income {
  static async getUserIncomes(user) {
    const res = await IncomeCollection.find({ user }).select(
      "_id title salary cronString readableUpdateTimeString lastReceived nextReceived"
    );
    return res;
  }

  static async addManyIncomes(incomeArr, user) {
    try {
      const incomes = incomeMapUserID(incomeArr, user);
      let newIncomes = await IncomeCollection.insertMany(incomes);
      let newIncomeIDs = newIncomes.map((d) => d._id);
      return newIncomeIDs;
    } catch (err) {
      throw new BadRequestError(err);
    }
  }

  static async addIncome(
    title,
    user,
    salary,
    cronString,
    readableUpdateTimeString
  ) {
    try {
      let { lastReceived, nextReceived } = makeCronDates(cronString);
      const res = await IncomeCollection.create({
        title,
        user,
        salary,
        cronString,
        readableUpdateTimeString,
        lastReceived,
        nextReceived,
      });
      return res;
    } catch (err) {
      throw new BadRequestError(err);
    }
  }

  static async updateIncome(
    id,
    title,
    salary,
    cronString,
    readableUpdateTimeString
  ) {
    try {
      let { lastReceived, nextReceived } = makeCronDates(cronString);
      const res = await IncomeCollection.findByIdAndUpdate(
        id,
        {
          title,
          salary,
          cronString,
          readableUpdateTimeString,
          lastReceived,
          nextReceived,
        },
        { new: true }
      );
      return res;
    } catch (err) {
      throw new BadRequestError(err);
    }
  }

  static async deleteIncome(id) {
    try {
      await IncomeCollection.findByIdAndDelete(id);
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }
}

module.exports = Income;
