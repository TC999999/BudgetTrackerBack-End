const User = require("../models/users");
const Transaction = require("../models/miscTransactions");
const { sendEditEmail } = require("../sendEmail");

// finds and returns data from the user document with the specified user id
const getUserForEdit = async (req, res, next) => {
  try {
    const user = await User.getForEdit(req.params.id);
    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
};

// updates a user's information
const editUser = async (req, res, next) => {
  try {
    let { _id, username, email, password } = req.body;
    const user = await User.updateUser(_id, username, email, password);
    await sendEditEmail(email, username);
    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
};

// finds and returns data from the user document with the user id found in the access token
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.get(res.locals.user.id);
    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
};

// updates the total assets value and returns new data from the user document with the user id
// found in the access token as well as the new transaction data
const addTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, value, operation, date } = req.body;
    const user = await User.updateAssets(id, value);
    const transaction = await Transaction.addTransaction({
      title,
      user: id,
      transaction: value,
      operation,
      newBalance: user.totalAssets,
      date,
    });
    return res.status(201).json({ user, transaction });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getUserForEdit, editUser, getCurrentUser, addTransaction };
