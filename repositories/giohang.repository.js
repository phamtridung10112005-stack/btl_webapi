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

  getByMaSach: async (masach) => {
    logger.info(`Repository: Fetching giohang with MaSach ${masach}`);
    try {
      const db = await pool;
      const [rows] = await db.query('SELECT * FROM GioHang WHERE MaSach = ?', [masach]);
      return rows[0];
    } catch (err) {
      logger.error(`Repository Error: getByMaSach failed for masach ${masach}`, err);
      throw err;
    }
  },

  getByUserId: async (user_id) => {
    logger.info(`Repository: Fetching giohang for user ${user_id}`);
    try {
      const db = await pool;
      const [rows] = await db.query('SELECT * FROM GioHang WHERE User_ID = ?', [user_id]);
      return rows;
    } catch (err) {
      logger.error(`Repository Error: getByUserId failed for user ${user_id}`, err);
      throw err;
    }
  },
  getDetailsGioHangByUserID: async(user_id) => {
    logger.info(`Repository: Fetching details giohang for user ${user_id}`);
    try {
      const db = await pool;
      const sqlString = `SELECT 
                          gh.User_ID,
                          gh.MaSach,
                          gh.SoLuong,         -- Số lượng khách mua
                          s.TenSach,
                          s.LinkHinhAnh,
                          s.GiaSach,          -- Giá gốc
                          
                          -- Lấy % giảm giá, nếu sách không có mã giảm (NULL) thì coi là 0
                          COALESCE(g.PhanTramGiam, 0) AS PhanTramGiam,
                          
                          -- Tính sẵn giá bán sau khi giảm (để tiện cho việc tính toán, hiển thị)
                          (s.GiaSach * (1 - COALESCE(g.PhanTramGiam, 0) / 100)) AS GiaSauGiam,
                          
                          -- Tính tổng tiền tạm tính cho dòng này (Giá sau giảm * Số lượng)
                          ((s.GiaSach * (1 - COALESCE(g.PhanTramGiam, 0) / 100)) * gh.SoLuong) AS ThanhTien

                      FROM GioHang gh
                      JOIN Sach s ON gh.MaSach = s.MaSach
                      LEFT JOIN GiamGia g ON s.MaGiamGia = g.MaGiamGia
                      WHERE gh.User_ID = ?;`;
      const [rows] = await db.query(sqlString, [user_id]);
      return rows;
    } catch (err) {
      logger.error(`Repository Error: getDetailsGioHangByUserID failed for masach ${masach}`, err);
      throw err;
    }
  },
getByUserIdAndMaSach: async (user_id, masach) => {
  logger.info(`Repository: Fetching giohang for user ${user_id} and masach ${masach}`);
    try {
      const db = await pool;
      const [rows] = await db.query('SELECT * FROM GioHang WHERE User_ID = ? and MaSach = ?', [user_id, masach]);
      return rows;
    } catch (err) {
      logger.error(`Repository Error: getByUserId failed for user ${user_id} and masach ${masach}`, err);
      throw err;
    }
},
  create: async ({ User_ID, MaSach, SoLuong }) => {
    logger.info(`Repository: Creating giohang item for user ${User_ID} and masach ${MaSach}`);
    try {
      const db = await pool;

      const [result] = await db.query(
        `INSERT INTO GioHang (User_ID, MaSach, SoLuong)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE SoLuong = SoLuong + ?`,
        [User_ID, MaSach, SoLuong, SoLuong]
      );

      return { 
        User_ID, 
        MaSach, 
        SoLuong,
      };
    } catch (err) {
      logger.error("Repository Error: create failed", err);
      throw err;
    }
  },

  update: async (user_id, MaSach, { SoLuong, NgayThem }) => {
    logger.info(`Repository: Updating giohang user_id ${user_id} and masach ${MaSach}`);
    try {
      const db = await pool;
      
      await db.query(
        'UPDATE GioHang SET SoLuong = ?, NgayThem = ? WHERE User_ID = ? and MaSach = ?',
        [SoLuong, NgayThem, user_id, MaSach]
      );

      return { user_id, MaSach, SoLuong, NgayThem };
    } catch (err) {
      logger.error(`Repository Error: update failed for user_id ${user_id} and masach ${MaSach}`, err);
      throw err;
    }
  },

  delete: async (user_id, masach) => {
    logger.info(`Repository: Deleting giohang user_id ${user_id} and masach ${masach}`);
    try {
      const db = await pool;
      await db.query('DELETE FROM GioHang WHERE User_ID = ? and MaSach = ?', [user_id, masach]);
      return true;
    } catch (err) {
      logger.error(`Repository Error: delete failed for user_id ${user_id} and masach ${masach}`, err);
      throw err;
    }
  },
  deleteAllByUserID: async(user_id) => {
    logger.info(`Repository: Deleting all giohang user_id ${user_id}`);
    try {
      const db = await pool;
      await db.query('DELETE FROM GioHang WHERE User_ID = ?', [user_id]);
      return true;
    } catch (err) {
      logger.error(`Repository Error: deleteAll failed for user_id ${user_id}`, err);
      throw err;
    }
  },
};