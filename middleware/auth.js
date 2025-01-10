const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

function authenticateJWT(req, res, next) {
  try {
    const token = req.cookies.refresh_token;
    if (token) {
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) {
      throw new UnauthorizedError("You must be logged in to access page");
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

function ensureCorrectUser(req, res, next) {
  try {
    if (res.locals.user.username !== req.params.username) {
      throw new UnauthorizedError("Incorrect user");
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = { authenticateJWT, ensureLoggedIn, ensureCorrectUser };
