const Budget = require("../models/budgets");
const Expenses = require("../models/expenses");

// gets all expenses made using funds from a particular budget
const getUserBudgetExpenses = async (req, res, next) => {
  try {
    const { budgetID, id } = req.params;
    let expenses = await Expenses.getAllBudgetExpenses(budgetID, id);
    return res.status(200).json({
      expenses,
    });
  } catch (err) {
    return next(err);
  }
};

// gets the 5 most recent budget expenses for a single user
const getRecentUserExpenses = async (req, res, next) => {
  try {
    let { id } = req.params;
    let expenses = await Expenses.getUserRecentExpenses(id);
    return res.status(200).json({ expenses });
  } catch (err) {
    return next(err);
  }
};

// adds new expense to expense collection in db, returns new expense data and new spentMoney value
// of budget that expense was spent on
const addNewUserExpense = async (req, res, next) => {
  try {
    const { budgetID, id } = req.params;
    const { title, transaction, date } = req.body;
    const spentMoney = await Budget.addExpense(budgetID, id, transaction);
    const newExpense = await Expenses.addExpense(
      title,
      transaction,
      date,
      budgetID,
      id
    );

    return res.status(201).json({
      newExpense,
      spentMoney,
    });
  } catch (err) {
    return next(err);
  }
};

// deletes a single expense; returns deleted expense data and new value of budget with expense
// spendings added to previous value
const deleteUserExpense = async (req, res, next) => {
  try {
    const { expenseID, budgetID, id } = req.params;
    const { transaction } = req.body;
    const newUserBudget = await Budget.removeExpense(budgetID, id, transaction);
    const delExpense = await Expenses.deleteExpense(expenseID);
    return res.status(200).json({
      delExpense,
      newUserBudget,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getUserBudgetExpenses,
  getRecentUserExpenses,
  addNewUserExpense,
  deleteUserExpense,
};
