const { BadRequestError, UnauthorizedError } = require("../expressError");
const { IncomeCollection } = require("../schemas/incomes");
const {
  incomeMapUserID,
  makeCronDates,
} = require("../helpers/setUserIDIncomes");

// class for CRUD actions for incomes collection in db
class Income {
  // finds and returns an income that contains both a specified id and user id, throws an error if none
  // are found
  static async getUserIncome(id, user) {
    const findIncome = await IncomeCollection.findOne({ _id: id, user });
    if (!findIncome)
      throw new UnauthorizedError(
        "Cannot update an income that does not belong to you"
      );
  }

  // finds and returns all incomes that belong to a user with a specified user id
  static async getUserIncomes(user) {
    const res = await IncomeCollection.find({ user }).select(
      "_id title salary cronString readableUpdateTimeString lastReceived nextReceived"
    );
    return res;
  }

  // adds multiple incomes from the incomeArr with the specified user id to the db
  static async addManyIncomes(incomeArr, user) {
    try {
      if (incomeArr.length == 0) return [];
      const incomes = incomeMapUserID(incomeArr, user);
      let newIncomes = await IncomeCollection.insertMany(incomes);
      let newIncomeIDs = newIncomes.map((d) => d._id);
      return newIncomeIDs;
    } catch (err) {
      throw new BadRequestError(err);
    }
  }

  // adds a single income to the income collection in the db
  static async addIncome(
    title,
    user,
    salary,
    cronString,
    readableUpdateTimeString
  ) {
    try {
      let { nextReceived } = makeCronDates(cronString);
      const res = await IncomeCollection.create({
        title,
        user,
        salary,
        cronString,
        readableUpdateTimeString,
        nextReceived,
      });
      return res;
    } catch (err) {
      throw new BadRequestError(err);
    }
  }

  // updates a single income on the db; can update its title, salary value, cron interval string and
  // readable interval string
  static async updateIncome(
    id,
    title,
    salary,
    cronString,
    readableUpdateTimeString
  ) {
    try {
      let { nextReceived } = makeCronDates(cronString);
      const res = await IncomeCollection.findByIdAndUpdate(
        id,
        {
          title,
          salary,
          cronString,
          readableUpdateTimeString,
          nextReceived,
        },
        { new: true }
      );
      return res;
    } catch (err) {
      throw new BadRequestError(err);
    }
  }

  // deletes a single income from the db with a specified id
  static async deleteIncome(id) {
    try {
      await IncomeCollection.findByIdAndDelete(id);
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }
}

module.exports = Income;
