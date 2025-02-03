const express = require("express");
const { ensureLoggedIn } = require("../middleware/auth");
const User = require("../models/users");

const router = express.Router();

router.get("/:username", ensureLoggedIn, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
});

router.get("/get/currentuser", ensureLoggedIn, async function (req, res, next) {
  try {
    const user = await User.get(res.locals.user.username);
    return res.status(200).json({ user });
  } catch (err) {
    console.log(err);
    return next(err);
  }
});

router.patch("/update/assets", ensureLoggedIn, async function (req, res, next) {
  try {
    const { value } = req.body;
    const user = await User.updateAssets(res.locals.user.username, value);
    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
