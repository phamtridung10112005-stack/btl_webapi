// File: nhaxuatban.repository.js
import { pool } from "../config/database.js";
import { logger } from "../config/logger.js";
export const nhaxuatbanRepository = {
  getAll: async () => {
    logger.info('Repository: Fetching all nhaxuatbans');
    try {
      const db = await pool;
      const [rows] = await db.query('SELECT * FROM NhaXuatBan');
      return rows;
    } catch (err) {
      logger.error("Repository Error: getAll failed", err);
      throw err;
    }
  },
getByMaNXB: async (manxb) => {
    logger.info(`Repository: Fetching nhaxuatban with manxb ${manxb}`);
    try {
      const db = await pool;
      const [rows] = await db.query('SELECT * FROM NhaXuatBan WHERE MaNXB = ?', [manxb]);
      return rows[0];
    } catch (err) {
      logger.error(`Repository Error: getByMaNXB failed for manxb ${manxb}`, err);
      throw err;
    }
  },
create: async ({ MaNXB, TenNXB, DiaChi, SoDienThoai }) => {
    logger.info(`Repository: Creating nhaxuatban ${MaNXB}`);
    try {
      const db = await pool;
      await db.query(
        'INSERT INTO NhaXuatBan (MaNXB, TenNXB, DiaChi, SoDienThoai) VALUES (?, ?, ?, ?)',
        [MaNXB, TenNXB, DiaChi, SoDienThoai]
      );
      return { MaNXB, TenNXB, DiaChi, SoDienThoai };
    } catch (err) {
      logger.error("Repository Error: create failed", err);
      throw err;
    }
  },
  update: async (MaNXB, { TenNXB, DiaChi, SoDienThoai}) => {
    logger.info(`Repository: Updating nhaxuatban ${MaNXB}`);
    try {
      const db = await pool;
      await db.query(
        'UPDATE NhaXuatBan SET TenNXB = ?, DiaChi = ?, SoDienThoai = ?  WHERE MaNXB = ?',
        [TenNXB, DiaChi, SoDienThoai, MaNXB]
      );
      return { MaNXB, TenNXB, DiaChi, SoDienThoai };
    } catch (err) {
      logger.error(`Repository Error: update failed for MaNXB ${MaNXB}`, err);
      throw err;
    }
  },
  delete: async (MaNXB) => {
    logger.info(`Repository: Deleting nhaxuatban ${MaNXB}`);
    try {
      const db = await pool;
      await db.query('DELETE FROM NhaXuatBan WHERE MaNXB = ?', [MaNXB]);
      return true;
    } catch (err) {
      logger.error(`Repository Error: delete failed for MaNXB ${MaNXB}`, err);
      throw err;
    }
  },
};
