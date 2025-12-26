import { pool } from "../config/database.js";
import { logger } from "../config/logger.js";

export const giohangRepository = {
  getAll: async () => {
    logger.info('Repository: Fetching all giohangs');
    try {
      const db = await pool;
      const [rows] = await db.query('SELECT * FROM GioHang');
      return rows;
    } catch (err) {
      logger.error("Repository Error: getAll failed", err);
      throw err;
    }
  },

  getByMaGioHang: async (magiohang) => {
    logger.info(`Repository: Fetching giohang with magiohang ${magiohang}`);
    try {
      const db = await pool;
      const [rows] = await db.query('SELECT * FROM GioHang WHERE MaGioHang = ?', [magiohang]);
      return rows[0];
    } catch (err) {
      logger.error(`Repository Error: getByMaGioHang failed for magiohang ${magiohang}`, err);
      throw err;
    }
  },

  // Bổ sung hàm này: Lấy giỏ hàng theo User (Rất quan trọng)
  getByUserId: async (user_id) => {
    logger.info(`Repository: Fetching giohang for user ${user_id}`);
    try {
      const db = await pool;
      const [rows] = await db.query('SELECT * FROM GioHang WHERE user_id = ?', [user_id]);
      return rows;
    } catch (err) {
      logger.error(`Repository Error: getByUserId failed for user ${user_id}`, err);
      throw err;
    }
  },

  create: async ({ user_id, MaSach, SoLuong, NgayThem }) => {
    // Lưu ý: Không truyền MaGioHang vào đây vì nó tự tăng
    logger.info(`Repository: Creating giohang item for user ${user_id}`);
    try {
      const db = await pool;
      
      // Nếu không có ngày thêm thì lấy ngày hiện tại
      const finalDate = NgayThem || new Date();

      const [result] = await db.query(
        'INSERT INTO GioHang (user_id, MaSach, SoLuong, NgayThem) VALUES (?, ?, ?, ?)',
        [user_id, MaSach, SoLuong, finalDate]
      );

      // Trả về dữ liệu kèm ID vừa tạo
      return { 
        MaGioHang: result.insertId, 
        user_id, 
        MaSach, 
        SoLuong, 
        NgayThem: finalDate 
      };
    } catch (err) {
      logger.error("Repository Error: create failed", err);
      throw err;
    }
  },

  update: async (MaGioHang, { user_id, MaSach, SoLuong, NgayThem }) => {
    logger.info(`Repository: Updating giohang ${MaGioHang}`);
    try {
      const db = await pool;
      
      // SỬA LỖI SQL Ở ĐÂY: Thêm dấu phẩy giữa các cột và xóa dấu phẩy thừa trước WHERE
      await db.query(
        'UPDATE GioHang SET user_id = ?, MaSach = ?, SoLuong = ?, NgayThem = ? WHERE MaGioHang = ?',
        [user_id, MaSach, SoLuong, NgayThem, MaGioHang] // Xóa dấu phẩy thừa trong mảng
      );

      return { MaGioHang, user_id, MaSach, SoLuong, NgayThem };
    } catch (err) {
      logger.error(`Repository Error: update failed for MaGioHang ${MaGioHang}`, err);
      throw err;
    }
  },

  delete: async (MaGioHang) => {
    logger.info(`Repository: Deleting giohang ${MaGioHang}`);
    try {
      const db = await pool;
      await db.query('DELETE FROM GioHang WHERE MaGioHang = ?', [MaGioHang]);
      return true;
    } catch (err) {
      logger.error(`Repository Error: delete failed for MaGioHang ${MaGioHang}`, err);
      throw err;
    }
  },
};