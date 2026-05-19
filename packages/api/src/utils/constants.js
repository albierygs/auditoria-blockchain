require("dotenv").config();

const PORT = Number(process.env.PORT);
const DATABASE_URL = String(process.env.DATABASE_URL);

const SALT_BCRYPT = Number(process.env.SALT_BCRYPT);

const SECRET_KET_JWT = process.env.SECRET_KET_JWT;
const JWT_EXPIRATION_TIME = Number(process.env.JWT_EXPIRATION_TIME);
const JWT_EXPIRATION_UNIT = process.env.JWT_EXPIRATION_UNIT;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const FORGOT_TOKEN_EXPIRATION_MINUTES = Number(
  process.env.FORGOT_TOKEN_EXPIRATION_MINUTES
);

const EMAIL_SERVICE = process.env.EMAIL_SERVICE;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const FRONTEND_URL =
  process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_URL
    : process.env.FRONTEND_URL_DEV;

const PAGBANK_API_URL = process.env.PAGBANK_API_URL;
const PAGBANK_TOKEN = process.env.PAGBANK_TOKEN;

module.exports = {
  PORT,
  DATABASE_URL,
  SALT_BCRYPT,
  SECRET_KET_JWT,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  JWT_EXPIRATION_TIME,
  JWT_EXPIRATION_UNIT,
  FORGOT_TOKEN_EXPIRATION_MINUTES,
  EMAIL_SERVICE,
  EMAIL_PASSWORD,
  EMAIL_USER,
  FRONTEND_URL,
  PAGBANK_API_URL,
  PAGBANK_TOKEN,
};
