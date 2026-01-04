// File: sachyeuthich.repository.js
import { pool } from "../config/database.js";
import { logger } from "../config/logger.js";

export const sachyeuthichRepository = {
  getAll: async () => {
    logger.info('Repository: Fetching all sachyeuthichs');
    try {
      const db = await pool;
      const [rows] = await db.query('SELECT * FROM SachYeuThich');
      return rows;
    } catch (err) {
      logger.error("Repository Error: getAll failed", err);
      throw err;
    }
  },
getByUser_ID_AND_MaSach: async (user_id, masach) => {
    logger.info(`Repository: Fetching sachyeuthich with user_id ${user_id} and masach ${masach}`);
    try {
      const db = await pool;
      const [rows] = await db.query('SELECT * FROM SachYeuThich WHERE User_ID = ? AND MaSach = ?', [user_id, masach]);
      return rows;
    } catch (err) {
      logger.error(`Repository Error: getByUser_ID failed for user_id ${user_id} and masach ${masach}`, err);
      throw err;
    }
  },
getByUser_ID: async (user_id) => {
    logger.info(`Repository: Fetching sachyeuthich with user_id ${user_id}`);
    try {
      const db = await pool;
      const [rows] = await db.query('SELECT MaSach FROM SachYeuThich WHERE User_ID = ?', [user_id]);
      return rows;
    } catch (err) {
      logger.error(`Repository Error: getByUser_ID_AND_MaSach failed for user_id ${user_id}`, err);
      throw err;
    }
  },
  getTTSachByUser_ID: async (user_id, page, size, sortBy, sortOrder) => {
    logger.info(`Repository: Fetching sachyeuthich with user_id ${user_id}`);
    try {
      const db = await pool;
      const validFields = ['MaSach', 'TenSach', 'GiaSach', 'SoLuongDaBan', 'NamXuatBan'];
      if (!validFields.includes(sortBy)) {
        sortBy = 'NgayTao';
      }
      const offset = (page - 1) * size;
      const [tongSoSachYeuThich] = await db.query('SELECT COUNT(*) as total FROM SachYeuThich WHERE User_ID = ?', [user_id]);
      const slSachYeuThichs = tongSoSachYeuThich[0].total;
      const totalPages = Math.ceil(slSachYeuThichs / size);

      const sqlString = `
            SELECT 
                s.MaSach, 
                s.TenSach, 
                s.GiaSach,
                s.LinkHinhAnh,
                s.SoLuongDaBan,
                COALESCE(g.PhanTramGiam, 0) AS PhanTramGiam,
                yt.NgayTao
            FROM SachYeuThich yt
            JOIN Sach s ON yt.MaSach = s.MaSach
            LEFT JOIN GiamGia g ON s.MaGiamGia = g.MaGiamGia
            WHERE yt.User_ID = ?
            ORDER BY yt.${sortBy} ${sortOrder}
            LIMIT ? OFFSET ?;
            `;
      const [rows] = await db.query(sqlString, [user_id, size, offset]);
      return {rows,
              pagination: {
                trangHienTai: page,
                tongSoTrang: totalPages,
                kichThuocTrang: size,
                tongSoSach: slSachYeuThichs
              }};
    } catch (err) {
      logger.error(`Repository Error: getTTSachByUser_ID failed for user_id ${user_id}`, err);
      throw err;
    }
  },
getByMaSach: async (masach) => {
    logger.info(`Repository: Fetching sachyeuthich with masach ${masach}`);
    try {
      const db = await pool;
      const [rows] = await db.query('SELECT * FROM SachYeuThich WHERE MaSach = ?', [masach]);
      return rows[0];
    } catch (err) {
      logger.error(`Repository Error: getByMaSach failed for masach ${masach}`, err);
      throw err;
    }
  },
create: async ({ User_ID, MaSach }) => {
    logger.info(`Repository: Creating sachyeuthich ${User_ID} and ${MaSach}`);
    try {
      const db = await pool;
      await db.query(
        'INSERT INTO SachYeuThich (User_ID, MaSach) VALUES (?, ?)',
        [User_ID, MaSach]
      );
      return { User_ID, MaSach };
    } catch (err) {
      logger.error("Repository Error: create failed", err);
      throw err;
    }
},
  update: async (User_ID, MaSach, { NgayTao }) => {
    logger.info(`Repository: Updating sachyeuthich ${User_ID} and ${MaSach}`);
    try {
      const db = await pool;
      await db.query(
        'UPDATE SachYeuThich SET NgayTao = ? WHERE User_ID = ? AND MaSach = ?',
        [NgayTao, User_ID, MaSach]
      );
      return { User_ID, MaSach, NgayTao };
    } catch (err) {
      logger.error(`Repository Error: update failed for User_ID ${User_ID} and MaSach ${MaSach}`, err);
      throw err;
    }
},
  delete: async (User_ID, MaSach) => {
    logger.info(`Repository: Deleting sachyeuthich ${User_ID} and ${MaSach}`);
    try {
      const db = await pool;
      await db.query('DELETE FROM SachYeuThich WHERE User_ID = ? AND MaSach = ?', [User_ID, MaSach]);
      return true;
    } catch (err) {
      logger.error(`Repository Error: delete failed for User_ID ${User_ID} and MaSach ${MaSach}`, err);
      throw err;
    }
  },
};
