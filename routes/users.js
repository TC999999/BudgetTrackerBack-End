const express = require("express");

const { ensureLoggedIn } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/users");
const { createToken } = require("../helpers/token");

const router = express.Router();

router.post("/newuser", async function (req, res, next) {
  try {
    const newUser = await User.register(req.body);
    const token = createToken(newUser);
    res.cookie("refresh_token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: true,
    });
    res.send();
    // return res.status(201).json({ ...newUser, token });
    // res.send()
  } catch (err) {
    return next(err);
  }
});

router.get("/getuser", ensureLoggedIn, async function (req, res, next) {
  try {
    const user = await User.get(res.locals.user.username);
    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
});

router.get("/hello", function (req, res, next) {
  return res.json({ message: "hello" });
});

module.exports = router;
