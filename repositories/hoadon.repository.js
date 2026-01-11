import { pool } from "../config/database.js";
import { logger } from "../config/logger.js";

// ================= HELPER FUNCTIONS =================

// Hàm kiểm tra tính hợp lệ của Mã Giảm Giá (Quan trọng)
async function validateDiscount(conn, MaGiamGia) {
  if (!MaGiamGia) return null;

  // 1. Lấy thông tin mã
  const [rows] = await conn.query('SELECT * FROM GiamGia WHERE MaGiamGia = ?', [MaGiamGia]);
  if (rows.length === 0) {
    throw new Error(`Mã giảm giá "${MaGiamGia}" không tồn tại!`);
  }

  const discount = rows[0];

  // 2. Kiểm tra số lượng (Nếu SoLuong không null tức là có giới hạn)
  if (discount.SoLuong !== null && discount.SoLuong <= 0) {
    throw new Error(`Mã giảm giá "${MaGiamGia}" đã hết lượt sử dụng!`);
  }

  // 3. (Tuỳ chọn) Kiểm tra hạn sử dụng
  const now = new Date();
  if (discount.NgayBatDau && new Date(discount.NgayBatDau) > now) {
      throw new Error(`Mã giảm giá "${MaGiamGia}" chưa đến đợt áp dụng!`);
  }
  if (discount.NgayKetThuc && new Date(discount.NgayKetThuc) < now) {
      throw new Error(`Mã giảm giá "${MaGiamGia}" đã hết hạn!`);
  }

  return discount;
}

// Trừ số lượng mã giảm giá
async function decreaseGiamGia(conn, MaGiamGia) {
  if (!MaGiamGia) return;
  // Lưu ý: Đã validate ở trên rồi, nhưng vẫn để điều kiện > 0 để an toàn dữ liệu
  await conn.query('UPDATE GiamGia SET SoLuong = SoLuong - 1 WHERE MaGiamGia = ? AND SoLuong > 0', [MaGiamGia]);
}

// Hoàn lại số lượng mã giảm giá (Cộng thêm 1)
async function increaseGiamGia(conn, MaGiamGia) {
  if (!MaGiamGia) return;
  // Chỉ cộng nếu mã đó có quản lý số lượng (SoLuong khác NULL)
  // Tuy nhiên query đơn giản là update SoLuong = SoLuong + 1 where SoLuong IS NOT NULL
  await conn.query('UPDATE GiamGia SET SoLuong = SoLuong + 1 WHERE MaGiamGia = ? AND SoLuong IS NOT NULL', [MaGiamGia]);
}

// ================= REPOSITORY =================

export const hoadonRepository = {
  getAll: async () => {
    logger.info('Repository: Fetching all hoadons');
    try {
      const [rows] = await pool.query('SELECT * FROM HoaDon');
      return rows;
    } catch (err) {
      logger.error("Repository Error: getAll failed", err);
      throw err;
    }
  },

  getByMaHoaDon: async (mahoadon) => {
    logger.info(`Repository: Fetching hoadon with mahoadon ${mahoadon}`);
    try {
      const [rows] = await pool.query('SELECT * FROM HoaDon WHERE MaHoaDon = ?', [mahoadon]);
      return rows[0];
    } catch (err) {
      logger.error(`Repository Error: getByMaHoaDon failed for mahoadon ${mahoadon}`, err);
      throw err;
    }
  },

  getByUserId: async (user_id) => {
    logger.info(`Repository: Fetching hoadon for user ${user_id}`);
    try {
      const [rows] = await pool.query('SELECT * FROM HoaDon WHERE user_id = ?', [user_id]);
      return rows;
    } catch (err) {
      logger.error(`Repository Error: getByUserId failed for user ${user_id}`, err);
      throw err;
    }
  },

  // --- CREATE ---
  // --- CREATE (Đã fix lỗi không lưu ChiTiet và tự tính TongTien) ---
 // --- CREATE (Đã thêm logic chặn User bị khóa) ---
  create: async (data) => {
    // Destructure dữ liệu
    const { user_id, NgayLap, TrangThai, DiaChiGiaoHang, MaGiamGia, SoDienThoai, GhiChu, HoTen, PhuongThucThanhToan, ChiTiet } = data;
    
    logger.info(`Repository: Creating hoadon for user ${user_id}`);
    const conn = await pool.getConnection(); 
    try {
      await conn.beginTransaction();

      // [MỚI] BƯỚC 0: KIỂM TRA TRẠNG THÁI TÀI KHOẢN
      // Lấy role của user hiện tại
      const [users] = await conn.query("SELECT role FROM Users WHERE id = ?", [user_id]);
      
      // Nếu tìm thấy user và role là LOCKED -> Chặn ngay lập tức
      if (users.length > 0 && users[0].role === 'LOCKED') {
          throw new Error("Tài khoản này đang bị KHÓA, không thể tạo đơn hàng!");
      }

      // 1. Kiểm tra mã giảm giá (nếu có)
      let discountPercent = 0;
      if (MaGiamGia) {
         const discount = await validateDiscount(conn, MaGiamGia);
         if(discount) discountPercent = Number(discount.PhanTramGiam);
      }

      // 2. Tính Tổng Tiền dựa trên danh sách sách (ChiTiet)
      let calculatedTongTien = 0;
      if (ChiTiet && Array.isArray(ChiTiet) && ChiTiet.length > 0) {
          const bookIds = ChiTiet.map(item => item.MaSach);
          const [books] = await conn.query('SELECT MaSach, GiaSach FROM Sach WHERE MaSach IN (?)', [bookIds]);
          
          ChiTiet.forEach(item => {
              const bookInfo = books.find(b => b.MaSach == item.MaSach);
              if (bookInfo) {
                  calculatedTongTien += (Number(bookInfo.GiaSach) * Number(item.SoLuong));
              }
          });
      }

      // Áp dụng giảm giá
      const finalTongTien = calculatedTongTien * (1 - discountPercent / 100);
      const finalDate = NgayLap || new Date();
      const finalStatus = TrangThai || 'ChoXacNhan';

      // 3. Insert vào bảng HoaDon
      const [result] = await conn.query(
        'INSERT INTO HoaDon (user_id, TongTien, NgayLap, TrangThai, DiaChiGiaoHang, MaGiamGia, SoDienThoai, GhiChu, HoTen, PhuongThucThanhToan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [user_id, finalTongTien, finalDate, finalStatus, DiaChiGiaoHang, MaGiamGia, SoDienThoai, GhiChu, HoTen, PhuongThucThanhToan]
      );
      
      const newMaHoaDon = result.insertId;

      // 4. Insert vào bảng ChiTietHD
      if (ChiTiet && Array.isArray(ChiTiet) && ChiTiet.length > 0) {
          const values = ChiTiet.map(item => [newMaHoaDon, item.MaSach, item.SoLuong]);
          await conn.query('INSERT INTO ChiTietHD (MaHoaDon, MaSach, SoLuong) VALUES ?', [values]);
      }

      // 5. Trừ kho mã giảm giá nếu có dùng
      if (MaGiamGia) {
        await decreaseGiamGia(conn, MaGiamGia);
      }
      
      await conn.commit();
      
      return { 
        MaHoaDon: newMaHoaDon, 
        TongTien: finalTongTien, 
        NgayLap: finalDate, 
        TrangThai: finalStatus, 
        ChiTiet 
      };

    } catch (err) {
      await conn.rollback();
      // Nếu là lỗi khóa tài khoản, controller sẽ bắt được và trả về message cho Frontend
      logger.error("Repository Error: create failed", err);
      throw err;
    } finally {
      conn.release();
    }
  },
  // --- UPDATE (Quan trọng nhất) ---
  update: async (MaHoaDon, data) => {
    logger.info(`Repository: Updating hoadon ${MaHoaDon}`);
    const conn = await pool.getConnection(); 
    
    try {
      await conn.beginTransaction();

      // BƯỚC 1: Lấy thông tin cũ của Hóa Đơn (để biết Mã Giảm Giá cũ)
      const [[oldData]] = await conn.query('SELECT MaGiamGia FROM HoaDon WHERE MaHoaDon = ?', [MaHoaDon]);
      if (!oldData) throw new Error("Hóa đơn không tồn tại!");

      const oldDiscountCode = oldData.MaGiamGia; 
      const newDiscountCode = data.MaGiamGia; // Code mới gửi lên (có thể null, rỗng hoặc mã mới)

      // BƯỚC 2: Xử lý Kho Mã Giảm Giá (Logic đổi mã)
      // Chỉ thực hiện nếu có sự thay đổi về mã giảm giá
      // Lưu ý: data.MaGiamGia có thể là undefined (không gửi lên -> không sửa), ta cần check kỹ
      
      let discountPercent = 0;
      let finalDiscountCode = oldDiscountCode; // Mặc định là mã cũ

      if (data.MaGiamGia !== undefined) {
          // Trường hợp Client có gửi field MaGiamGia lên (muốn thay đổi hoặc xóa)
          finalDiscountCode = newDiscountCode;

          if (oldDiscountCode !== newDiscountCode) {
              // 2.1 Hoàn lại mã cũ (nếu trước đó có dùng)
              if (oldDiscountCode) {
                  await increaseGiamGia(conn, oldDiscountCode);
              }

              // 2.2 Validate và Trừ mã mới (nếu có dùng mã mới)
              if (newDiscountCode) {
                  // [VALIDATE] Kiểm tra số lượng == 0 sẽ báo lỗi ngay tại đây
                  const discountInfo = await validateDiscount(conn, newDiscountCode);
                  discountPercent = Number(discountInfo.PhanTramGiam);
                  
                  // Trừ kho
                  await decreaseGiamGia(conn, newDiscountCode);
              }
          } else {
              // Mã không đổi, chỉ cần lấy % để tính tiền
              if (newDiscountCode) {
                  const [d] = await conn.query('SELECT PhanTramGiam FROM GiamGia WHERE MaGiamGia = ?', [newDiscountCode]);
                  if(d.length) discountPercent = Number(d[0].PhanTramGiam);
              }
          }
      } else {
          // Trường hợp Client KHÔNG gửi field MaGiamGia (chỉ sửa cái khác), ta giữ nguyên mã cũ
          // Vẫn cần lấy % giảm giá của mã cũ để tính lại tiền
          if (oldDiscountCode) {
              const [d] = await conn.query('SELECT PhanTramGiam FROM GiamGia WHERE MaGiamGia = ?', [oldDiscountCode]);
              if(d.length) discountPercent = Number(d[0].PhanTramGiam);
          }
      }

      // BƯỚC 3: Tính toán lại Tổng Tiền
      let calculatedTongTien = 0;

      // 3.1 Tính tổng tiền hàng (Base Price)
      if (data.ChiTiet && Array.isArray(data.ChiTiet)) {
          if (data.ChiTiet.length > 0) {
              const bookIds = data.ChiTiet.map(item => item.MaSach);
              const [books] = await conn.query('SELECT MaSach, GiaSach FROM Sach WHERE MaSach IN (?)', [bookIds]);
              
              data.ChiTiet.forEach(item => {
                  const bookInfo = books.find(b => b.MaSach == item.MaSach);
                  if (bookInfo) {
                      calculatedTongTien += (Number(bookInfo.GiaSach) * Number(item.SoLuong));
                  }
              });
          } else {
              calculatedTongTien = 0; // Xóa hết sách
          }
      } else {
          // Nếu không gửi chi tiết lên, tạm thời lấy TongTien hiện tại (cái này rủi ro nếu chỉ update mỗi giảm giá, 
          // nhưng với admin.js hiện tại nó luôn gửi ChiTiet nên ổn)
          calculatedTongTien = Number(data.TongTien) || 0; 
          // Lưu ý: Nếu muốn chính xác tuyệt đối khi không gửi ChiTiet, cần query lại ChiTietHD cũ để tính base price.
      }

      // 3.2 Áp dụng giảm giá
      const finalTongTien = calculatedTongTien * (1 - discountPercent / 100);
      data.TongTien = finalTongTien;

      // BƯỚC 4: Cập nhật thông tin Hóa Đơn
      await conn.query(
        'UPDATE HoaDon SET user_id = ?, TongTien = ?, NgayLap = ?, TrangThai = ?, DiaChiGiaoHang = ?, MaGiamGia = ?, SoDienThoai = ?, GhiChu = ?, HoTen = ?, PhuongThucThanhToan = ? WHERE MaHoaDon = ?',
        [data.user_id, data.TongTien, data.NgayLap, data.TrangThai, data.DiaChiGiaoHang, finalDiscountCode, data.SoDienThoai, data.GhiChu, data.HoTen, data.PhuongThucThanhToan, MaHoaDon]
      );

      // BƯỚC 5: Cập nhật Chi Tiết Hóa Đơn
      if (data.ChiTiet && Array.isArray(data.ChiTiet)) {
          await conn.query('DELETE FROM ChiTietHD WHERE MaHoaDon = ?', [MaHoaDon]);
          if (data.ChiTiet.length > 0) {
              const values = data.ChiTiet.map(item => [MaHoaDon, item.MaSach, item.SoLuong]);
              await conn.query('INSERT INTO ChiTietHD (MaHoaDon, MaSach, SoLuong) VALUES ?', [values]);
          }
      }

      await conn.commit();
      // Trả về kết quả đầy đủ
      return { MaHoaDon, ...data, MaGiamGia: finalDiscountCode };

    } catch (err) {
      await conn.rollback();
      logger.error(`Repository Error: update failed for MaHoaDon ${MaHoaDon}`, err);
      throw err;
    } finally {
      conn.release();
    }
  },

  // --- DELETE ---
  delete: async (MaHoaDon) => {
    logger.info(`Repository: Deleting hoadon ${MaHoaDon}`);
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      
      // Lấy mã giảm giá trước khi xóa để hoàn kho
      const [[hoadon]] = await conn.query('SELECT MaGiamGia FROM HoaDon WHERE MaHoaDon = ?', [MaHoaDon]);
      
      await conn.query('DELETE FROM ChiTietHD WHERE MaHoaDon = ?', [MaHoaDon]);
      await conn.query('DELETE FROM HoaDon WHERE MaHoaDon = ?', [MaHoaDon]);

      if (hoadon && hoadon.MaGiamGia) {
        await increaseGiamGia(conn, hoadon.MaGiamGia);
      }

      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      logger.error(`Repository Error: delete failed for MaHoaDon ${MaHoaDon}`, err);
      throw err;
    } finally {
      conn.release();
    }
  },
};