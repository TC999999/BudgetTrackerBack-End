const { BadRequestError, UnauthorizedError } = require("../expressError");
const { BudgetCollection } = require("../schemas/budgets");

class Budget {
  static async addBudget(title, moneyAllocated) {
    try {
      const res = await BudgetCollection.create({ title, moneyAllocated });
      return res;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  static async deleteBudget(id) {
    try {
      await BudgetCollection.findByIdAndDelete(id);
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  static async addExpense(budgetID, expenseID, transaction) {
    const res = await BudgetCollection.findByIdAndUpdate(
      budgetID,
      { $push: { expenses: expenseID }, $inc: { moneySpent: transaction } },
      { new: true }
    ).populate({ path: "expenses", select: "_id title transaction date" });
    return res;
  }

  static async removeExpense(budgetID, expenseID, transaction) {
    const res = await BudgetCollection.findByIdAndUpdate(
      budgetID,
      { $pull: { expenses: expenseID }, $inc: { moneySpent: -transaction } },
      { new: true }
    ).populate({ path: "expenses", select: "_id title transaction date" });
    return res;
  }
}

module.exports = Budget;
