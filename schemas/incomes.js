const { Schema, model } = require("mongoose");

// income titles can only contain characters in the regular expression
function validCharacters(title) {
  let exp = /^[\w-'":/ ]+$/i;
  return exp.test(title);
}

// income titles cannot contain spaces at beginning or end
function validTrim(title) {
  let exp = /^\s+|\s+$/g;
  return !exp.test(title);
}

// array of validators for income titles
const incomeTitleValidators = [
  {
    validator: validCharacters,
    message:
      "Income title contains invalid characters. Only letters, numbers, and certain special characters are accepted.",
  },
  {
    validator: validTrim,
    message: "Income title may not have spaces at the beginning or end.",
  },
];

// schema for incomes collection documents for db
// (title, salary, cronString, readableUpdateTimeString, user, lasteReceived, nextReceived)
const IncomeSchema = new Schema(
  {
    title: {
      type: String,
      required: [
        true,
        "Income must have a title (Where does the user get this income?)",
      ],
      minLength: [
        4,
        "Income title must be greater than or equal to 3 characters.",
      ],
      maxLength: [
        20,
        "Income title must be less than or equal to 20 characters.",
      ],
      validate: incomeTitleValidators,
    },
    salary: {
      type: Number,
      required: [true, "Income must have a value"],
      min: 1,
      set: (v) => v * 100,
      get: (v) => v / 100,
    },
    cronString: {
      type: String,
      required: true,
      default: "* * * * *",
    },
    readableUpdateTimeString: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lastReceived: {
      type: Date,
      default: undefined,
    },
    nextReceived: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { versionKey: false, toJSON: { getters: true }, id: false }
);

// creates income model when connected to mongodb
const IncomeCollection = model("Income", IncomeSchema);

module.exports = { IncomeCollection };
