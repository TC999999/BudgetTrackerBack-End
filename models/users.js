const bcrypt = require("bcrypt");
const { NotFoundError, BadRequestError } = require("../expressError");
const { UserCollection } = require("../schemas/users");
const { OTPCollection } = require("../schemas/OTP");
const { makeOneTimeCode } = require("../helpers/makeOneTimeCode");
const { sendResetEmail } = require("../sendEmail");

// class for CRUD actions for users collection in db
class User {
  // finds user with specified username and password as well as their budgets and incomes; returns an error
  // user is not found
  static async authenticate(username, password) {
    const res = await UserCollection.findOne({ username })
      .populate({
        path: "budgets",
        select: "_id title moneyAllocated moneySpent",
      })
      .populate({
        path: "incomes",
        select:
          "_id title salary cronString readableUpdateTimeString lastReceived nextReceived",
      });

    let user = res;
    if (user && (await bcrypt.compare(password, user.password))) {
      delete user._doc.password;
      return user;
    }
    throw new NotFoundError("Invalid username/password");
  }

  // adds initial user data to users collection in db; throws error if strings don't have proper length
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

  // finds a user with the specified id as well as their all of their budgets and incomes
  static async get(userID) {
    const res = await UserCollection.findById(userID)
      .select("username totalAssets _id budgets incomes")
      .populate({
        path: "budgets",
        select: "_id title moneyAllocated moneySpent",
      })
      .populate({
        path: "incomes",
        select:
          "_id title salary cronString readableUpdateTimeString lastReceived nextReceived",
      });

    let user = res;
    if (!user) throw new NotFoundError(`User of ${userID} does not exist`);

    return user;
  }

  // finds a user with specified username and email address; if found, creates a one time verification
  // code and adds a document with the username, email, and code to the collection and an email to the
  // specified adress; if not found, returns an error
  static async getUserTwoFactor(username, email) {
    const res = await UserCollection.findOne({
      username,
      email,
    }).select("-_id username email");
    if (!res)
      throw new NotFoundError(
        `Could not find user ${username} connected to the given email address. Please check if either your username or email address is spelled correctly.`
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

  // finds a document with the specified username, email, and hashed one time verification code; if all three
  // match, updates the document to confirm the code to have been inputted; if the code is incorrect, throws
  // a bad request error; if the document does not exist, throws a not found error
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

  // finds a document with the specified username, email; if the document is found and the code has already
  // been confirmed, updates the user document with the new user password and deletes the one time code
  // document from the collection; an error is thrown if the document exists, but the code has not been
  // confirmed or if the document does not exist
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

  // adds many income ids to the incomes array in a single user document and returns the new user
  // information
  static async addManyIncomes(incomeIDs, user_id) {
    if (incomeIDs.length === 0) return [];
    const res = await UserCollection.findByIdAndUpdate(
      user_id,
      {
        $push: { incomes: { $each: [...incomeIDs] } },
      },
      { new: true }
    ).populate({
      path: "incomes",
      select:
        "_id title salary cronString readableUpdateTimeString lastReceived nextReceived",
    });
    return res;
  }

  // adds a single income id to the incomes array in a single user document and returns the new user
  // information
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
          "_id title salary cronString readableUpdateTimeString lastReceived nextReceived",
      });
    return res;
  }

  // removes a single income id to the incomes array in a single user document and returns the new user
  // information
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
          "title salary cronString readableUpdateTimeString lastReceived nextReceived",
      });
    return res;
  }

  // updates the total assets value of a user with a specified username and returns the new user infomration
  static async updateAssets(user, addedAssets) {
    const res = await UserCollection.findByIdAndUpdate(
      user,
      { $inc: { totalAssets: addedAssets } },
      { new: true }
    ).select("totalAssets");
    return res;
  }

  // updates the total assets value of a user with a specified username and returns the new user information
  // with updates to budgets as well
  static async updateAssetsAndBudgets(user, addedAssets) {
    const res = await UserCollection.findByIdAndUpdate(
      user,
      { $inc: { totalAssets: -addedAssets } },
      { new: true }
    ).select("totalAssets");

    return res;
  }

  // adds a single budget id to a user document with a specified username, updates their total assets value,
  // and returns the new user information
  static async addBudget(user, moneyAllocated, newBudgetID) {
    const res = await UserCollection.findByIdAndUpdate(
      user,
      {
        $push: { budgets: newBudgetID },
        $inc: { totalAssets: -moneyAllocated },
      },
      { new: true }
    )
      .select("totalAssets budgets")
      .populate({
        path: "budgets",
        select: "_id title moneyAllocated moneySpent",
      });
    return res;
  }

  // removes a single budget id to a user document with a specified username, updates their total assets value,
  // and returns the new user information
  static async deleteBudget(user, addBackToAssets, budgetID) {
    const res = await UserCollection.findByIdAndUpdate(
      user,
      {
        $inc: { totalAssets: addBackToAssets },
        $pull: { budgets: budgetID },
      },
      { new: true }
    ).select("totalAssets");
    return res;
  }
}

module.exports = User;
