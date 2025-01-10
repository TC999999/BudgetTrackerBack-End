const express = require("express");
const { BadRequestError } = require("../expressError");
const User = require("../models/users");
const { createToken } = require("../helpers/token");

const router = express.Router();

router.get("/token", async function (req, res, next) {
  const token = req.cookies.refresh_token;
  return res.json({ token });
});

router.post("/login", async function (req, res, next) {
  try {
    const { username, password } = req.body;
    console.log({ username, password });
    const user = await User.authenticate(username, password);
    console.log("user is authenticated", user);
    const token = createToken(user);
    res
      .cookie("refresh_token", token, {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: true,
      })
      .status(200);
    res.send();
  } catch (err) {
    return next(err);
  }
});

router.post("/register", async function (req, res, next) {
  try {
    const newUser = await User.register(req.body);
    const token = createToken(newUser);
    res
      .cookie("refresh_token", token, {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: true,
      })
      .status(201);
    // res.send();
    return res.status(201).json({ ...newUser, token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
