const bcrypt = require("bcrypt");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const { UserCollection } = require("../schemas/users");
const { OTPCollection } = require("../schemas/OTP");
const { makeOneTimeCode } = require("../helpers/makeOneTimeCode");
const { sendResetEmail } = require("../sendEmail");

// class for CRUD actions for users collection in db
class User {
  // finds user with specified username and password as well as their budgets and incomes; returns
  // user information without password or returns an error if user is not found
  static async authenticate(username, password) {
    const res = await UserCollection.findOne({ username }).select(
      "username password totalAssets _id"
    );
    if (res && (await bcrypt.compare(password, res.password))) {
      delete res._doc.password;
      return res;
    }
    throw new NotFoundError("Invalid username/password");
  }

  // when a user first signs up, adds initial user data to users collection in db;
  // returns new user data or throws error if strings don't have proper length
  static async register({ username, password, email, totalAssets }) {
    try {
      const res = await UserCollection.create({
        username,
        password,
        email,
        totalAssets,
      });
      return {
        _id: res._id,
        username: res.username,
        totalAssets: res.totalAssets,
      };
    } catch (err) {
      if (err.name === "ValidationError") {
        throw new BadRequestError(err.errors);
      } else if (err.name === "MongooseError") {
        throw new BadRequestError(err.message);
      }
    }
  }

  // finds a user with the specified id and returns their information; throws an error if user is not found
  static async get(userID) {
    const res = await UserCollection.findById(userID).select(
      "username totalAssets _id"
    );
    let user = res;
    if (!user) throw new NotFoundError(`User of ${userID} does not exist`);

    return user;
  }

  // finds a user with the specified id and returns their information; throws an error if user is not found
  static async getForEdit(userID) {
    const res = await UserCollection.findById(userID).select(
      "-_id username email"
    );
    let user = res;
    if (!user) throw new NotFoundError(`User of ${userID} does not exist`);

    return user;
  }

  // checks if another user has the username or email the user has inputted for their new
  // username/email; if either one exists, an error is thrown; else the user document is updated
  static async updateUser(_id, username, email, password) {
    const passwordCheck = await UserCollection.findById(_id).select("password");
    if (
      passwordCheck &&
      (await bcrypt.compare(password, passwordCheck.password))
    ) {
      const res = await UserCollection.findByIdAndUpdate(
        _id,
        { $set: { username: username, email: email } },
        { new: true }
      ).select("username");
      return res;
    } else {
      throw new UnauthorizedError("Incorrect Password!");
    }
  }

  // finds a user with specified username and email address; if found, creates a one time verification
  // code and adds a document with the username, email, and code to the collection and an email to the
  // specified address; if not found, returns an error
  static async getUserTwoFactor(username, email) {
    const res = await UserCollection.findOne({
      username,
      email,
    }).select("-_id username email");
    if (!res)
      throw new NotFoundError(
        `Could not find user ${username} connected to the given email address. Please check if both your username and email address are spelled correctly.`
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

  // updates the total assets value of a user with a specified username and returns
  // the new user total savings value
  static async updateAssets(user, addedAssets) {
    const res = await UserCollection.findByIdAndUpdate(
      user,
      { $inc: { totalAssets: addedAssets } },
      { new: true }
    ).select("totalAssets");
    return res;
  }

  // updates the total value of the user's savings when updating a budget; returns the new
  // user total savings value
  static async updateAssetsForBudget(user, addedAssets) {
    const res = await UserCollection.findByIdAndUpdate(
      user,
      { $inc: { totalAssets: -addedAssets } },
      { new: true }
    ).select("totalAssets");
    return res;
  }

  // updates the total value of a user's savings when creating a budget; returns the new
  // user total savings value
  static async addBudget(user, moneyAllocated) {
    const res = await UserCollection.findByIdAndUpdate(
      user,
      {
        $inc: { totalAssets: -moneyAllocated },
      },
      { new: true }
    ).select("totalAssets");
    return res;
  }

  // updates the total value of a user's savings when deleting a budget; returns the new
  // user total savings value
  static async deleteBudget(user, addBackToAssets) {
    const res = await UserCollection.findByIdAndUpdate(
      user,
      {
        $inc: { totalAssets: addBackToAssets },
      },
      { new: true }
    ).select("totalAssets");
    return res;
  }
}

module.exports = User;
