// File: chitiethd.repository.js
import { pool } from "../config/database.js";
import { logger } from "../config/logger.js";

async function recalculateTongTien(MaHoaDon) {
  await pool.query(
    `
    UPDATE HoaDon
    SET TongTien = (
        SELECT IFNULL(SUM(ct.SoLuong * s.GiaSach), 0)
        FROM ChiTietHD ct
        JOIN Sach s ON ct.MaSach = s.MaSach
        WHERE ct.MaHoaDon = ?
    )
    WHERE MaHoaDon = ?
    `,
    [MaHoaDon, MaHoaDon]
  );
}


export const chitiethdRepository = {
  getAll: async () => {
    logger.info('Repository: Fetching all chitiethds');
    try {
      const db = await pool;
      const [rows] = await db.query('SELECT * FROM ChiTietHD');
      return rows;
    } catch (err) {
      logger.error("Repository Error: getAll failed", err);
      throw err;
    }
  },
  getByMaHoaDonAndMaSach: async (mahoadon, masach) => {
    logger.info(`Repository: Fetching chitiethd with mahoadon ${mahoadon} and masach ${masach}`);
    try {
      const db = await pool;
      const [rows] = await db.query('SELECT * FROM ChiTietHD WHERE MaHoaDon = ? AND MaSach = ?', [mahoadon, masach]);
      return rows[0];
    } catch (err) {
      logger.error(`Repository Error: getByMaHoaDonAndMaSach failed for mahoadon ${mahoadon} and ${masach}`, err);
      throw err;
    }
  },
getByMaHoaDon: async (mahoadon) => {
    logger.info(`Repository: Fetching chitiethd with mahoadon ${mahoadon}`);
    try {
      const db = await pool;
      const [rows] = await db.query('SELECT * FROM ChiTietHD WHERE MaHoaDon = ?', [mahoadon]);
      return rows[0];
    } catch (err) {
      logger.error(`Repository Error: getByMaHoaDon failed for mahoadon ${mahoadon}`, err);
      throw err;
    }
  },
create: async ({ MaHoaDon, MaSach, SoLuong }) => {
    logger.info(`Repository: Creating chitiethd ${MaHoaDon}`);
    try {
      const db = await pool;
      await db.query(
        'INSERT INTO ChiTietHD (MaHoaDon, MaSach, SoLuong) VALUES (?, ?, ?)',
        [MaHoaDon, MaSach, SoLuong]
      );
      await recalculateTongTien(MaHoaDon);
      return { MaHoaDon, MaSach, SoLuong };
    } catch (err) {
      logger.error("Repository Error: create failed", err);
      throw err;
    }
},
  updateByMHDAndMS: async (MaHoaDon, MaSach, { SoLuong }) => {
    logger.info(`Repository: Updating chitiethd mhd ${MaHoaDon} and ms ${MaSach}`);
    try {
      const db = await pool;
      await db.query(
        'UPDATE ChiTietHD SET SoLuong = ? WHERE MaHoaDon = ? AND MaSach = ?',
        [SoLuong, MaHoaDon, MaSach]
      );
      await recalculateTongTien(MaHoaDon);
      return { MaHoaDon, MaSach, SoLuong };
    } catch (err) {
      logger.error(`Repository Error: update failed for MaHoaDon ${MaHoaDon} and MaSach ${MaSach}`, err);
      throw err;
    }
},
  deleteByMHDAndMS: async (MaHoaDon, MaSach) => {
    logger.info(`Repository: Deleting chitiethd mhd ${MaHoaDon} and ms ${MaSach}`);
    try {
      const db = await pool;
      await db.query('DELETE FROM ChiTietHD WHERE MaHoaDon = ? AND MaSach = ?', [MaHoaDon, MaSach]);
      await recalculateTongTien(MaHoaDon);
      return true;
    } catch (err) {
      logger.error(`Repository Error: delete failed for MaHoaDon ${MaHoaDon} and MaSach ${MaSach}`, err);
      throw err;
    }
  },
  deleteByMHD: async (MaHoaDon) => {
    logger.info(`Repository: Deleting chitiethd ${MaHoaDon}`);
    try {
      const db = await pool;
      await db.query('DELETE FROM ChiTietHD WHERE MaHoaDon = ?', [MaHoaDon]);
      await recalculateTongTien(MaHoaDon);
      return true;
    } catch (err) {
      logger.error(`Repository Error: delete failed for MaHoaDon ${MaHoaDon}`, err);
      throw err;
    }
  },
  deleteByMS: async (MaSach) => {
    logger.info(`Repository: Deleting chitiethd ${MaSach}`);
    try {
      const db = await pool;
      await db.query('DELETE FROM ChiTietHD WHERE MaSach = ?', [MaSach]);
      await recalculateTongTien(MaHoaDon);
      return true;
    } catch (err) {
      logger.error(`Repository Error: delete failed for MaSach ${MaSach}`, err);
      throw err;
    }
  },
};
