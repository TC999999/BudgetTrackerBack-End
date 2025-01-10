DROP DATABASE IF EXISTS budget_tracker;

CREATE DATABASE budget_tracker;

\c budget_tracker;

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS budgets;
DROP TABLE IF EXISTS expense;

CREATE TABLE users(
    username VARCHAR(25) NOT NULL UNIQUE PRIMARY KEY,
    password VARCHAR(20) NOT NULL,
    total_money DECIMAL(10,2) NOT NULL CHECK (total_money>=0),
);

CREATE TABLE budgets(
    id SERIAL PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    username VARCHAR (25) REFERENCES users ON DELETE CASCADE,
    money_allocated DECIMAL(10,2) NOT NULL CHECK (money_allocated>=0),
);

CREATE TABLE expenses(
    id SERIAL PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    budget_id INTEGER NOT NULL REFERENCES budgets,
    transaction DECIMAL(10,2) NOT NULL CHECK (transaction>=0),
    transaction_date DATE NOT NULL,
);