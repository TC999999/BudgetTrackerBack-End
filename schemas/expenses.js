const { Schema, model } = require("mongoose");

const ExpenseSchema = new Schema(
  {
    title: { type: String, required: [true, "Expense must have a title"] },
    budget: { type: Schema.Types.ObjectId, ref: "Budget" },
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
