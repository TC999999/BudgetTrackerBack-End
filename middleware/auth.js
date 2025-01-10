const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

function authenticateJWT(req, res, next) {
  try {
    const token = req.cookies.token;
    if (token) {
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.users) {
      throw new UnauthorizedError("You must be logged in to access page");
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = { authenticateJWT, ensureLoggedIn };
