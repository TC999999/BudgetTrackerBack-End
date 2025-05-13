const { BadRequestError } = require("../expressError");
const { TransactionCollection } = require("../schemas/miscTransactions");

// class for CRUD operations for miscellaneous transactions stored in db
class Transaction {
  // returns all of a single user's transactions
  static async getUserTransactions(user) {
    try {
      const res = await TransactionCollection.find({ user })
        .select(
          "_id title date transaction operation fromIncome budgetOperation newBalance"
        )
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
        .select(
          "_id title date transaction operation fromIncome budgetOperation newBalance"
        )
        .limit(5)
        .sort({ date: -1 });
      return res;
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  // adds a new transaction document to db with a title, user id, transaction value, and date
  static async addTransaction(transactionInput) {
    try {
      let submitTransaction = {
        ...transactionInput,
        transaction:
          transactionInput.transaction < 0
            ? transactionInput.transaction * -1
            : transactionInput.transaction,
      };
      const res = await TransactionCollection.create(submitTransaction);
      return {
        _id: res._id,
        title: res.title,
        transaction: res.transaction,
        operation: res.operation,
        newBalance: res.newBalance,
        fromIncome: res.fromIncome,
        budgetOperation: res.budgetOperation,
        date: res.date,
      };
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }
}

module.exports = Transaction;
