const { Schema, model } = require("mongoose");

const ExpenseSchema = new Schema({
  title: { type: String, required: true },
  transaction: { type: Number, min: 0.0, required: true },
  date: { type: Date, required: true },
});

const ExpenseCollection = model("Expense", ExpenseSchema);

module.exports = { ExpenseCollection };
