const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
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
const UserSchema = new Schema(
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
    password: {
      type: String,
      required: [true, "Password is empty"],
      minLength: [
        16,
        "Password must be greater than or equal to 16 characters",
      ],
      maxLength: [20, "Password must be less than or equal to 20 characters"],
      validate: [/^[\w!?&$#%]+$/i, "Password contains invalid characters."],
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
    totalAssets: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: [99999999999999, "Maximum Total Asset Value Exceeded"],
      get: (v) => (v / 100).toFixed(2),
      set: (v) => v * 100,
    },
    budgets: [{ type: Schema.Types.ObjectId, ref: "Budget" }],
  },
  { versionKey: false, toJSON: { getters: true }, id: false }
);

// when a new user is created, hashes the new password using bcrypt
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, BCRYPT_WORK_FACTOR);
  }
  next();
});

// when a user is updated and that update data contains a new password, hashes the updated password
// using bcrypt
UserSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.$set && update.$set.password) {
    update.$set.password = await bcrypt.hash(
      update.$set.password,
      BCRYPT_WORK_FACTOR
    );
  }
  next();
});

// creates users model when connected to mongodb
const UserCollection = model("User", UserSchema);

module.exports = { UserCollection };
