const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { NotFoundError } = require("./expressError");

const { authenticateJWT } = require("./middleware/auth");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const budgetRoutes = require("./routes/budgets");
const expenseRoutes = require("./routes/expenses");
const incomeRoutes = require("./routes/incomes");
const sseRoutes = require("./routes/sse");

const app = express();

// Parses login tokens to browser cookies
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.ORIGIN_DOMAIN,
    credentials: true,
  })
);

// Parses JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//for development use only
app.use(morgan("tiny"));

// Sets local variables for separate users
app.use(authenticateJWT);

// CRUD Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/budgets", budgetRoutes);
app.use("/expenses", expenseRoutes);
app.use("/incomes", incomeRoutes);

// SSE Route
app.use("/events", sseRoutes);

// 404 Error Handler
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

// General Error handler
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
