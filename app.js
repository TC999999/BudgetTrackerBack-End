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

const app = express();

// Parses login tokens to browser cookies
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//for development use only
app.use(morgan("tiny"));
app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/budgets", budgetRoutes);
app.use("/expenses", expenseRoutes);
app.use("/incomes", incomeRoutes);

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
