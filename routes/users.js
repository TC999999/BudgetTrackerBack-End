const express = require("express");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const {
  getCurrentUser,
  addTransaction,
  editUser,
  getUserForEdit,
} = require("../controllers/users");

const router = express.Router();

// route to get a single user for edit
router.get("/:id", ensureCorrectUser, getUserForEdit);

// route to update a user's information
router.patch("/:id/edit", ensureCorrectUser, editUser);

// route to get user from id stored in access token data
router.get("/get/currentuser", ensureLoggedIn, getCurrentUser);

// route to update user savings data and add a new transaction for the user whose id is stored
// in access token data
router.patch("/update/assets", ensureLoggedIn, addTransaction);

module.exports = router;
