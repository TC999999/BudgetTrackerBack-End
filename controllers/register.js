const Register = require("../models/register");
const User = require("../models/users");
const Income = require("../models/incomes");
const {
  ACCESS_EXPIRATION_MS,
  REFRESH_EXPIRATION_MS,
  REFRESH_EXPIRATION_NO_TRUST_MS,
} = require("../config");
const { createAccessToken, createRefreshToken } = require("../helpers/token");
const { scheduleManyIncomeJobs } = require("../cron/scheduleIncomeJob");
const { sendConfirmEmail } = require("../sendEmail");

const getOneTimeCode = async (req, res, next) => {
  try {
    const { username, email } = req.body;
    await Register.getOneTimeCode(username, email);
    return res.status(201).json({ message: "Check your email" });
  } catch (err) {
    return next(err);
  }
};

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
    const refreshToken = createRefreshToken(newUser, trusted);
    res
      .cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: trusted
          ? REFRESH_EXPIRATION_MS
          : REFRESH_EXPIRATION_NO_TRUST_MS,
        sameSite: "strict",
      })
      .status(200);
    const accessToken = createAccessToken(newUser);
    res
      .cookie("access_token", accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: ACCESS_EXPIRATION_MS,
        sameSite: "strict",
      })
      .status(200);
    await sendConfirmEmail(email, username);
    return res.status(201).json({ newUser });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getOneTimeCode, confirmOneTimeCode, registerUser };
