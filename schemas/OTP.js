const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");

// schema for one time verification code collection documents for db
// (username, email, hashedOneTimeCode, codeConfirmed, createdAt)
const OTPSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: [true, "Username has code set already"],
    },
    email: {
      type: String,
      required: true,
      unique: [true, "Email has code set already"],
    },
    hashedOneTimeCode: { type: String, required: true },
    codeConfirmed: { type: Boolean, required: true, default: false },
    createdAt: { type: Date, expires: "2m", default: Date.now },
  },
  { versionKey: false, id: false }
);

// when a document is creates, hashed the one time verification code using bcrypt
OTPSchema.pre("save", async function (next) {
  if (this.isModified("hashedOneTimeCode")) {
    this.hashedOneTimeCode = await bcrypt.hash(
      this.hashedOneTimeCode,
      BCRYPT_WORK_FACTOR
    );
  }
  next();
});

// creates one time verification model when connected to mongodb
const OTPCollection = model("OTP", OTPSchema);

module.exports = { OTPCollection };
