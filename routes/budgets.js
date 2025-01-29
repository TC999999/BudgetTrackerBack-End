const express = require("express");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const Budget = require("../models/budgets");
const User = require("../models/users");

const router = express.Router();

router.post("/add/new", ensureLoggedIn, async function (req, res, next) {
  try {
    const { title, username, moneyAllocated } = req.body;
    const budget = await Budget.addBudget(title, moneyAllocated);
    await User.addBudget(username, budget._id);
    return res.status(201).json({ budget });
  } catch (err) {
    return next(err);
  }
});

router.get("/get/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    // console.log(req);
    let username = res.locals.user.username;
    const budget = await Budget.getBudget(username, req.params.id);
    console.log(budget);
    return res.status(200).json({ budget });
  } catch (err) {
    // console.log("ERROR IS HERE TO RUIN MY LIFE");
    return next(err);
  }
});

module.exports = router;
