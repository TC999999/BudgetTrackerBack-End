const { BadRequestError, UnauthorizedError } = require("../expressError");
const { ExpenseCollection } = require("../schemas/expenses");

class Expenses {
  static async addExpense(title, transaction) {
    try {
      const res = await ExpenseCollection.create({ title, transaction });
      return res;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  static async deleteExpense(expenseID) {
    try {
      await ExpenseCollection.findByIdAndDelete(expenseID);
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  static async deleteManyExpenses(expenseIDs) {
    try {
      await ExpenseCollection.deleteMany({ _id: expenseIDs });
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }
}

module.exports = Expenses;
