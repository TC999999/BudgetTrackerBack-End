const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const {
  REFRESH_SECRET_KEY,
  REFRESH_EXPIRATION,
  ACCESS_SECRET_KEY,
  ACCESS_EXPIRATION,
  ACCESS_EXPIRATION_MS,
} = require("../config");

// creates refresh JWT
function createRefreshToken(user) {
  let payload = { username: user.username, id: user._id };
  return jwt.sign(payload, REFRESH_SECRET_KEY, {
    expiresIn: REFRESH_EXPIRATION,
  });
}

// creates access JWT
function createAccessToken(user) {
  let payload = { username: user.username, id: user._id };
  return jwt.sign(payload, ACCESS_SECRET_KEY, {
    expiresIn: ACCESS_EXPIRATION,
  });
}

// checks if refresh token exists; if it does, creates a new access token and stores it as an http only
// cookie
function verifyRefreshToken(refreshToken, res) {
  if (!refreshToken) return false;
  return jwt.verify(refreshToken, REFRESH_SECRET_KEY, (err, decoded) => {
    if (err) {
      return false;
    }
    if (decoded) {
      const user = { username: decoded.username, _id: decoded.id };
      const accessToken = createAccessToken(user);
      res
        .cookie("access_token", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: ACCESS_EXPIRATION_MS,
          sameSite: "strict",
        })
        .status(200);
      return true;
    }
  });
}

module.exports = {
  createRefreshToken,
  verifyRefreshToken,
  createAccessToken,
};
