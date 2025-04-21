const express = require("express");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const {
  getCurrentUser,
  addTransaction,
  getUser,
} = require("../controllers/users");

const router = express.Router();

// route to get a single user
router.get("/:id", ensureCorrectUser, getUser);

// route to get user from id stored in access token data
router.get("/get/currentuser", ensureLoggedIn, getCurrentUser);

// route to update user savings data and add a new transaction for the user whose id is stored
// in access token data
router.patch("/update/assets", ensureLoggedIn, addTransaction);

module.exports = router;
