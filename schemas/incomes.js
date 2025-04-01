const { Schema, model } = require("mongoose");

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
    },
    salary: {
      type: Number,
      required: [true, "Income must have a value"],
      min: 1,
      get: (v) => (v / 100).toFixed(2),
      set: (v) => v * 100,
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
