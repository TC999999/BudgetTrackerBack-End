const { Schema, model } = require("mongoose");

const ExpenseSchema = new Schema(
  {
    title: { type: String, required: true },
    transaction: {
      type: Number,
      min: 1,
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
