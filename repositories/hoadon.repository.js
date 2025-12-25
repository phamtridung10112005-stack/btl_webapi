import { pool } from "../config/database.js";
import { logger } from "../config/logger.js";

export const hoadonRepository = {
  getAll: async () => {
    logger.info('Repository: Fetching all hoadons');
    try {
      const db = await pool;
      const [rows] = await db.query('SELECT * FROM HoaDon');
      return rows;
    } catch (err) {
      logger.error("Repository Error: getAll failed", err);
      throw err;
    }
  },

  getByMaHoaDon: async (mahoadon) => {
    logger.info(`Repository: Fetching hoadon with mahoadon ${mahoadon}`);
    try {
      const db = await pool;
      const [rows] = await db.query('SELECT * FROM HoaDon WHERE MaHoaDon = ?', [mahoadon]);
      return rows[0];
    } catch (err) {
      logger.error(`Repository Error: getByMaHoaDon failed for mahoadon ${mahoadon}`, err);
      throw err;
    }
  },

  // Lấy danh sách hóa đơn theo User
  getByUserId: async (user_id) => {
    logger.info(`Repository: Fetching hoadon for user ${user_id}`);
    try {
      const db = await pool;
      const [rows] = await db.query('SELECT * FROM HoaDon WHERE user_id = ?', [user_id]);
      return rows;
    } catch (err) {
      logger.error(`Repository Error: getByUserId failed for user ${user_id}`, err);
      throw err;
    }
  },

  create: async ({ user_id, MaSach, SoLuong, TongTien, NgayLap, TrangThai, DiaChiGiaoHang, MaGiamGia }) => {
    logger.info(`Repository: Creating hoadon for user ${user_id}`);
    try {
      const db = await pool;
      
      const finalDate = NgayLap || new Date();
      const finalStatus = TrangThai || 'ChoXacNhan';

      const [result] = await db.query(
        'INSERT INTO HoaDon (user_id, MaSach, SoLuong, TongTien, NgayLap, TrangThai, DiaChiGiaoHang, MaGiamGia) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [user_id, MaSach, SoLuong, TongTien, finalDate, finalStatus, DiaChiGiaoHang, MaGiamGia]
      );

      return { 
        MaHoaDon: result.insertId, 
        user_id, 
        MaSach, 
        SoLuong, 
        TongTien,
        NgayLap: finalDate,
        TrangThai: finalStatus,
        DiaChiGiaoHang,
        MaGiamGia
      };
    } catch (err) {
      logger.error("Repository Error: create failed", err);
      throw err;
    }
  },

  update: async (MaHoaDon, { user_id, MaSach, SoLuong, TongTien, NgayLap, TrangThai, DiaChiGiaoHang, MaGiamGia }) => {
    logger.info(`Repository: Updating hoadon ${MaHoaDon}`);
    try {
      const db = await pool;
      
      await db.query(
        'UPDATE HoaDon SET user_id = ?, MaSach = ?, SoLuong = ?, TongTien = ?, NgayLap = ?, TrangThai = ?, DiaChiGiaoHang = ?, MaGiamGia = ? WHERE MaHoaDon = ?',
        [user_id, MaSach, SoLuong, TongTien, NgayLap, TrangThai, DiaChiGiaoHang, MaGiamGia, MaHoaDon]
      );

      return { MaHoaDon, user_id, MaSach, SoLuong, TongTien, NgayLap, TrangThai, DiaChiGiaoHang, MaGiamGia };
    } catch (err) {
      logger.error(`Repository Error: update failed for MaHoaDon ${MaHoaDon}`, err);
      throw err;
    }
  },

  delete: async (MaHoaDon) => {
    logger.info(`Repository: Deleting hoadon ${MaHoaDon}`);
    try {
      const db = await pool;
      await db.query('DELETE FROM HoaDon WHERE MaHoaDon = ?', [MaHoaDon]);
      return true;
    } catch (err) {
      logger.error(`Repository Error: delete failed for MaHoaDon ${MaHoaDon}`, err);
      throw err;
    }
  },
};