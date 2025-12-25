import { pool } from "../config/database.js";
import { logger } from "../config/logger.js";

export const sachRepository = {
  getAll: async () => {
    logger.info('Repository: Fetching all sachs');
    try {
      const db = await pool;
      const [rows] = await db.query('SELECT * FROM Sach');
      return rows;
    } catch (err) {
      logger.error("Repository Error: getAll failed", err);
      throw err;
    }
  },
getByMaSach: async (masach) => {
    logger.info(`Repository: Fetching sach with masach ${masach}`);
    try {
      const db = await pool;
      const [rows] = await db.query('SELECT * FROM Sach WHERE MaSach = ?', [masach]);
      return rows[0];
    } catch (err) {
      logger.error(`Repository Error: getByMaSach failed for masach ${masach}`, err);
      throw err;
    }
  },
getSachPagingAndSorting: async(page, size, sortBy, sortOrder) => {
  logger.info(`Repository: Fetching sachs with paging and sorting - Page: ${page}, Size: ${size}, SortBy: ${sortBy}, SortOrder: ${sortOrder}`);
  try {
    const db = await pool;
    const offset = (page - 1) * size;
    const validFields = ['TenSach', 'GiaSach'];
    if (!validFields.includes(sortBy)) {
      sortBy = 'TenSach';
    }
    const sqlString = `SELECT * FROM Sach ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
    const [rows] = await db.query(sqlString, [size, offset]);
    return rows;
  } catch (err) {
    logger.error("Repository Error: getSachPagingAndSorting failed", err);
      throw err;
  }
},
create: async ({ MaSach, TenSach, MaTheLoai, MaNguoiDich, MaNXB, GiaSach, NamXuatBan, SoTrang, MoTaNoiDung, LinkHinhAnh }) => {
    logger.info(`Repository: Creating sach ${MaSach}`);
    try {
      const db = await pool;
      await db.query(
        'INSERT INTO Sach (MaSach, TenSach, MaTheLoai, MaNguoiDich, MaNXB, GiaSach, NamXuatBan, SoTrang, MoTaNoiDung, LinkHinhAnh) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [MaSach, TenSach, MaTheLoai, MaNguoiDich, MaNXB, GiaSach, NamXuatBan, SoTrang, MoTaNoiDung, LinkHinhAnh]
      );
      return { MaSach, TenSach, MaTheLoai, MaNguoiDich, MaNXB, GiaSach, NamXuatBan, SoTrang, MoTaNoiDung, LinkHinhAnh };
    } catch (err) {
      logger.error("Repository Error: create failed", err);
      throw err;
    }
  },
  update: async (MaSach, { TenSach, MaTheLoai, MaNguoiDich, MaNXB, GiaSach, NamXuatBan, SoTrang, MoTaNoiDung, LinkHinhAnh }) => {
    logger.info(`Repository: Updating sach ${MaSach}`);
    try {
      const db = await pool;
      await db.query(
        'UPDATE Sach SET TenSach = ?, MaTheLoai = ?, MaNguoiDich = ? MaNXB = ?, NamXuatBan = ?, SoTrang = ?, MoTaNoiDung = ?, LinkHinhAnh = ? WHERE MaSach = ?',
        [TenSach, MaTheLoai, MaNguoiDich, MaNXB, GiaSach, NamXuatBan, SoTrang, MoTaNoiDung, LinkHinhAnh, MaSach]
      );
      return { MaSach, TenSach, MaTheLoai, MaNguoiDich, MaNXB, GiaSach, NamXuatBan, SoTrang, MoTaNoiDung, LinkHinhAnh };
    } catch (err) {
      logger.error(`Repository Error: update failed for MaSach ${MaSach}`, err);
      throw err;
    }
  },
  delete: async (MaSach) => {
    logger.info(`Repository: Deleting sach ${MaSach}`);
    try {
      const db = await pool;
      await db.query('DELETE FROM Sach WHERE MaSach = ?', [MaSach]);
      return true;
    } catch (err) {
      logger.error(`Repository Error: delete failed for MaSach ${MaSach}`, err);
      throw err;
    }
  },
};
