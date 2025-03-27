const jwt = require("jsonwebtoken");
const { ACCESS_SECRET_KEY } = require("../config");
const { UnauthorizedError, UnacceptableError } = require("../expressError");

// when the server receives a request, checks if an access token is stored in cookies and stores in
// res.locals
function authenticateJWT(req, res, next) {
  try {
    const token = req.cookies.access_token;
    if (token) {
      res.locals.user = jwt.verify(token, ACCESS_SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

// if user is not found is res.locals, refuses request and sends an error
function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) {
      throw new UnacceptableError(
        "Your access session has expired. Please refresh and try again."
      );
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

// if user is not found is res.locals, refuses request and sends an error
function ensureRefreshToken(req, res, next) {
  try {
    if (!res.locals.user) {
      throw new UnauthorizedError(
        "You are logged out. Please log in to your account and try again."
      );
    }
    return next();
  } catch (err) {
    return next(err);
  }
}
// if user id in res.locals and in url parameters don't match, an error is thrown
function ensureCorrectUser(req, res, next) {
  try {
    if (!res.locals.user) {
      throw new UnauthorizedError("You must be logged in to access page");
    } else if (res.locals.user.username !== req.params.username) {
      throw new UnauthorizedError("Incorrect User");
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureRefreshToken,
  ensureCorrectUser,
};
