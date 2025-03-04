const express = require("express");
const { BadRequestError } = require("../expressError");
const User = require("../models/users");
const Expenses = require("../models/expenses");
const Income = require("../models/incomes");
const { createToken } = require("../helpers/token");
const { ensureLoggedIn } = require("../middleware/auth");

const router = express.Router();

router.get("/token", async function (req, res, next) {
  const token = req.cookies.refresh_token;
  return res.json({ token });
});

router.post("/login", async function (req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new BadRequestError(
        "Both username and password fields must be filled!"
      );
    }
    const user = await User.authenticate(username, password);
    const recentExpenses = await Expenses.getUserRecentExpenses(user._id);
    const token = createToken(user);
    res
      .cookie("refresh_token", token, {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: true,
      })
      .status(200);
    return res.status(200).json({ user, recentExpenses });
  } catch (err) {
    return next(err);
  }
});

router.post("/register", async function (req, res, next) {
  try {
    let { username, password, email, totalAssets, incomes } = req.body;
    const newUser = await User.register({
      username,
      password,
      email,
      totalAssets,
    });
    const newIncomes = await Income.addManyIncomes(incomes, newUser._id);
    const newUserWithIncomes = await User.addManyIncomes(
      newIncomes,
      newUser._id
    );
    const recentExpenses = await Expenses.getUserRecentExpenses(newUser._id);
    const token = createToken(newUser);
    res
      .cookie("refresh_token", token, {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: true,
      })
      .status(201);
    delete newUser.password;
    return res.status(201).json({ newUserWithIncomes, recentExpenses });
  } catch (err) {
    return next(err);
  }
});

router.post("/confirmUserInfo", async function (req, res, next) {
  try {
    const { username, email } = req.body;
    const userExists = await User.getUserTwoFactor(username, email);
    return res.status(200).json(userExists);
  } catch (err) {
    return next(err);
  }
});

router.post("/confirmOTP", async function (req, res, next) {
  try {
    const { username, email, code } = req.body;
    await User.confirmUserCode(username, email, code);
    return res.status(200).json({ message: "verification code confirmed!" });
  } catch (err) {
    return next(err);
  }
});

router.patch("/resetPassword", async function (req, res, next) {
  try {
    const { username, email, newPassword } = req.body;
    await User.resetUserPassword(username, email, newPassword);
    return res.status(200).json({ message: "password reset success" });
  } catch (err) {
    return next(err);
  }
});

router.get("/logOut", ensureLoggedIn, async function (req, res, next) {
  try {
    res.clearCookie("refresh_token").status(200);
    res.send();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
