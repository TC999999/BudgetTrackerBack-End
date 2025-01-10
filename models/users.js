const db = require("../db");
const bcrypt = require("bcrypt");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const { BCRYPT_WORK_FACTOR } = require("../config");

class User {
  static async authenticate(username, password) {
    const res = await db.query(
      `SELECT 
              username, 
              password,
              total_money AS "totalMoney" 
             FROM 
              users 
             WHERE 
              username = $1`,
      [username]
    );

    const user = res.rows[0];
    console.log("here is user", user);

    if (user && (await bcrypt.compare(password, user.password))) {
      delete user.password;
      console.log("this is returned", user);
      return user;
    }

    throw new NotFoundError("Invalid username/password");
  }
  static async register({ username, password, totalMoney }) {
    const duplicateCheck = await db.query(
      `SELECT username FROM users WHERE username = $1`,
      [username]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Username ${username} already exists`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO 
        users (username, password, total_money) 
       VALUES ($1, $2, $3) 
       RETURNING 
        username, 
        total_money as "totalMoney"`,
      [username, hashedPassword, totalMoney]
    );

    const user = result.rows[0];

    return user;
  }

  static async get(username) {
    const res = await db.query(
      `SELECT 
        username, 
        total_money AS "totalMoney" 
       FROM 
        users 
       WHERE 
        username = $1`,
      [username]
    );

    const user = res.rows[0];

    if (!user) throw new NotFoundError(`User of ${username} does not exist`);

    return user;
  }
}

module.exports = User;
