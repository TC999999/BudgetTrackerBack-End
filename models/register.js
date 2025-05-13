const bcrypt = require("bcrypt");
const { NotFoundError, BadRequestError } = require("../expressError");
const { sendRegisterEmail } = require("../sendEmail");
const { RegisterCollection } = require("../schemas/register");
const { makeOneTimeCode } = require("../helpers/makeOneTimeCode");

class Register {
  // creates a random six-digit number code and creates a new document in the registers collection
  // with the username, email, and code (which is hashed through bcrypt); additionally sends an
  // email to the provided address with the unhashed code
  static async getOneTimeCode(username, email) {
    let otp = makeOneTimeCode();
    await RegisterCollection.create({
      username,
      email,
      hashedOneTimeCode: otp,
    });
    await sendRegisterEmail(email, otp);
  }

  // receives username, email, and 6-digit code inputted by user, finds document with username and email and
  // checks if inputted code matches unhashed code from document; if document exists and the codes match, updates
  // register document to show that code has been confirmed; if document exists and code does not match, sends error
  // unmatching code; if document does not exist, sends error for nonexistent code
  static async confirmOneTimeCode(username, email, code) {
    let codeConfirm = await RegisterCollection.findOne({
      username,
      email,
    }).select("-_id hashedOneTimeCode");
    if (
      codeConfirm &&
      (await bcrypt.compare(code, codeConfirm.hashedOneTimeCode))
    ) {
      await RegisterCollection.findOneAndUpdate(
        { username, email },
        { codeConfirmed: true }
      );
    } else if (
      codeConfirm &&
      !(await bcrypt.compare(code, codeConfirm.hashedOneTimeCode))
    ) {
      throw new BadRequestError("Inputted Code is Incorrect!");
    } else {
      throw new NotFoundError(
        "Verification code has expired! Please return to original sign-up page and repeat the process."
      );
    }
  }

  // deletes document with given username and email only if document codeConfirmed index is true; if codeConfirmed
  // is false, throws error; if document does not exist; throws separate error
  static async register(username, email) {
    let confirmUser = await RegisterCollection.findOne({ username, email });
    if (confirmUser && confirmUser.codeConfirmed) {
      await RegisterCollection.findOneAndDelete({
        username,
        email,
      });
    } else if (confirmUser && !confirmUser.codeConfirmed) {
      throw new BadRequestError(
        `User ${username} has not confirmed verification code`
      );
    } else if (!confirmUser) {
      throw new NotFoundError(
        `Either you have not completed initial registration, or registration time limit expired`
      );
    } else {
      throw new BadRequestError();
    }
  }
}

module.exports = Register;
