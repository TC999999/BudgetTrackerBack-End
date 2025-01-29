const { BadRequestError, UnauthorizedError } = require("../expressError");
const { BudgetCollection } = require("../schemas/budgets");
const { UserCollection } = require("../schemas/users");

class Budget {
  static async addBudget(title, moneyAllocated) {
    try {
      const res = BudgetCollection.create({ title, moneyAllocated });
      return res;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  static async getBudget(username, budgetID) {
    const user = await UserCollection.findOne({
      username,
      budgets: { $in: [budgetID] },
    });
    if (user) {
      const budget = await BudgetCollection.findById(budgetID);
      return budget;
    }

    throw new UnauthorizedError("This is not your budget");
  }
}

module.exports = Budget;
