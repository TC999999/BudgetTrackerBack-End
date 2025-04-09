const { BadRequestError } = require("../expressError");
const { IncomeCollection } = require("../schemas/incomes");
const {
  incomeMapUserID,
  makeCronDates,
} = require("../helpers/setUserIDIncomes");

// class for CRUD actions for incomes collection in db
class Income {
  // finds and returns all incomes that belong to a user with a specified user id
  static async getUserIncomes(user) {
    const res = await IncomeCollection.find({ user }).select(
      "_id title salary cronString readableUpdateTimeString lastReceived nextReceived"
    );
    return res;
  }

  // adds multiple incomes from the incomeArr with the specified user id to the db; creates an
  // array of the incomes' ids and returns that array
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

  // adds a single income to the income collection in the db and returns the new income data
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
      return {
        _id: res._id,
        title: res.title,
        salary: res.salary,
        cronString: res.cronString,
        readableUpdateTimeString: res.readableUpdateTimeString,
        nextReceived: res.nextReceived,
      };
    } catch (err) {
      throw new BadRequestError(err);
    }
  }

  // updates a single income on the db; can update its title, salary value, cron interval string and
  // readable interval string; returns the updated income data
  static async updateIncome(
    user,
    id,
    title,
    salary,
    cronString,
    readableUpdateTimeString
  ) {
    try {
      let { nextReceived } = makeCronDates(cronString);
      const res = await IncomeCollection.findOneAndUpdate(
        { _id: id, user },
        {
          title,
          salary,
          cronString,
          readableUpdateTimeString,
          nextReceived,
        },
        { new: true }
      ).select(
        "cronString lastReceived nextReceived readableUpdateTimeString salary title"
      );
      return res;
    } catch (err) {
      throw new BadRequestError(err);
    }
  }

  // deletes a single income from the db with a specified id; returns the deleted income data
  static async deleteIncome(id, user) {
    try {
      let res = await IncomeCollection.findOneAndDelete({ _id: id, user });
      return res;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }
}

module.exports = Income;
