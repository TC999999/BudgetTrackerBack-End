const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");

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

OTPSchema.pre("save", async function (next) {
  if (this.isModified("hashedOneTimeCode")) {
    this.hashedOneTimeCode = await bcrypt.hash(
      this.hashedOneTimeCode,
      BCRYPT_WORK_FACTOR
    );
  }
  next();
});

const OTPCollection = model("OTP", OTPSchema);

module.exports = { OTPCollection };
