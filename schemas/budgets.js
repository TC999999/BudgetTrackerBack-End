const { Schema, model } = require("mongoose");

const BudgetSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "This budget is missing a title!"],
    },
    user: { type: Schema.Types.ObjectId, ref: "User" },
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
    expenses: [{ type: Schema.Types.ObjectId, ref: "Expense" }],
  },
  { versionKey: false, toJSON: { getters: true }, id: false }
);

const BudgetCollection = model("Budget", BudgetSchema);

module.exports = { BudgetCollection };
