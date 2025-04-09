const { BadRequestError, NotFoundError } = require("../expressError");
const { BudgetCollection } = require("../schemas/budgets");

// class for CRUD operations for budgets stored in db
class Budget {
  // finds a budget that contains both a specified budget id and user id,
  // throws an error if none are found
  static async findUserBudget(id, user) {
    try {
      const res = await BudgetCollection.findOne({ _id: id, user }).select(
        "_id title moneyAllocated moneySpent"
      );
      if (!res) {
        throw new NotFoundError(
          "The budget you are trying to find either does not exist or does not belong to you!"
        );
      }
      return res;
    } catch (err) {
      throw new NotFoundError(
        "The budget you are trying to find either does not exist or does not belong to you!"
      );
    }
  }

  // returns all of a single user's budgets from the db
  static async getAllUserBudgets(user) {
    const res = await BudgetCollection.find({ user }).select(
      "_id title moneyAllocated moneySpent"
    );
    return res;
  }

  // adds a new budget to db with a title, allocated funds, and user id; returns new budget data
  static async addBudget(title, moneyAllocated, user) {
    try {
      const res = await BudgetCollection.create({
        title,
        moneyAllocated,
        user,
      });
      return {
        _id: res._id,
        title: res.title,
        moneyAllocated: res.moneyAllocated,
        moneySpent: res.moneySpent,
      };
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  // updates a budget both with a specific ID and specific user ID; parameters to be updated
  // include its title, and funds to be added or removed; returns updated budget
  static async updateBudget(budgetID, user, title, addedMoney) {
    try {
      const res = await BudgetCollection.findOneAndUpdate(
        { _id: budgetID, user },
        {
          title,
          $inc: { moneyAllocated: addedMoney },
        },
        { new: true }
      ).select("title moneyAllocated");
      return res;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  // deletes a budget with a specific ID and specific user ID and returns data of deleted budget
  static async deleteBudget(id, user) {
    try {
      let res = await BudgetCollection.findOneAndDelete({ _id: id, user });
      return res;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  // adds to the total money spent from the allocated funds when an expense is made; returns the
  // updated value of money spent
  static async addExpense(budgetID, user, transaction) {
    const res = await BudgetCollection.findOneAndUpdate(
      { _id: budgetID, user },
      { $inc: { moneySpent: transaction } },
      { new: true }
    ).select("moneySpent");
    return res;
  }

  // removes to the total money spent from the allocated funds when an expense is made; returns the
  // updated value of money spent
  static async removeExpense(budgetID, user, transaction) {
    const res = await BudgetCollection.findOneAndUpdate(
      { _id: budgetID, user },
      { $inc: { moneySpent: -transaction } },
      { new: true }
    ).select("moneySpent");
    return res;
  }
}

module.exports = Budget;
