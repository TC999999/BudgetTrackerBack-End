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
        "Your access session has expired. Please refresh the page and try again."
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
    const token = req.cookies.refresh_token;
    if (!token) {
      throw new UnauthorizedError(
        "You currently do not have a refresh session. Please log in to your account and try again."
      );
    }
    return next();
  } catch (err) {
    return next(err);
  }
}
// if there is not an access token, return unacceptable error. If user id in access token and in url parameters don't match,
// returns unauthorized error
function ensureCorrectUser(req, res, next) {
  try {
    if (!req.cookies.refresh_token) {
      throw new UnauthorizedError(
        "You currently do not have a refresh session. Please log in to your account and try again."
      );
    } else if (req.cookies.refresh_token && !res.locals.user) {
      throw new UnacceptableError(
        "Your access session has expired. Please refresh the page and try again."
      );
    } else if (
      req.cookies.refresh_token &&
      res.locals.user.id !== req.params.id
    ) {
      throw new UnauthorizedError(
        "You are attempting to retrieve data from another user or one that does not exist!"
      );
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
