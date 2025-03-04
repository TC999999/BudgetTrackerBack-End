const bcrypt = require("bcrypt");
const { NotFoundError, BadRequestError } = require("../expressError");
const { UserCollection } = require("../schemas/users");
const { OTPCollection } = require("../schemas/OTP");
const { makeOneTimeCode } = require("../helpers/makeOneTimeCode");
const { sendResetEmail } = require("../helpers/sendEmail");

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
      .select("username totalAssets _id budgets incomes")
      .populate({
        path: "budgets",
        select: "_id title moneyAllocated moneySpent expenses",
        populate: {
          path: "expenses",
          select: "_id title transaction date",
          options: { sort: { date: -1 } },
        },
      })
      .populate({
        path: "incomes",
        select:
          "_id title salary readableUpdateTimeString lastReceived nextReceived",
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

    let otp = makeOneTimeCode();
    await OTPCollection.create({
      username,
      email,
      hashedOneTimeCode: otp,
    });
    await sendResetEmail(email, otp);
    return res;
  }

  static async confirmUserCode(username, email, code) {
    let codeConfirm = await OTPCollection.findOne({ username, email }).select(
      "-_id hashedOneTimeCode"
    );
    if (
      codeConfirm &&
      (await bcrypt.compare(code, codeConfirm.hashedOneTimeCode))
    ) {
      await OTPCollection.findOneAndUpdate(
        { username, email },
        { codeConfirmed: true }
      );
    } else if (
      codeConfirm &&
      !(await bcrypt.compare(code, codeConfirm.hashedOneTimeCode))
    ) {
      throw new BadRequestError("Inputted Code is Incorrect");
    } else {
      throw new NotFoundError("Verification code has expired.");
    }
  }

  static async resetUserPassword(username, email, newPassword) {
    let confirmUser = await OTPCollection.findOne({ username, email });
    if (confirmUser && confirmUser.codeConfirmed) {
      await UserCollection.findOneAndUpdate(
        { username, email },
        { $set: { password: newPassword } }
      );
      await OTPCollection.findOneAndDelete({ username, email });
    } else if (confirmUser && !confirmUser.codeConfirmed) {
      throw new BadRequestError(
        `User ${username} has not confirmed verification code`
      );
    } else if (!confirmUser) {
      throw new NotFoundError(
        `Either user ${username} has not requested password reset, or password reset time limit expired`
      );
    } else {
      throw new BadRequestError();
    }
  }

  static async addManyIncomes(incomeIDs, user_id) {
    const res = await UserCollection.findByIdAndUpdate(
      user_id,
      {
        $push: { incomes: { $each: [...incomeIDs] } },
      },
      { new: true }
    ).populate({
      path: "incomes",
      select:
        "_id title salary readableUpdateTimeString lastReceived nextReceived",
    });
    return res;
  }

  static async addIncome(incomeID, user_id) {
    const res = await UserCollection.findByIdAndUpdate(
      user_id,
      {
        $push: { incomes: incomeID },
      },
      { new: true }
    )
      .select("incomes")
      .populate({
        path: "incomes",
        select:
          "_id title salary readableUpdateTimeString lastReceived nextReceived",
      });
    return res;
  }

  static async removeIncome(incomeID, user_id) {
    const res = await UserCollection.findByIdAndUpdate(
      user_id,
      {
        $pull: { incomes: incomeID },
      },
      { new: true }
    )
      .select("incomes")
      .populate({
        path: "incomes",
        select:
          "title salary readableUpdateTimeString lastReceived nextReceived",
      });
    return res;
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
