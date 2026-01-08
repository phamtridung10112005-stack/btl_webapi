// File: giamgia.repository.js
import { pool } from "../config/database.js";
import { logger } from "../config/logger.js";

export const giamgiaRepository = {
  getAll: async () => {
    logger.info('Repository: Fetching all giamgias');
    try {
      const db = await pool;
      const [rows] = await db.query('SELECT * FROM GiamGia');
      return rows;
    } catch (err) {
      logger.error("Repository Error: getAll failed", err);
      throw err;
    }
  },
getByMaGiamGia: async (magiamgia) => {
    logger.info(`Repository: Fetching giamgia with magiamgia ${magiamgia}`);
    try {
      const db = await pool;
      const [rows] = await db.query('SELECT * FROM GiamGia WHERE MaGiamGia = ?', [magiamgia]);
      return rows[0];
    } catch (err) {
      logger.error(`Repository Error: getByMaGiamGia failed for magiamgia ${magiamgia}`, err);
      throw err;
    }
  },
create: async ({ MaGiamGia, PhanTramGiam }) => {
    logger.info(`Repository: Creating giamgia ${MaGiamGia}`);
    try {
      const db = await pool;
      await db.query(
        'INSERT INTO GiamGia (MaGiamGia, PhanTramGiam) VALUES (?, ?)',
        [MaGiamGia, PhanTramGiam]
      );
      return { MaGiamGia, PhanTramGiam };
    } catch (err) {
      logger.error("Repository Error: create failed", err);
      throw err;
    }
  },
  update: async (MaGiamGia, { PhanTramGiam }) => {
    logger.info(`Repository: Updating giamgia ${MaGiamGia}`);
    try {
      const db = await pool;
      await db.query(
        'UPDATE GiamGia SET PhanTramGiam = ? WHERE MaGiamGia = ?',
        [PhanTramGiam, MaGiamGia]
      );
      return { MaGiamGia, PhanTramGiam };
    } catch (err) {
      logger.error(`Repository Error: update failed for MaGiamGia ${MaGiamGia}`, err);
      throw err;
    }
  },
  delete: async (MaGiamGia) => {
    logger.info(`Repository: Deleting giamgia ${MaGiamGia}`);
    try {
      const db = await pool;
      await db.query('DELETE FROM GiamGia WHERE MaGiamGia = ?', [MaGiamGia]);
      return true;
    } catch (err) {
      logger.error(`Repository Error: delete failed for MaGiamGia ${MaGiamGia}`, err);
      throw err;
    }
  },
};
