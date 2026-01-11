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
  getByEmail: async (email) => {
    logger.info(`Repository: Fetching user with email ${email}`);
    try {
      const db = await pool;
      const [rows] = await db.query("SELECT * FROM Users WHERE email = ?", [email]);
      return rows[0];
    } catch (err) {
      logger.error(`Repository Error: getByEmail failed for email ${email}`, err);
      throw err;
    }
  },

 create: async (user) => {
    logger.info(`Repository: Creating user ${user.email}`);
    try {
      const db = await pool;
      // Đảm bảo role không bao giờ bị NULL
      const finalRole = user.role || 'USER'; 
      
      await db.query(
        "INSERT INTO Users (username, email, password, phone, role) VALUES (?, ?, ?, ?, ?)",
        [user.username, user.email, user.password, user.phone, finalRole] // Dùng finalRole
      );
      return { ...user, role: finalRole };
    } catch (err) {
      logger.error("Repository Error: create failed", err);
      throw err;
    }
  },
  update: async (id, data) => {
    logger.info(`Repository: Updating user ${id}`);
    try {
      const db = await pool;
      
      // Nếu có mật khẩu mới -> Cập nhật cả mật khẩu
      if (data.password) {
          await db.query(
            "UPDATE Users SET username = ?, email = ?, phone = ?, password = ? WHERE id = ?",
            [data.username, data.email, data.phone, data.password, id]
          );
      } else {
          // Nếu không có mật khẩu -> Chỉ cập nhật thông tin thường
          await db.query(
            "UPDATE Users SET username = ?, email = ?, phone = ? WHERE id = ?",
            [data.username, data.email, data.phone, id]
          );
      }
      
      return { id, ...data };
    } catch (err) {
      logger.error(`Repository Error: update failed for ID ${id}`, err);
      throw err;
    }
  },

  // [MỚI] Hàm cập nhật Role (Dùng để Khóa/Mở khóa)
  updateRole: async (id, newRole) => {
    logger.info(`Repository: Updating role for user ${id} to ${newRole}`);
    try {
      const db = await pool;
      await db.query("UPDATE Users SET role = ? WHERE id = ?", [newRole, id]);
      return true;
    } catch (err) {
      logger.error(`Repository Error: updateRole failed for ID ${id}`, err);
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