const { BadRequestError, UnauthorizedError } = require("../expressError");
const { BudgetCollection } = require("../schemas/budgets");

// class for CRUD operations for budgets stored in db
class Budget {
  // finds a budget that contains both a specified budget id and user id, throws an error if none are found
  static async findUserBudget(id, user) {
    const findBudget = await BudgetCollection.findOne({ _id: id, user });
    if (!findBudget)
      throw new UnauthorizedError(
        "Cannot update a budget that does not belong to you"
      );
  }

  // adds a new budget to db with a title, allocated funds, and user id
  static async addBudget(title, moneyAllocated, user) {
    try {
      const res = await BudgetCollection.create({
        title,
        moneyAllocated,
        user,
      });
      return res;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  // returns all budgets with a specific user ID and the expenses paid with their funds
  static async getNewUserBudgets(user) {
    const res = await BudgetCollection.find({ user })
      .select("_id title moneyAllocated moneySpent expenses")
      .populate({
        path: "expenses",
        select: "_id title transaction date",
        options: { sort: { date: -1 } },
      });
    return res;
  }

  // updates a budget both with a specific ID and specific user ID; parameters to be updated include its
  // title funds to be added or removed; returns updated budget with expenses
  static async updateBudget(budgetID, title, addedMoney) {
    try {
      await BudgetCollection.findByIdAndUpdate(budgetID, {
        title,
        $inc: { moneyAllocated: addedMoney },
      }).populate({
        path: "expenses",
        select: "_id title transaction date",
        sort: { date: -1 },
      });
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  // deletes a budget with a specific ID and specific user ID
  static async deleteBudget(id) {
    try {
      await BudgetCollection.findByIdAndDelete(id);
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  // adds new expense object id to budget expenses array in db
  static async addExpense(budgetID, expenseID, transaction) {
    const res = await BudgetCollection.findByIdAndUpdate(
      budgetID,
      { $push: { expenses: expenseID }, $inc: { moneySpent: transaction } },
      { new: true }
    ).populate({
      path: "expenses",
      select: "_id title transaction date",
      sort: { date: -1 },
    });
    return res;
  }

  // removes an expense id from budget expenses array field
  static async removeExpense(budgetID, expenseID, transaction) {
    const res = await BudgetCollection.findByIdAndUpdate(
      budgetID,
      { $pull: { expenses: expenseID }, $inc: { moneySpent: -transaction } },
      { new: true }
    ).populate({
      path: "expenses",
      select: "_id title transaction date",
      sort: { date: -1 },
    });
    return res;
  }
}

module.exports = Budget;
