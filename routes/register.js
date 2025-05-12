const express = require("express");
const {
  getOneTimeCode,
  confirmOneTimeCode,
  registerUser,
} = require("../controllers/register");
const router = express.Router();

// route for sending initial information to registration collection and sending a one-time verification
// code to the user
router.post("/send", getOneTimeCode);

// route for confirming a if new user's inputted one time verification code matches the one ssaved in the db
router.patch("/confirm", confirmOneTimeCode);

// route for finally adding data from the registration collection to the user's collection after the new user
// confirms additional information (initial savings/incomes)
router.post("/create", registerUser);

module.exports = router;
