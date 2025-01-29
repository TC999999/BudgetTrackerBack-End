const { BadRequestError, UnauthorizedError } = require("../expressError");
const { ExpenseCollection } = require("../schemas/expenses");

class Expenses {
  static async addExpense(title, transaction) {
    try {
      const res = ExpenseCollection.create({ title, transaction });
      return res;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }
}

module.exports = Expenses;
