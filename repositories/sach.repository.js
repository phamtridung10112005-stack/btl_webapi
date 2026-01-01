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
    logger.info(`Repository: Fetching sachs with paging - Page: ${page}, Size: ${size}, SortBy: ${sortBy}, Order: ${sortOrder}`);
    try {
      const db = await pool;
      const offset = (page - 1) * size;
      // Cập nhật thêm các trường có thể sort được
      const validFields = ['MaSach', 'TenSach', 'GiaSach', 'SoLuongDaBan', 'NamXuatBan'];
      if (!validFields.includes(sortBy)) {
        sortBy = 'MaSach';
      }
      
      const [slSachs] = await db.query('SELECT COUNT(*) as total FROM Sach');
      const tongSoSachs = slSachs[0].total;
      const totalPages = Math.ceil(tongSoSachs / size);

      // Sử dụng tham số an toàn cho LIMIT và OFFSET
      const sqlString = `SELECT 
                          s.*,
                          gg.PhanTramGiam
                        FROM Sach s
                        LEFT JOIN GiamGia gg ON s.MaGiamGia = gg.MaGiamGia
                        ORDER BY s.${sortBy} ${sortOrder}
                        LIMIT ? OFFSET ?;
                        `;
      const [rows] = await db.query(sqlString, [size, offset]);
      return {rows,
              pagination: {
                trangHienTai: page,
                tongSoTrang: totalPages,
                kichThuocTrang: size,
                tongSoSach: tongSoSachs
              }};
    } catch (err) {
      logger.error("Repository Error: getSachPagingAndSorting failed", err);
      throw err;
    }
  },

  create: async ({ TenSach, MaTheLoai, TenNguoiDich, MaNXB, GiaSach, NamXuatBan, SoTrang, MoTaNoiDung, LinkHinhAnh, YeuThich, SoLuongDaBan, MaGiamGia }) => {
    // Lưu ý: Đã bỏ MaSach trong INSERT vì cột này Auto Increment
    logger.info(`Repository: Creating new sach`);
    try {
      const db = await pool;
      const [result] = await db.query(
        'INSERT INTO Sach (TenSach, MaTheLoai, TenNguoiDich, MaNXB, GiaSach, NamXuatBan, SoTrang, MoTaNoiDung, LinkHinhAnh, YeuThich, SoLuongDaBan, MaGiamGia) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [TenSach, MaTheLoai, TenNguoiDich, MaNXB, GiaSach, NamXuatBan, SoTrang, MoTaNoiDung, LinkHinhAnh, YeuThich, SoLuongDaBan, MaGiamGia]
      );
      
      // Trả về object đầy đủ kèm ID mới tạo
      return { 
        MaSach: result.insertId, 
        TenSach, MaTheLoai, TenNguoiDich, MaNXB, GiaSach, NamXuatBan, SoTrang, MoTaNoiDung, LinkHinhAnh, YeuThich, SoLuongDaBan, MaGiamGia 
      };
    } catch (err) {
      logger.error("Repository Error: create failed", err);
      throw err;
    }
  },

  update: async (MaSach, data) => {
    logger.info(`Repository: Updating sach ${MaSach}`);
    try {
      const db = await pool;
      const { TenSach, MaTheLoai, TenNguoiDich, MaNXB, GiaSach, NamXuatBan, SoTrang, MoTaNoiDung, LinkHinhAnh, YeuThich, SoLuongDaBan, MaGiamGia } = data;

      await db.query(
        'UPDATE Sach SET TenSach=?, MaTheLoai=?, TenNguoiDich=?, MaNXB=?, GiaSach=?, NamXuatBan=?, SoTrang=?, MoTaNoiDung=?, LinkHinhAnh=?, YeuThich=?, SoLuongDaBan=?, MaGiamGia=? WHERE MaSach=?',
        [TenSach, MaTheLoai, TenNguoiDich, MaNXB, GiaSach, NamXuatBan, SoTrang, MoTaNoiDung, LinkHinhAnh, YeuThich, SoLuongDaBan, MaGiamGia, MaSach]
      );
      
      return { MaSach, ...data };
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