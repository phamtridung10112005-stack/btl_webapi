import { pool } from "../config/database.js";
import { logger } from "../config/logger.js";

export const sachRepository = {
  getAll: async () => {
    logger.info('Repository: Fetching all sachs');
    try {
      const db = await pool;
      const sqlString = `SELECT 
                            s.*, 
                            -- Nếu không có mã giảm giá (NULL) thì mặc định là 0
                            COALESCE(g.PhanTramGiam, 0) AS PhanTramGiam 
                        FROM Sach s
                        LEFT JOIN GiamGia g ON s.MaGiamGia = g.MaGiamGia`;
      // const [rows] = await db.query('SELECT * FROM Sach');
      const [rows] = await db.query(sqlString);
      return rows;
    } catch (err) {
      logger.error("Repository Error: getAll failed", err);
      throw err;
    }
  },

  getChiTietThongTinAll: async () => {
    logger.info('Repository: Fetching all sachs with detail');
    try {
      const db = await pool;
      const sqlString = `SELECT 
                              s.*, 
                              COALESCE(g.PhanTramGiam, 0) AS PhanTramGiam,
                              tl.TenTheLoai,
                              GROUP_CONCAT(stg.MaTacGia) as MaTacGiaString
                          FROM Sach s
                          LEFT JOIN GiamGia g ON s.MaGiamGia = g.MaGiamGia
                          LEFT JOIN TheLoai tl ON s.MaTheLoai = tl.MaTheLoai
                          LEFT JOIN SachTacGia stg ON s.MaSach = stg.MaSach
                          GROUP BY s.MaSach`;
      const [rows] = await db.query(sqlString);
      const processedRows = rows.map(book => {
        return {
            ...book,
            // Nếu có tác giả thì tách chuỗi, nếu không thì trả về mảng rỗng
            MaTacGia: book.MaTacGiaString ? book.MaTacGiaString.split(',').map(Number) : []
        };
      });
      return processedRows;
    } catch (err) {
      logger.error("Repository Error: getChiTietThongTinAll failed", err);
      throw err;
    }
  },

  getByMaSach: async (masach) => {
    logger.info(`Repository: Fetching sach with masach ${masach}`);
    try {
      const db = await pool;
      // 1. Lấy thông tin sách
      const [rows] = await db.query('SELECT * FROM Sach WHERE MaSach = ?', [masach]);
      if (!rows[0]) return null;

      const sach = rows[0];

      // 2. [QUAN TRỌNG] Lấy danh sách ID tác giả hiện có để hiển thị lên Modal
      const [authors] = await db.query('SELECT MaTacGia FROM SachTacGia WHERE MaSach = ?', [masach]);
      sach.AuthorIds = authors.map(a => a.MaTacGia);

      return sach;
    } catch (err) {
      logger.error(`Repository Error: getByMaSach failed for masach ${masach}`, err);
      throw err;
    }
  },

    getTTSachByMaSach: async (masach) => {
    logger.info(`Repository: Fetching thong tin chi tiet sach with masach ${masach}`);
    try {
      const db = await pool;

      const queryBook = `
        SELECT 
            s.*, 
            COALESCE(g.PhanTramGiam, 0) AS PhanTramGiam,
            tl.TenTheLoai
        FROM Sach s
        LEFT JOIN GiamGia g ON s.MaGiamGia = g.MaGiamGia
        LEFT JOIN TheLoai tl ON s.MaTheLoai = tl.MaTheLoai
        WHERE s.MaSach = ?
      `;

      const [rows] = await db.query(queryBook, [masach]);
      if (!rows[0]) return null;

      const sach = rows[0];

      const queryAuthors = `
        SELECT tg.MaTacGia, tg.TenTacGia 
        FROM SachTacGia stg
        JOIN TacGia tg ON stg.MaTacGia = tg.MaTacGia
        WHERE stg.MaSach = ?
      `;
      
      const [authors] = await db.query(queryAuthors, [masach]);

      // Xử lý dữ liệu tác giả để trả về format tiện dụng
      sach.MaTacGia = authors.map(a => a.MaTacGia); // Mảng ID (dùng cho logic code cũ/checkbox)
      sach.TenTacGia = authors.map(a => a.TenTacGia).join(', '); // Chuỗi tên hiển thị (Ví dụ: "Tô Hoài, Nam Cao")
      sach.DanhSachTacGia = authors; // Trả về cả danh sách object đầy đủ nếu cần
      // console.log("ttsach: ", sach);
      return sach;
    } catch (err) {
      logger.error(`Repository Error: getTTSachByMaSach failed for masach ${masach}`, err);
      throw err;
    }
  },

  getSachPagingAndSorting: async (page = 1, size = 10, sortBy = 'MaSach', sortOrder = 'ASC', matheloai) => {
    try {
      const db = await pool;
      const offset = (page - 1) * size;
      const validSortColumns = ['MaSach', 'TenSach', 'GiaSach', 'SoLuongDaBan']; 
      const sort = validSortColumns.includes(sortBy) ? sortBy : 'MaSach';
      const sqlString = `SELECT 
                            s.*, 
                            -- Nếu không có mã giảm giá (NULL) thì mặc định là 0
                            COALESCE(g.PhanTramGiam, 0) AS PhanTramGiam 
                        FROM Sach s
                        LEFT JOIN GiamGia g ON s.MaGiamGia = g.MaGiamGia
                        WHERE (? IS NULL OR s.MaTheLoai = ?)
                        ORDER BY ${sort} ${sortOrder} 
                        LIMIT ? OFFSET ?`
      // const query = `SELECT * FROM Sach ORDER BY ${sort} ${sortOrder} LIMIT ? OFFSET ?`;
      const [rows] = await db.query(sqlString, [matheloai??null, matheloai??null, parseInt(size), parseInt(offset)]);
      
      const [countResult] = await db.query('SELECT COUNT(*) as total FROM Sach');
      
      return {
        rows,
        pagination: {
          page: parseInt(page), size: parseInt(size),
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / size)
        }
      };
    } catch (err) {
      throw err;
    }
  },
  // getSachPagingAndSorting: async (page = 1, size = 10, sortBy = 'MaSach', sortOrder = 'ASC', matheloai) => {
  //   try {
  //     const db = await pool;
  //     const offset = (page - 1) * size;
  //     const validSortColumns = ['MaSach', 'TenSach', 'GiaSach', 'SoLuongDaBan']; 
  //     const sort = validSortColumns.includes(sortBy) ? sortBy : 'MaSach';
  //     const sqlString = `SELECT 
  //                           s.*, 
  //                           -- Nếu không có mã giảm giá (NULL) thì mặc định là 0
  //                           COALESCE(g.PhanTramGiam, 0) AS PhanTramGiam 
  //                       FROM Sach s
  //                       LEFT JOIN GiamGia g ON s.MaGiamGia = g.MaGiamGia
  //                       ORDER BY ${sort} ${sortOrder} 
  //                       LIMIT ? OFFSET ?`
  //     // const query = `SELECT * FROM Sach ORDER BY ${sort} ${sortOrder} LIMIT ? OFFSET ?`;
  //     const [rows] = await db.query(sqlString, [parseInt(size), parseInt(offset)]);
      
  //     const [countResult] = await db.query('SELECT COUNT(*) as total FROM Sach');
      
  //     return {
  //       rows,
  //       pagination: {
  //         page: parseInt(page), size: parseInt(size),
  //         total: countResult[0].total,
  //         totalPages: Math.ceil(countResult[0].total / size)
  //       }
  //     };
  //   } catch (err) {
  //     throw err;
  //   }
  // },

  // --- CREATE (Dành cho menu Kho Sách - Thêm mới) ---
  create: async (dto) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const querySach = `
        INSERT INTO Sach 
        (TenSach, MaTheLoai, TenNguoiDich, MaNXB, GiaSach, NamXuatBan, SoTrang, MoTaNoiDung, LinkHinhAnh, SoLuongDaBan, MaGiamGia) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const valuesSach = [
        dto.TenSach, dto.MaTheLoai, dto.TenNguoiDich, dto.MaNXB, dto.GiaSach, 
        dto.NamXuatBan, dto.SoTrang, dto.MoTaNoiDung, dto.LinkHinhAnh, 
        dto.SoLuongDaBan || 0, dto.MaGiamGia
      ];
      
      const [resultSach] = await connection.query(querySach, valuesSach);
      
      // Nếu sau này muốn thêm tác giả ngay lúc tạo thì code này đã sẵn sàng hỗ trợ
      const newMaSach = resultSach.insertId;
      if (dto.AuthorIds && Array.isArray(dto.AuthorIds) && dto.AuthorIds.length > 0) {
        const authorValues = dto.AuthorIds.map(maTacGia => [newMaSach, maTacGia]);
        await connection.query('INSERT INTO SachTacGia (MaSach, MaTacGia) VALUES ?', [authorValues]);
      }

      await connection.commit();
      return { MaSach: newMaSach, ...dto };
    } catch (err) {
      await connection.rollback();
      logger.error("Create Sach Failed", err);
      throw err;
    } finally {
      connection.release();
    }
  },

  // --- UPDATE (Dành cho cả menu Kho Sách VÀ menu Sách-Tác Giả) ---
  // Đây là hàm quan trọng nhất để sửa lỗi của bạn
  update: async (masach, dto) => {
    const connection = await pool.getConnection(); // Bắt buộc dùng connection để có Transaction
    try {
      await connection.beginTransaction();

      // B1: Cập nhật thông tin cơ bản (Tên, Giá...)
      const querySach = `
        UPDATE Sach SET 
          TenSach=?, MaTheLoai=?, TenNguoiDich=?, MaNXB=?, GiaSach=?, 
          NamXuatBan=?, SoTrang=?, MoTaNoiDung=?, LinkHinhAnh=?, 
          SoLuongDaBan=?, MaGiamGia=?
        WHERE MaSach=?
      `;
      const valuesSach = [
        dto.TenSach, dto.MaTheLoai, dto.TenNguoiDich, dto.MaNXB, dto.GiaSach, 
        dto.NamXuatBan, dto.SoTrang, dto.MoTaNoiDung, dto.LinkHinhAnh, 
        dto.SoLuongDaBan, dto.MaGiamGia, masach
      ];
      await connection.query(querySach, valuesSach);

      // B2: CẬP NHẬT TÁC GIẢ (Đây là đoạn code giúp lưu vào SachTacGia)
      // Kiểm tra nếu dữ liệu gửi lên có chứa danh sách AuthorIds (từ menu Sách-Tác Giả gửi lên)
      if (dto.AuthorIds && Array.isArray(dto.AuthorIds)) {
        // Bước 1: Xóa sạch các tác giả cũ của sách này
        await connection.query('DELETE FROM SachTacGia WHERE MaSach = ?', [masach]);

        // Bước 2: Nếu danh sách mới không rỗng, thêm lại vào bảng
        if (dto.AuthorIds.length > 0) {
            const authorValues = dto.AuthorIds.map(maTacGia => [masach, maTacGia]);
            await connection.query('INSERT INTO SachTacGia (MaSach, MaTacGia) VALUES ?', [authorValues]);
        }
      }

      await connection.commit(); // Xác nhận lưu vào CSDL
      return { MaSach: masach, ...dto };

    } catch (err) {
      await connection.rollback(); // Nếu lỗi thì hoàn tác
      logger.error("Update Sach Failed", err);
      throw err;
    } finally {
      connection.release(); // Giải phóng kết nối
    }
  },

  delete: async (masach) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        // Xóa trong bảng phụ trước
        await connection.query('DELETE FROM SachTacGia WHERE MaSach = ?', [masach]);
        // Xóa sách
        await connection.query('DELETE FROM Sach WHERE MaSach = ?', [masach]);
        await connection.commit();
        return true;
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
  },
};