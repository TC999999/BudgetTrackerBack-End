const express = require("express");
const { BadRequestError } = require("../expressError");
const User = require("../models/users");
const Income = require("../models/incomes");
const {
  ACCESS_EXPIRATION_MS,
  REFRESH_EXPIRATION_MS,
  REFRESH_EXPIRATION_NO_TRUST_MS,
} = require("../config");
const {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} = require("../helpers/token");
const { loadIncomeJobs } = require("../cron/loadIncomeJobs");
const { sendConfirmEmail } = require("../sendEmail");

const router = express.Router();

// whenever the page refreshes, checks for a refresh token and creates a new access token and sets it in
// an http-only cookie, lets the front-end know that the token exists (does not send token through to
// front end); if no refresh token exists, but an access token exists in cookies, clears access token from cookies
router.get("/token", async function (req, res, next) {
  const token = verifyRefreshToken(req.cookies.refresh_token, res);
  if (!token && req.cookies.access_token) {
    res.clearCookie("access_token").status(200);
  }
  return res.json({ token });
});

// authenticates the user with their username and password, retrieves the user's most recent expenses,
// sets both the refresh and access tokens into cookies, and sends user data back to frontend; if the user sends
// that they trust the device they are using, the tokens will have a longer time before expiration
router.post("/login", async function (req, res, next) {
  try {
    const { username, password, trusted } = req.body;
    if (!username || !password) {
      throw new BadRequestError(
        "Both username and password fields must be filled!"
      );
    }
    const user = await User.authenticate(username, password);
    const refreshToken = createRefreshToken(user, trusted);
    const accessToken = createAccessToken(user);
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
    res
      .cookie("access_token", accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: ACCESS_EXPIRATION_MS,
        sameSite: "strict",
      })
      .status(200);

    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
});

// creates a new user with the request body data the user as well as any intital incomes the user created
// (adds them to both db and income job schdeule map). Additionally, sets new refresh and access tokens
// into cookies, returns the user's information to the frontend
router.post("/register", async function (req, res, next) {
  try {
    const { username, password, email, totalAssets, incomes, trusted } =
      req.body;
    const newUser = await User.register({
      username,
      password,
      email,
      totalAssets,
    });
    await Income.addManyIncomes(incomes, newUser._id);
    await loadIncomeJobs();
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
    // await sendConfirmEmail(email, username);
    return res.status(201).json({ newUser });
  } catch (err) {
    return next(err);
  }
});

// confirms if a user with a specified username and email exist in the users collection
router.post("/confirmUserInfo", async function (req, res, next) {
  try {
    const { username, email } = req.body;
    const userExists = await User.getUserTwoFactor(username, email);
    return res.status(201).json(userExists);
  } catch (err) {
    return next(err);
  }
});

// confirms if a one time verification code tied with a user's username and email exists in the db
router.post("/confirmOTP", async function (req, res, next) {
  try {
    const { username, email, code } = req.body;
    await User.confirmUserCode(username, email, code);
    return res.status(201).json({ message: "verification code confirmed!" });
  } catch (err) {
    return next(err);
  }
});

// updates user's password if they have made a request to do so
router.patch("/resetPassword", async function (req, res, next) {
  try {
    const { username, email, newPassword } = req.body;
    await User.resetUserPassword(username, email, newPassword);
    return res.status(200).json({ message: "password reset success" });
  } catch (err) {
    return next(err);
  }
});

// removes both the access JWT and refresh JWT from cookies
router.get("/logOut", async function (req, res, next) {
  try {
    res.clearCookie("access_token").status(200);
    res.clearCookie("refresh_token").status(200);
    res.send();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
