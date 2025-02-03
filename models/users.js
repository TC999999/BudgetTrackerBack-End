const bcrypt = require("bcrypt");
const { NotFoundError, BadRequestError } = require("../expressError");
const { UserCollection } = require("../schemas/users");

class User {
  static async authenticate(username, password) {
    const res = await UserCollection.findOne({ username })
      .populate({ path: "budgets", populate: { path: "expenses" } })
      .populate({
        path: "expenses",
        options: { perDocumentLimit: 10, sort: { date: -1 } },
      });
    let user = res;
    if (user && (await bcrypt.compare(password, user.password))) {
      delete user._doc.password;
      return user;
    }
    throw new NotFoundError("Invalid username/password");
  }

  static async register({ username, password, totalAssets }) {
    try {
      const res = await UserCollection.create({
        username,
        password,
        totalAssets,
      });
      return res;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  static async get(username) {
    const res = await UserCollection.findOne({ username })
      .select("username totalAssets _id budgets expenses")
      .populate({ path: "budgets", populate: { path: "expenses" } })
      .populate({
        path: "expenses",
        options: { perDocumentLimit: 10, sort: { date: -1 } },
      });

    let user = res;
    if (!user) throw new NotFoundError(`User of ${username} does not exist`);
    return user;
  }

  static async updateAssets(username, addedAssets) {
    const res = await UserCollection.findOneAndUpdate(
      { username },
      { $inc: { totalAssets: addedAssets } },
      { new: true }
    ).select("totalAssets");
    return res;
  }

  static async addBudget(username, moneyAllocated, newBudgetID) {
    const res = await UserCollection.findOneAndUpdate(
      { username },
      {
        $push: { budgets: newBudgetID },
        $inc: { totalAssets: -moneyAllocated },
      },
      { new: true }
    )
      .select(" totalAssets budgets")
      .populate({ path: "budgets", populate: { path: "expenses" } });
    return res;
  }

  static async deleteBudget(username, addBackToAssets, budgetID, expenseIDs) {
    const res = await UserCollection.findOneAndUpdate(
      { username },
      {
        $inc: { totalAssets: addBackToAssets },
        $pull: { budgets: budgetID },
        $pullAll: { expenses: expenseIDs },
      },
      { new: true }
    )
      .select("totalAssets budgets expenses")
      .populate({ path: "budgets", populate: { path: "expenses" } })
      .populate({
        path: "expenses",
        options: { perDocumentLimit: 10, sort: { date: -1 } },
      });
    return res;
  }

  static async addExpense(username, newExpenseID) {
    const res = await UserCollection.findOneAndUpdate(
      { username },
      { $push: { expenses: newExpenseID } },
      { new: true }
    )
      .select("budgets expenses")
      .populate({ path: "budgets", populate: { path: "expenses" } })
      .populate({
        path: "expenses",
        options: { perDocumentLimit: 10, sort: { date: -1 } },
      });
    return res;
  }

  static async removeExpense(username, expenseID) {
    const res = await UserCollection.findOneAndUpdate(
      { username },
      { $pull: { expenses: expenseID } },
      { new: true }
    )
      .select("budgets expenses")
      .populate({ path: "budgets", populate: { path: "expenses" } })
      .populate({
        path: "expenses",
        options: { perDocumentLimit: 10, sort: { date: -1 } },
      });
    return res;
  }
}

module.exports = User;
