const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { NotFoundError } = require("./expressError");

const userRoutes = require("./routes/users");

const app = express();

// Parses login tokens to browser cookies
app.use(cookieParser());
app.use(cors());
app.use(express.json());

//for development use only
app.use(morgan("tiny"));

app.use("/", userRoutes);

// 404 Error Handler
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

// Error handler
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
