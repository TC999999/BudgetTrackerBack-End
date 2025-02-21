const express = require("express");
const { BadRequestError } = require("../expressError");
const User = require("../models/users");
const Expenses = require("../models/expenses");
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
    const newUser = await User.register(req.body);
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
    return res.status(201).json({ newUser, recentExpenses });
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

router.delete("/confirmOTP", async function (req, res, next) {
  try {
    const { username, email, code } = req.body;
    let confirmCode = await User.confirmUserCode(username, email, code);
    return res.status(200).json(confirmCode);
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
