// File: theloai.repository.js
import { pool } from "../config/database.js";
import { logger } from "../config/logger.js";

export const theloaiRepository = {
  getAll: async () => {
    logger.info('Repository: Fetching all theloais');
    try {
      const db = await pool;
      const [rows] = await db.query('SELECT * FROM TheLoai');
      return rows;
    } catch (err) {
      logger.error("Repository Error: getAll failed", err);
      throw err;
    }
  },
getByMaTheLoai: async (matheloai) => {
    logger.info(`Repository: Fetching theloai with matheloai ${matheloai}`);
    try {
      const db = await pool;
      const [rows] = await db.query('SELECT * FROM TheLoai WHERE MaTheLoai = ?', [matheloai]);
      return rows[0];
    } catch (err) {
      logger.error(`Repository Error: getByMaTheLoai failed for matheloai ${matheloai}`, err);
      throw err;
    }
  },
create: async ({ MaTheLoai, TenTheLoai }) => {
    logger.info(`Repository: Creating theloai ${MaTheLoai}`);
    try {
      const db = await pool;
      await db.query(
        'INSERT INTO TheLoai (MaTheLoai, TenTheLoai) VALUES (?, ?)',
        [MaTheLoai, TenTheLoai]
      );
      return { MaTheLoai, TenTheLoai };
    } catch (err) {
      logger.error("Repository Error: create failed", err);
      throw err;
    }
  },
  update: async (MaTheLoai, { TenTheLoai }) => {
    logger.info(`Repository: Updating theloai ${MaTheLoai}`);
    try {
      const db = await pool;
      await db.query(
        'UPDATE TheLoai SET TenTheLoai = ? WHERE MaTheLoai = ?',
        [TenTheLoai, MaTheLoai]
      );
      return { MaTheLoai, TenTheLoai };
    } catch (err) {
      logger.error(`Repository Error: update failed for MaTheLoai ${MaTheLoai}`, err);
      throw err;
    }
  },
  delete: async (MaTheLoai) => {
    logger.info(`Repository: Deleting theloai ${MaTheLoai}`);
    try {
      const db = await pool;
      await db.query('DELETE FROM TheLoai WHERE MaTheLoai = ?', [MaTheLoai]);
      return true;
    } catch (err) {
      logger.error(`Repository Error: delete failed for MaTheLoai ${MaTheLoai}`, err);
      throw err;
    }
  },
};
