const bcrypt = require("bcrypt");
const { NotFoundError, BadRequestError } = require("../expressError");
const { UserCollection } = require("../schemas/users");
const { OTPCollection } = require("../schemas/OTP");
const { makeOneTimeCode } = require("../helpers/makeOneTimeCode");

class User {
  static async authenticate(username, password) {
    const res = await UserCollection.findOne({ username }).populate({
      path: "budgets",
      select: "_id title moneyAllocated moneySpent expenses",
      populate: { path: "expenses", select: "_id transaction date" },
    });

    let user = res;
    if (user && (await bcrypt.compare(password, user.password))) {
      delete user._doc.password;
      return user;
    }
    throw new NotFoundError("Invalid username/password");
  }

  static async register({ username, password, email, totalAssets }) {
    try {
      const res = await UserCollection.create({
        username,
        password,
        email,
        totalAssets,
      });
      return res;
    } catch (err) {
      if (err.name === "ValidationError") {
        throw new BadRequestError(err.errors);
      } else if (err.name === "MongooseError") {
        throw new BadRequestError(err.message);
      }
    }
  }

  static async get(username) {
    const res = await UserCollection.findOne({ username })
      .select("username totalAssets _id budgets")
      .populate({
        path: "budgets",
        select: "_id title moneyAllocated moneySpent expenses",
        populate: {
          path: "expenses",
          select: "_id title transaction date",
          options: { sort: { date: -1 } },
        },
      });

    let user = res;
    if (!user) throw new NotFoundError(`User of ${username} does not exist`);

    return user;
  }

  static async getUserTwoFactor(username, email) {
    const res = await UserCollection.findOne({
      username,
      email,
    }).select("-_id username email");
    if (!res)
      throw new NotFoundError(
        `User of ${username} with email of ${email} does not exist`
      );
    return res;
  }

  static async saveUserTwoFactor(username, email) {
    try {
      let otp = makeOneTimeCode();
      let res = await OTPCollection.create({
        username,
        email,
        hashedOneTimeCode: otp,
      });
      return res;
    } catch (err) {
      if (err.name === "MongooseError") throw new BadRequestError(err.message);
    }
  }

  static async updateAssets(username, addedAssets) {
    const res = await UserCollection.findOneAndUpdate(
      { username },
      { $inc: { totalAssets: addedAssets } },
      { new: true }
    ).select("totalAssets");
    return res;
  }

  static async updateAssetsAndBudgets(username, addedAssets) {
    const res = await UserCollection.findOneAndUpdate(
      { username },
      { $inc: { totalAssets: -addedAssets } },
      { new: true }
    )
      .select("totalAssets budgets")
      .populate({
        path: "budgets",
        select: "_id title moneyAllocated moneySpent expenses",
        populate: {
          path: "expenses",
          select: "_id title transaction date",
          options: { sort: { date: -1 } },
        },
      });
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
      .select("totalAssets budgets")
      .populate({
        path: "budgets",
        select: "_id title moneyAllocated moneySpent expenses",
        populate: {
          path: "expenses",
          select: "_id title transaction date",
          options: { sort: { date: -1 } },
        },
      });
    return res;
  }

  static async deleteBudget(username, addBackToAssets, budgetID) {
    const res = await UserCollection.findOneAndUpdate(
      { username },
      {
        $inc: { totalAssets: addBackToAssets },
        $pull: { budgets: budgetID },
      },
      { new: true }
    )
      .select("totalAssets budgets")
      .populate({
        path: "budgets",
        select: "_id title moneyAllocated moneySpent expenses",
        populate: {
          path: "expenses",
          select: "_id title transaction date",
          options: { sort: { date: -1 } },
        },
      });
    return res;
  }
}

module.exports = User;
