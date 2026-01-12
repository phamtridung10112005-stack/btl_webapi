// paying.js

// Biến lưu trữ dữ liệu giỏ hàng để tính toán khi đặt hàng
let currentCartData = [];
let totalOrderAmount = 0; // Tổng tiền đơn hàng
let finalPaymentAmount = 0; // Tổng tiền phải trả (sau khi giảm)
let appliedCoupon = { code: '', percent: 0 }; // Biến lưu coupon nhận được

document.addEventListener('DOMContentLoaded', () => {
    loadPaymentPage();
});

// Hàm format tiền tệ (Dùng chung)
function formatCurrency(number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
}

// 1. Hàm tải dữ liệu trang thanh toán
async function loadPaymentPage() {
    // A. Kiểm tra đăng nhập
    const token = localStorage.getItem('accessToken');
    const user_id = getLoggedInUserId();

    if (!token || !user_id) {
        alert("Vui lòng đăng nhập để thanh toán.");
        window.location.href = '../Login/dangnhap.html';
        return;
    }

    const storedCoupon = localStorage.getItem('checkoutCoupon');
    if (storedCoupon) {
        appliedCoupon = JSON.parse(storedCoupon);
        console.log("Áp dụng mã:", appliedCoupon);
    }

    // B. Lấy thông tin User và điền vào Form (Tự động điền)
    await loadUserInfo(user_id, token);

    // C. Lấy danh sách sản phẩm trong giỏ hàng (Gọi API)
    await loadCartItems(user_id, token);
}

// 2. Hàm lấy thông tin User (Tên, Email, SĐT...)
async function loadUserInfo(user_id, token) {
    try {
        // Giả sử bạn có API lấy chi tiết user: GET /api/users/:id
        // Nếu chưa có, bạn có thể dùng tạm localStorage như code cũ
        // Nhưng tốt nhất nên gọi API.
        const response = await fetch(`${BASE_API_URL}users/${user_id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const userData = await response.json();
            
            // Hiển thị thông tin người dùng ở góc trên
            document.querySelector('.inforuser_name').textContent = userData.username;
            document.querySelector('.inforuser_mail').textContent = userData.email;

            // Tự động điền vào Form
            if (document.getElementById('text_name')) document.getElementById('text_name').value = userData.username || '';
            if (document.getElementById('gmail')) document.getElementById('gmail').value = userData.email || '';
            if (document.getElementById('sdt')) document.getElementById('sdt').value = userData.phone || '';
            if (document.getElementById('diachi')) document.getElementById('diachi').value = userData.DiaChi || '';
        }
    } catch (error) {
        console.error("Lỗi tải thông tin user:", error);
    }
}

// 3. Hàm tải danh sách sản phẩm từ API Giỏ hàng
async function loadCartItems(user_id, token) {
    try {
        const response = await fetch(`${GIOHANG_API_URL}/details?user_id=${user_id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            currentCartData = await response.json();
            renderOrderSummary(currentCartData);
        } else {
            console.error("Lỗi tải giỏ hàng");
        }
    } catch (error) {
        console.error("Lỗi kết nối:", error);
    }
}

// 4. Hàm vẽ HTML danh sách sản phẩm bên phải (Slidebar)
function renderOrderSummary(list) {
    const listContainer = document.querySelector('.listProductsPay');
    const totalMoneyElement = document.querySelector('.totalPricePay_money');
    
    if (!list || list.length === 0) {
        listContainer.innerHTML = '<p>Giỏ hàng trống</p>';
        if(totalMoneyElement) totalMoneyElement.textContent = formatCurrency(0);
        return;
    }

    let html = '';
    totalOrderAmount = 0;

    list.forEach(item => {
        const giaGoc = Number(item.GiaSach);
        const phanTramGiam = item.PhanTramGiam || 0;
        const giaBan = giaGoc * (1 - phanTramGiam / 100);
        const thanhTien = giaBan * item.SoLuong;
        
        totalOrderAmount += thanhTien;

        // Xử lý ảnh (nếu null thì dùng ảnh mặc định)

        // Xử lý ảnh
        let images = '';
        if (item.LinkHinhAnh) {
            // Tách chuỗi bằng dấu phẩy, sau đó xóa khoảng trắng thừa ở 2 đầu (trim)
            // Ví dụ: "a.jpg, b.png" -> ["a.jpg", "b.png"]
            images = item.LinkHinhAnh.split(',').map(img => img.trim()).filter(img => img !== "");
        }

        // Nếu không có ảnh nào, dùng ảnh mặc định
        if (images.length === 0) {
            images = ['no-image.png'];
        }
        if (images.length > 1)
            item.LinkHinhAnh = images[0];

        const imgUrl = item.LinkHinhAnh ? `../Image/${item.LinkHinhAnh}` : '../Image/no-image.png';

        html += `
            <div class="item_ProductPay">
                <div class="item_ProductPay_img">
                    <img src="${imgUrl}" alt="${item.TenSach}">
                    <div class="soluongProPay">${item.SoLuong}</div>
                </div>
                <div class="item_ProductPay_text">
                    ${item.TenSach}
                </div>
                <div class="item_ProductPay_price">${formatCurrency(thanhTien)}</div>
            </div>
        `;
    });

    listContainer.innerHTML = html;
    
    let discountAmount = 0;
    if (appliedCoupon.percent > 0) {
        discountAmount = totalOrderAmount * (appliedCoupon.percent / 100);
    }
    
    finalPaymentAmount = totalOrderAmount - discountAmount;

    // Hiển thị ra UI
    if (totalMoneyElement) {
        // Nếu có giảm giá, hiển thị chi tiết hơn
        if (discountAmount > 0) {
            totalMoneyElement.innerHTML = `
                <div style="font-size: 16px; color: #22a7ff;">Tạm tính: ${formatCurrency(totalOrderAmount)}</div>
                <div style="font-size: 16px; color: #28a745;">
                    Giảm giá (${appliedCoupon.code} - ${appliedCoupon.percent}%): -${formatCurrency(discountAmount)}
                </div>
                <div style="font-weight: bold; font-size: 22px; color: #ff2732; margin-top: 5px;">
                    ${formatCurrency(finalPaymentAmount)}
                </div>
            `;
        } else {
            totalMoneyElement.textContent = formatCurrency(finalPaymentAmount);
        }
    }
}

// 5. Hàm Xử lý Đặt hàng (Paying)
async function Paying() {
    // Ngăn form submit mặc định (nếu nút nằm trong form)
    event.preventDefault(); 

    // A. Lấy dữ liệu từ Form
    const name = document.getElementById('text_name').value.trim();
    const sdt = document.getElementById('sdt').value.trim();
    const diachi = document.getElementById('diachi').value.trim();
    const note = document.getElementById('note').value.trim();
    const typePay = document.getElementById('typePay').value;

    // B. Validate (Kiểm tra dữ liệu)
    let isValid = true;

    // Helper function để hiện/ẩn lỗi
    const toggleError = (selector, show) => {
        const el = document.querySelector(selector);
        if(el) el.style.display = show ? 'block' : 'none';
    };

    if (name === '') { toggleError('.erro_inputPay_name', true); isValid = false; } 
    else toggleError('.erro_inputPay_name', false);

    if (sdt === '') { toggleError('.erro_inputPay_sdt', true); isValid = false; } 
    else toggleError('.erro_inputPay_sdt', false);

    if (diachi === '') { toggleError('.erro_inputPay_diachi', true); isValid = false; } 
    else toggleError('.erro_inputPay_diachi', false);

    if (typePay === '') { toggleError('.erro_inputPay_typePay', true); isValid = false; } 
    else toggleError('.erro_inputPay_typePay', false);

    if (!isValid) return; // Dừng nếu có lỗi

    // C. Gửi dữ liệu lên API Tạo Đơn Hàng
    if (currentCartData.length === 0) {
        alert("Giỏ hàng trống, không thể đặt hàng!");
        return;
    }

    const token = localStorage.getItem('accessToken');
    const user_id = getLoggedInUserId();

    const orderData = {
        user_id: user_id,
        HoTen: name,
        SoDienThoai: sdt,
        DiaChiGiaoHang: diachi,
        GhiChu: note,
        PhuongThucThanhToan: typePay,
        
        // Gửi tổng tiền ĐÃ TRỪ GIẢM GIÁ
        TongTien: finalPaymentAmount, 
        
        // [QUAN TRỌNG] Gửi mã giảm giá về Backend (nếu có)
        MaGiamGia: (appliedCoupon.code && appliedCoupon.percent > 0) ? appliedCoupon.code : null,

        ChiTiet: currentCartData.map(item => ({
            MaSach: item.MaSach,
            SoLuong: item.SoLuong,
            DonGia: item.GiaSach * (1 - (item.PhanTramGiam || 0) / 100)
        }))
    };

    try {
        const response = await fetch(`${BASE_API_URL}hoadons`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            const result = await response.json();
            alert("Đặt hàng thành công! Mã đơn: " + (result.MaDonHang || 'Mới'));
            
            // Xóa coupon đã lưu sau khi đặt hàng thành công
            localStorage.removeItem('checkoutCoupon');

            // Xóa giỏ hàng sau khi đặt thành công (Backend nên tự làm, nhưng Frontend gọi API xóa cho chắc)
            await clearCartAfterOrder(user_id, token);
            
            // Chuyển hướng về trang chủ hoặc trang lịch sử đơn hàng
            window.location.href = '../Trangchu/index.html';
        } else {
            const err = await response.json();
            alert("Đặt hàng thất bại: " + (err.message || "Lỗi server"));
        }
    } catch (error) {
        console.error("Lỗi đặt hàng:", error);
        alert("Lỗi kết nối đến máy chủ.");
    }
}

// 6. Hàm xóa giỏ hàng sau khi đặt (Optional - Nếu Backend chưa tự xóa)
async function clearCartAfterOrder(user_id, token) {
    try {
        await fetch(`${BASE_API_URL}giohangsall?user_id=${user_id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        // Cập nhật lại badge giỏ hàng
        if(typeof initCartSystem === 'function') initCartSystem();
    } catch (e) {
        console.error("Lỗi dọn dẹp giỏ hàng:", e);
    }
}

// --- Logic Search Box (Giữ nguyên của bạn) ---
const searchInput = document.querySelector('.search input');
const historySearch = document.querySelector('.lichsu_timkiem');
if (searchInput && historySearch) {
    searchInput.addEventListener('focus', () => {
        historySearch.style.display = 'block';
    });
    document.addEventListener('click', (e) => {
        if (!historySearch.contains(e.target) && e.target !== searchInput) {
            historySearch.style.display = 'none';
        }
    });
}