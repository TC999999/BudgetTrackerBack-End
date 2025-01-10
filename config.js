require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

const PORT = +process.env.port || 3001;

function getDatabaseUri() {
  return process.env.DATABASE_URL || "postgresql:///budget";
}

const BCRYPT_WORK_FACTOR = 12;

module.exports = { SECRET_KEY, PORT, getDatabaseUri, BCRYPT_WORK_FACTOR };
