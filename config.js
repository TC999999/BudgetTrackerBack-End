require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

const PORT = +process.env.port || 3001;

const DATABASE_URL = process.env.DATABASE_URL;

const BCRYPT_WORK_FACTOR = 12;

module.exports = { SECRET_KEY, PORT, DATABASE_URL, BCRYPT_WORK_FACTOR };
