const { BadRequestError, UnauthorizedError } = require("../expressError");
const { BudgetCollection } = require("../schemas/budgets");
const { ExpenseCollection } = require("../schemas/expenses");

// class for CRUD routes for expesne collection in db
class Expenses {
  // finds an expense that contains both a specified id, budget id, and user id, throws an error if none
  // are found
  static async findUserAndBudgetExpense(id, budget, user) {
    const findExpense = await ExpenseCollection.findOne({
      _id: id,
      budget,
      user,
    });
    if (!findExpense)
      throw new UnauthorizedError(
        "Cannot update an expense that does not belong to you"
      );
  }

  // adds a new expense with a title, transaction value, date, budget id, and user id
  static async addExpense(title, transaction, date, budget, user) {
    try {
      const res = await ExpenseCollection.create({
        title,
        transaction,
        date,
        budget,
        user,
      });
      return res;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  // gets and returns all of a user's expenses
  static async getAllUserExpenses(user) {
    try {
      const res = await ExpenseCollection.find({ user })
        .select("_id title budget transaction date")
        .sort({ date: -1 })
        .populate({ path: "budget", select: "-_id title" });
      return res;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  // gets and returns a user's five most recent expenses
  static async getUserRecentExpenses(user) {
    try {
      const res = await ExpenseCollection.find({ user })
        .select("_id title budget transaction date")
        .limit(5)
        .sort({ date: -1 })
        .populate({ path: "budget", select: "title" });
      return res;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  // deletes a single expense with a specific id and user id
  static async deleteExpense(expenseID) {
    try {
      await ExpenseCollection.findByIdAndDelete(expenseID);
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  // deletes multiple expenses with specific ids and user id
  static async deleteManyExpenses(expenseIDs) {
    try {
      await ExpenseCollection.deleteMany({ _id: expenseIDs });
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }
}

module.exports = Expenses;
