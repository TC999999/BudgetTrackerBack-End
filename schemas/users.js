const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is empty"],
      minLength: [5, "Username must be more than 5 characters"],
      maxLength: [30, "Username must be less than 30 characters"],
      unique: [true, "Username already exists"],
    },
    password: {
      type: String,
      required: [true, "Password is empty"],
      minLength: [5, "password must be more than 5 characters"],
      maxLength: [20, "password must be less than 20 characters"],
    },
    totalAssets: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 999999999999.99,
      get: (v) => (v / 100).toFixed(2),
      set: (v) => v * 100,
    },
    budgets: [{ type: Schema.Types.ObjectId, ref: "Budget" }],
    expenses: [{ type: Schema.Types.ObjectId, ref: "Expense" }],
  },
  { versionKey: false, toJSON: { getters: true }, id: false }
);

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, BCRYPT_WORK_FACTOR);
  }
  next();
});

const UserCollection = model("User", UserSchema);

module.exports = { UserCollection };
