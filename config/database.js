import mysql from "mysql2/promise";
import "dotenv/config";
import { logger } from "./logger.js";

const connectionOptions = {
  host: process.env.MYSQL_HOST || "localhost",
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USERNAME || "root",
  password: process.env.MYSQL_PASSWORD || "12345678",
  database: process.env.MYSQL_DBNAME || "shopsach",

  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
};

if (process.env.MYSQL_URI) {
  Object.assign(connectionOptions, {
    uri: process.env.MYSQL_URI,
  });
}

export const pool = mysql.createPool(connectionOptions);

pool
  .getConnection()
  .then(() => logger.info("MySQL connected successfully"))
  .catch((err) => logger.error("MySQL connection failed", err));
