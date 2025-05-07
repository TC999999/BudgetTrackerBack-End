const { Schema, model } = require("mongoose");

// budget titles will only accept titles with the characters in the regExp
function validCharacters(title) {
  let exp = /^[\w-'":/ ]+$/i;
  return exp.test(title);
}

// budget titles cannot have unnecessary spaces
function validTrim(title) {
  let exp = /^\s+|\s+$/g;
  return !exp.test(title);
}

// array of validators for budget titles
const budgetValidators = [
  {
    validator: validCharacters,
    message:
      "Budget title contains invalid characters. Only letters, numbers, and certain special characters are accepted.",
  },
  {
    validator: validTrim,
    message: "Budget title may not have spaces at the beginning or end.",
  },
];

// schema for budget collection documents for db (title, user, moneyAllocated, moneySpent, expenses)
const BudgetSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "This budget is missing a title!"],
      minLength: [
        3,
        "Budget title must be greater than or equal to 3 characters.",
      ],
      maxLength: [
        20,
        "Budget title must be less than or equal to 20 characters.",
      ],
      validate: budgetValidators,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Must have a user id for this budget"],
    },
    moneyAllocated: {
      type: Number,
      required: [
        true,
        "Please add the amount of money allocated for this budget.",
      ],
      default: 1,
      min: [0, "Budget value cannot go below 0"],
      get: (v) => (v / 100).toFixed(2),
      set: (v) => v * 100,
    },
    moneySpent: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Budget spent value cannot go below 0"],
      get: (v) => (v / 100).toFixed(2),
      set: (v) => v * 100,
    },
  },
  { versionKey: false, toJSON: { getters: true }, id: false }
);

// creates budget model when connected to mongodb
const BudgetCollection = model("Budget", BudgetSchema);

module.exports = { BudgetCollection };
