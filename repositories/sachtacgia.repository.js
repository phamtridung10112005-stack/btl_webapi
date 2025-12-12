// File: sachtacgia.repository.js
import { pool } from "../config/database.js";
import { logger } from "../config/logger.js";

export const sachtacgiaRepository = {
  getAll: async () => {
    logger.info('Repository: Fetching all sachtacgias');
    try {
      const db = await pool;
      const [rows] = await db.query('SELECT * FROM SachTacGia');
      return rows;
    } catch (err) {
      logger.error("Repository Error: getAll failed", err);
      throw err;
    }
  },
create: async ({ MaSach, MaTacGia }) => {
    logger.info(`Repository: Creating sachtacgia with masach ${MaSach} and matacgia ${MaTacGia}`);
    try {
      const db = await pool;
      await db.query(
        'INSERT INTO SachTacGia (MaSach, MaTacGia) VALUES (?, ?)',
        [MaSach, MaTacGia]
      );
      return { MaSach, MaTacGia };
    } catch (err) {
      logger.error("Repository Error: create failed", err);
      throw err;
    }
  },
  delete: async (MaSach, MaTacGia) => {
    logger.info(`Repository: Deleting sachtacgia with masach ${MaSach} and matacgia ${MaTacGia}`);
    try {
      const db = await pool;
      await db.query('DELETE FROM SachTacGia WHERE MaSach = ? AND MaTacGia = ?', [MaSach, MaTacGia]);
      return true;
    } catch (err) {
      logger.error(`Repository Error: delete failed for MaSach ${MaSach} and matacgia ${MaTacGia}`, err);
      throw err;
    }
  },
};
