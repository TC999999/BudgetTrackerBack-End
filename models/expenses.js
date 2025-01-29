const { BadRequestError, UnauthorizedError } = require("../expressError");
const { ExpenseCollection } = require("../schemas/expenses");

class Expenses {
  static async addExpense(title, transaction, date) {
    try {
      const res = ExpenseCollection.create({ title, transaction, date });
      return res;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }
}

module.exports = Expenses;
