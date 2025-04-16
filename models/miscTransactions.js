const { BadRequestError } = require("../expressError");
const { TransactionCollection } = require("../schemas/miscTransactions");

// class for CRUD operations for miscellaneous transactions stored in db
class Transaction {
  // returns all of a single user's transactions
  static async getUserTransactions(user) {
    try {
      const res = await TransactionCollection.find({ user })
        .select("_id title date transaction operation fromIncome")
        .sort({ date: -1 });
      return res;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  // gets and returns a single user's five most recent transactions
  static async getUserRecentTransactions(user) {
    try {
      const res = await TransactionCollection.find({ user })
        .select("_id title date transaction operation fromIncome")
        .limit(5)
        .sort({ date: -1 });
      return res;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  // adds a new transaction document to db with a title, user id, transaction value, and date
  static async addTransaction(title, user, transaction, operation, date) {
    try {
      if (transaction < 0) transaction *= -1;
      const res = await TransactionCollection.create({
        title,
        user,
        transaction,
        operation,
        date,
      });
      return {
        _id: res._id,
        date: res.date,
        fromIncome: res.fromIncome,
        operation: res.operation,
        title: res.title,
        transaction: res.transaction,
      };
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }
}

module.exports = Transaction;
