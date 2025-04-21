const Transaction = require("../models/miscTransactions");

// gets all transactions (miscellaneous and spent on budgets) for a single user
const getAllUserTransactions = async (req, res, next) => {
  try {
    let { id } = req.params;
    let transactions = await Transaction.getUserTransactions(id);
    return res.status(200).json({ transactions });
  } catch (err) {
    return next(err);
  }
};

// gets the ten most transactions for a single user
const getRecentUserTransactions = async (req, res, next) => {
  try {
    let { id } = req.params;
    let transactions = await Transaction.getUserRecentTransactions(id);
    return res.status(200).json({ transactions });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getAllUserTransactions, getRecentUserTransactions };
