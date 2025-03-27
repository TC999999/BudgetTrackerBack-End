const { Schema, model } = require("mongoose");

function validCharacters(title) {
  let exp = /^[\w ]+$/i;
  return exp.test(title);
}

function validTrim(title) {
  let exp = /^\s+|\s+$/g;
  return !exp.test(title);
}

const expenseValidators = [
  {
    validator: validCharacters,
    message:
      "Expense title contains invalid characters. Only letters or numbers are accepted.",
  },
  {
    validator: validTrim,
    message: "Expense title may not have spaces at the beginning or end.",
  },
];

const ExpenseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Expense must have a title"],
      minLength: [
        3,
        "Expense title must be greater than or equal to 3 characters.",
      ],
      maxLength: [
        20,
        "Expense title must be less than or equal to 20 characters.",
      ],
      validate: expenseValidators,
    },
    budget: {
      type: Schema.Types.ObjectId,
      ref: "Budget",
      required: [true, "Must have a budget id for this expense."],
    },

    user: { type: Schema.Types.ObjectId, ref: "User" },
    transaction: {
      type: Number,
      min: [1, "Transaction value must be $0.01 or greater"],
      required: true,
      default: 1,
      get: (v) => (v / 100).toFixed(2),
      set: (v) => v * 100,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { versionKey: false, toJSON: { getters: true }, id: false }
);

const ExpenseCollection = model("Expense", ExpenseSchema);

module.exports = { ExpenseCollection };
