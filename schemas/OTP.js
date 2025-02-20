const { Schema, model } = require("mongoose");

const OTPSchema = new Schema(
  {
    username: { type: String },
    email: { type: String },
    hashedOneTimeCode: { type: String },
    expiresAt: { type: Date, expires: 20, default: Date.now() },
  },
  { versionKey: false, id: false }
);

const OTPCollection = model("OTP", OTPSchema);

module.exports = { OTPCollection };
