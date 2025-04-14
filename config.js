require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

// secret key used to sign access JWT
const ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY;

// string time until access JWT expires
const ACCESS_EXPIRATION = "15m";

// time until access JWT expires in milliseconds (15 minutes)
const ACCESS_EXPIRATION_MS = 15 * 60 * 1000;

// secret key used to sign refresh JWT
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;

// string time until refresh JWT expires
const REFRESH_EXPIRATION = "1d";

// time until refresh JWT expires in milliseconds (24 hours)
const REFRESH_EXPIRATION_MS = 24 * 60 * 60 * 1000;

// string time until refresh JWT expires on untrusted devices
const REFRESH_EXPIRATION_NO_TRUST = "1h";

// time until refresh JWT expires on untrusted devices in milliseconds (1 hour)
const REFRESH_EXPIRATION_NO_TRUST_MS = 60 * 60 * 1000;

// port to run the server on
const PORT = +process.env.port || 3001;

// url for mongodb database
const DATABASE_URL = process.env.DATABASE_URL;

// work factor for bcrypt hash
const BCRYPT_WORK_FACTOR = 12;

// email address for node mailer
const NODE_MAILER_USER = process.env.NODE_MAILER_USER;

// application password for node mailer
const NODE_MAILER_PASS = process.env.NODE_MAILER_PASS;

module.exports = {
  SECRET_KEY,
  PORT,
  DATABASE_URL,
  BCRYPT_WORK_FACTOR,
  NODE_MAILER_USER,
  NODE_MAILER_PASS,
  ACCESS_SECRET_KEY,
  ACCESS_EXPIRATION,
  ACCESS_EXPIRATION_MS,
  REFRESH_SECRET_KEY,
  REFRESH_EXPIRATION,
  REFRESH_EXPIRATION_MS,
};
