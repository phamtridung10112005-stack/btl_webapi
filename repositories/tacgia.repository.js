// File: tacgia.repository.js
import { pool } from "../config/database.js";
import { logger } from "../config/logger.js";
export const tacgiaRepository = {
  getAll: async () => {
    logger.info('Repository: Fetching all tacgias');
    try {
      const db = await pool;
      const [rows] = await db.query('SELECT * FROM TacGia');
      return rows;
    } catch (err) {
      logger.error("Repository Error: getAll failed", err);
      throw err;
    }
  },
getByMaTacGia: async (matacgia) => {
    logger.info(`Repository: Fetching tacgia with matacgia ${matacgia}`);
    try {
      const db = await pool;
      const [rows] = await db.query('SELECT * FROM TacGia WHERE MaTacGia = ?', [matacgia]);
      return rows[0];
    } catch (err) {
      logger.error(`Repository Error: getByMaTacGia failed for matacgia ${matacgia}`, err);
      throw err;
    }
  },
create: async ({ MaTacGia, TenTacGia, MoTa }) => {
    logger.info(`Repository: Creating tacgia ${MaTacGia}`);
    try {
      const db = await pool;
      await db.query(
        'INSERT INTO TacGia (MaTacGia, TenTacGia,MoTa) VALUES (?, ?, ?)',
        [MaTacGia, TenTacGia, MoTa]
      );
      return { MaTacGia, TenTacGia, MoTa };
    } catch (err) {
      logger.error("Repository Error: create failed", err);
      throw err;
    }
  },

    update: async (MaTacGia, { TenTacGia, MoTa }) => {
    logger.info(`Repository: Updating tacgia ${MaTacGia}`);
    try {
      const db = await pool;
      await db.query(
        'UPDATE TacGia SET TenTacGia = ?, MoTa = ? WHERE MaTacGia = ?',
        [TenTacGia, MoTa, MaTacGia]
      );
      return { MaTacGia, TenTacGia, MoTa };
    } catch (err) {
      logger.error(`Repository Error: update failed for MaTacGia ${MaTacGia}`, err);
      throw err;
    }
  },

    delete: async (MaTacGia) => {
    logger.info(`Repository: Deleting tacgia ${MaTacGia}`);
    try {
      const db = await pool;
      await db.query('DELETE FROM TacGia WHERE MaTacGia = ?', [MaTacGia]);
      return true;
    } catch (err) {
      logger.error(`Repository Error: delete failed for MaTacGia ${MaTacGia}`, err);
      throw err;
    }
  },
};
