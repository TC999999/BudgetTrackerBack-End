const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const { UserCollection } = require("../schemas/users");
const { UnacceptableError } = require("../expressError");
const { isEmail } = require("validator");

// returns if email addess is valid
function validEmail(email) {
  return isEmail(email);
}

// validator array for email address
const emailValidator = {
  validator: validEmail,
  message: "Invalid Email Address",
};

// schema for users collection documents for db
// (username, password, email, totalAssets, budgets, incomes)
const RegisterSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is empty."],
      minLength: [6, "Username must be greater than or equal to 6 characters."],
      maxLength: [30, "Username must be less than or equal to 30 characters."],
      validate: [
        /^[\w]+$/i,
        "Username contains invalid characters. Only letters or numbers are accepted.",
      ],
      unique: [true, "Username already exists! Please choose a different one."],
    },
    email: {
      type: String,
      required: [true, "Email is empty"],
      unique: [
        true,
        "Email already linked to another account. Please use a different one.",
      ],
      validate: emailValidator,
    },
    hashedOneTimeCode: { type: String, required: true },
    codeConfirmed: { type: Boolean, required: true, default: false },
    createdAt: { type: Date, expires: "10m", default: Date.now },
  },
  { versionKey: false, id: false }
);

// when a document is creates, hashed the one time verification code and password using bcrypt
RegisterSchema.pre("save", async function (next) {
  if (this.isModified("hashedOneTimeCode")) {
    this.hashedOneTimeCode = await bcrypt.hash(
      this.hashedOneTimeCode,
      BCRYPT_WORK_FACTOR
    );
  }
  if (this.isModified("username")) {
    const usernameExists = await UserCollection.exists({
      username: this.username,
    });

    if (usernameExists)
      return next(new UnacceptableError("Username already exists!"));
  }
  if (this.isModified("email")) {
    const emailExists = await UserCollection.exists({ email: this.email });
    if (emailExists)
      return next(new UnacceptableError("Email Address already exists!"));
  }

  next();
});

// creates users model when connected to mongodb
const RegisterCollection = model("Register", RegisterSchema);

module.exports = { RegisterCollection };
