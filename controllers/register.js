const Register = require("../models/register");
const User = require("../models/users");
const Income = require("../models/incomes");
const { setCookieTokens } = require("../helpers/token");
const { scheduleManyIncomeJobs } = require("../cron/scheduleIncomeJob");
const { sendConfirmEmail } = require("../sendEmail");

// controller for adding new user info to registration collection and sending email with
// one time verification code
const getOneTimeCode = async (req, res, next) => {
  try {
    const { username, email } = req.body;
    await Register.getOneTimeCode(username, email);
    return res.status(201).json({ message: "Check your email" });
  } catch (err) {
    return next(err);
  }
};

// controller for confirming info from confirming one time verification code for registration
const confirmOneTimeCode = async (req, res, next) => {
  try {
    const { username, email, code } = req.body;
    await Register.confirmOneTimeCode(username, email, code);
    return res.status(201).json({ message: "Code confirmed" });
  } catch (err) {
    return next(err);
  }
};

// creates a new user with the request body data the user as well as any intital incomes
// the user create (adds them to both db and income job schdeule map). Additionally, sets
// new refresh and access tokens into cookies, returns the user's information to the frontend
const registerUser = async (req, res, next) => {
  try {
    const { username, password, email, totalAssets, incomes, trusted } =
      req.body;
    await Register.register(username, email);
    const newUser = await User.register({
      username,
      password,
      email,
      totalAssets,
    });
    let newIncomes = await Income.addManyIncomes(incomes, newUser._id);
    await scheduleManyIncomeJobs(newIncomes);
    setCookieTokens(res, newUser, trusted);
    await sendConfirmEmail(email, username);
    return res.status(201).json({ newUser });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getOneTimeCode, confirmOneTimeCode, registerUser };
