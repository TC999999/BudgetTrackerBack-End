const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

function createToken(user) {
  let payload = { username: user.username, id: user._id };
  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
