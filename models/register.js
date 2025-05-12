const bcrypt = require("bcrypt");
const { NotFoundError, BadRequestError } = require("../expressError");
const { sendRegisterEmail } = require("../sendEmail");
const { RegisterCollection } = require("../schemas/register");
const { makeOneTimeCode } = require("../helpers/makeOneTimeCode");

class Register {
  static async getOneTimeCode(username, email) {
    let otp = makeOneTimeCode();
    await RegisterCollection.create({
      username,
      email,
      hashedOneTimeCode: otp,
    });
    await sendRegisterEmail(email, otp);
  }

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
        "Verification code has expired! Please return to original Sign Up Page and try again."
      );
    }
  }

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
