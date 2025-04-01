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
    const res = await BudgetCollection.find({ user }).select(
      "_id title moneyAllocated moneySpent"
    );

    return res;
  }

  // updates a budget both with a specific ID and specific user ID; parameters to be updated include its
  // title funds to be added or removed; returns updated budget with expenses
  static async updateBudget(budgetID, title, addedMoney) {
    try {
      const res = await BudgetCollection.findByIdAndUpdate(
        budgetID,
        {
          title,
          $inc: { moneyAllocated: addedMoney },
        },
        { new: true }
      ).select("title moneyAllocated moneySpent");
      return res;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  // deletes a budget with a specific ID and specific user ID
  static async deleteBudget(id) {
    try {
      let res = await BudgetCollection.findByIdAndDelete(id);
      return res;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  // adds new expense object id to budget expenses array in db
  static async addExpense(budgetID, transaction) {
    const res = await BudgetCollection.findByIdAndUpdate(
      budgetID,
      { $inc: { moneySpent: transaction } },
      { new: true }
    ).select("title moneyAllocated moneySpent");
    return res;
  }

  // removes an expense id from budget expenses array field
  static async removeExpense(budgetID, transaction) {
    const res = await BudgetCollection.findByIdAndUpdate(
      budgetID,
      { $inc: { moneySpent: -transaction } },
      { new: true }
    ).select("title moneyAllocated moneySpent");
    return res;
  }
}

module.exports = Budget;
