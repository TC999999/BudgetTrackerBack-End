const { BadRequestError } = require("../expressError");
const { ExpenseCollection } = require("../schemas/expenses");

class Expenses {
  static async addExpense(title, transaction, date, budgetID) {
    try {
      const res = await ExpenseCollection.create({
        title,
        transaction,
        date,
        budget: budgetID,
      });
      return res;
    } catch (err) {
      let messages = Object.values(err.errors).map((e) => {
        return [e.path, e.message];
      });
      throw new BadRequestError(messages);
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
