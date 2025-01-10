const express = require("express");

const router = express.Router();

router.get("/", function (req, res, next) {
  return res.json({ message: "hello" });
});

module.exports = router;
