const bcrypt = require("bcrypt");
const { NotFoundError, BadRequestError } = require("../expressError");
const { UserCollection } = require("../schemas/users");

class User {
  static async authenticate(username, password) {
    const res = await UserCollection.findOne({ username });
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
      .populate("expenses")
      .sort({ date: -1 })
      .limit(10);
    let user = res;
    if (!user) throw new NotFoundError(`User of ${username} does not exist`);
    return user;
  }

  static async getRecentExpenses(username) {}

  static async updateAssets(username, newAssets) {
    const res = await UserCollection.findOneAndUpdate(
      { username },
      { totalAssets: newAssets },
      { new: true }
    );
    return res;
  }

  static async addBudget(username, newBudgetID) {
    const res = await UserCollection.findOneAndUpdate(
      { username },
      { $push: { budgets: newBudgetID } },
      { new: true }
    );
    return res;
  }

  static async addExpense(username, newExpenseID) {
    const res = await UserCollection.findOneAndUpdate(
      { username },
      { $push: { expenses: newExpenseID } },
      { new: true }
    );
    return res;
  }
}

module.exports = User;
