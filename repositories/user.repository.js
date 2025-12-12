import { pool } from "../config/database.js";
import { logger } from "../config/logger.js";

export const userRepository = {
  getAll: async () => {
    logger.info("Repository: Fetching all users");
    try {
      const db = await pool;
      const [rows] = await db.query("SELECT * FROM Users");
      return rows;
    } catch (err) {
      logger.error("Repository Error: getAll failed", err);
      throw err;
    }
  },

  getById: async (id) => {
    logger.info(`Repository: Fetching user with ID ${id}`);
    try {
      const db = await pool;
      const [rows] = await db.query("SELECT * FROM Users WHERE id = ?", [id]);
      return rows[0];
    } catch (err) {
      logger.error(`Repository Error: getById failed for ID ${id}`, err);
      throw err;
    }
  },

  create: async ({ id, name, email, phone }) => {
    logger.info(`Repository: Creating user ${email}`);
    try {
      const db = await pool;
      await db.query(
        "INSERT INTO Users (id, name, email, phone) VALUES (?, ?, ?, ?)",
        [id, name, email, phone]
      );
      return { id, name, email, phone };
    } catch (err) {
      logger.error("Repository Error: create failed", err);
      throw err;
    }
  },

  update: async (id, { name, email, phone }) => {
    logger.info(`Repository: Updating user ${id}`);
    try {
      const db = await pool;
      await db.query(
        "UPDATE Users SET name = ?, email = ?, phone = ? WHERE id = ?",
        [name, email, phone, id]
      );
      return { id, name, email, phone };
    } catch (err) {
      logger.error(`Repository Error: update failed for ID ${id}`, err);
      throw err;
    }
  },

  delete: async (id) => {
    logger.info(`Repository: Deleting user ${id}`);
    try {
      const db = await pool;
      await db.query("DELETE FROM Users WHERE id = ?", [id]);
      return true;
    } catch (err) {
      logger.error(`Repository Error: delete failed for ID ${id}`, err);
      throw err;
    }
  },
};
