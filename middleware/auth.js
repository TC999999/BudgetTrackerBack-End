const jwt = require("jsonwebtoken");
const { REFRESH_SECRET_KEY, ACCESS_SECRET_KEY } = require("../config");
const { UnauthorizedError, UnacceptableError } = require("../expressError");

// function authenticateJWT(req, res, next) {
//   try {
//     const token = req.cookies.refresh_token;
//     if (token) {
//       res.locals.user = jwt.verify(token, REFRESH_SECRET_KEY);
//     }
//     return next();
//   } catch (err) {
//     return next(err);
//   }
// }

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

// function ensureRefreshToken(req, res, next) {
//   try {
//     if (!req.cookies.refresh_token) {
//       throw new UnacceptableError("You must be logged in to perform this action.");
//     }
//     return next();
//   } catch (err) {
//     return next(err);
//   }
// }

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

module.exports = { authenticateJWT, ensureLoggedIn, ensureCorrectUser };
