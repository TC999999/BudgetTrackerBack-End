const { Schema, model } = require("mongoose");
const { validate } = require("node-cron");

// miscellaneous transaction titles can only contain characters in the regular expression
function validCharacters(title) {
  let exp = /^[\w ]+$/i;
  return exp.test(title);
}

// miscellaneous transaction titles cannot contain spaces at beginning or end
function validTrim(title) {
  let exp = /^\s+|\s+$/g;
  return !exp.test(title);
}

// miscellaneous transaction must be either add or subtract
function validOperation(operation) {
  return operation === "add" || operation === "subtract";
}

// array of validators for miscellaneous transaction titles
const transactionTitleValidators = [
  {
    validator: validCharacters,
    message:
      "Transaction title contains invalid characters. Only letters or numbers are accepted.",
  },
  {
    validator: validTrim,
    message: "Transaction title may not have spaces at the beginning or end.",
  },
];

const transactionOperationValidators = [
  {
    validator: validOperation,
    message: "Transaction operation must either be add or subtract",
  },
];

// schema for miscellaneous transaction collection documents for db (title, user, transaction, date)
const TransactionSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Transaction must have a title"],
      minLength: [
        3,
        "Transaction title must be greater than or equal to 3 characters.",
      ],
      maxLength: [
        20,
        "Transaction title must be less than or equal to 20 characters.",
      ],
      validate: transactionTitleValidators,
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
    operation: {
      type: String,
      default: "add",
      required: true,
      validate: transactionOperationValidators,
    },
    fromIncome: { type: Boolean, default: false, required: true },
    budgetTitle: { type: String, default: "", required: true },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { versionKey: false, toJSON: { getters: true }, id: false }
);

// creates miscellaneous transaction model when connected to mongodb
const TransactionCollection = model("Transaction", TransactionSchema);

module.exports = { TransactionCollection };
