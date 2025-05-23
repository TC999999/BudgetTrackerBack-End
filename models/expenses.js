const { BadRequestError, NotFoundError } = require("../expressError");
const { ExpenseCollection } = require("../schemas/expenses");
const { Types } = require("mongoose");

// class for CRUD routes for expesne collection in db
class Expenses {
  // adds a new expense with a title, transaction value, date, budget id, and user id; returns new
  // expense data
  static async addExpense(title, transaction, date, budget, user) {
    try {
      const res = await ExpenseCollection.create({
        title,
        transaction,
        date,
        budget,
        user,
      });
      return {
        _id: res._id,
        title: res.title,
        date: res.date,
        transaction: res.transaction,
      };
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  // returns all of a single budget's expenses
  static async getAllBudgetExpenses(budget, user) {
    try {
      const res = await ExpenseCollection.find({ budget, user })
        .select("_id title transaction date")
        .sort({ date: -1 });
      return res;
    } catch (err) {
      throw new NotFoundError("Could not find expenses for this budget");
    }
  }

  // gets and returns a user's five most recent expenses
  static async getUserRecentExpenses(userId) {
    try {
      const res = await ExpenseCollection.aggregate([
        { $match: { user: Types.ObjectId.createFromHexString(userId) } },
        {
          $lookup: {
            from: "budgets",
            localField: "budget",
            foreignField: "_id",
            as: "budget",
          },
        },
        { $unwind: "$budget" },
        {
          $project: {
            title: 1,
            transaction: {
              $divide: ["$transaction", 100],
            },
            date: 1,
            budget: "$budget.title",
            budgetID: "$budget._id",
          },
        },
        { $sort: { date: -1 } },
        {
          $limit: 5,
        },
      ]);
      return res;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  // deletes a single expense with a specific id and user id from db; returns data from deleted
  // expense
  static async deleteExpense(expenseID) {
    try {
      let res = await ExpenseCollection.findByIdAndDelete(expenseID);
      return res;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  // deletes multiple expenses with specific budget id; no data is returned
  static async deleteManyExpenses(budgetID, user) {
    try {
      await ExpenseCollection.deleteMany({ budget: budgetID, user });
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }
}

module.exports = Expenses;
