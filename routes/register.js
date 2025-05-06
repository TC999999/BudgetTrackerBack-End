const express = require("express");
const {
  getOneTimeCode,
  confirmOneTimeCode,
  registerUser,
} = require("../controllers/register");
const router = express.Router();

router.post("/send", getOneTimeCode);

router.patch("/confirm", confirmOneTimeCode);

router.post("/create", registerUser);

module.exports = router;
