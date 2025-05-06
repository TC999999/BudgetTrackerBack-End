const express = require("express");
const {
  findRefreshToken,
  loginUser,
  confirmUserInfo,
  confirmUserOTP,
  resetUserPassword,
  logoutUser,
} = require("../controllers/auth");

const router = express.Router();

// route to verify refresh token exists in cookies
router.get("/token", findRefreshToken);

// route to login user
router.post("/login", loginUser);

// route to confirm user info
router.post("/confirmUserInfo", confirmUserInfo);

// route to confirm one time verification code after confirming user info
router.post("/confirmOTP", confirmUserOTP);

// route to reset user password after confirming verification code
router.patch("/resetPassword", resetUserPassword);

// route to logout user
router.get("/logOut", logoutUser);

module.exports = router;
