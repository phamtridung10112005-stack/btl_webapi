// paying.js

// Biến lưu trữ dữ liệu giỏ hàng để tính toán khi đặt hàng
let currentCartData = [];
let totalOrderAmount = 0; // Tổng tiền đơn hàng

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
    
    // Cập nhật tổng tiền
    if (totalMoneyElement) {
        totalMoneyElement.textContent = formatCurrency(totalOrderAmount);
    }
}

// 5. Hàm Xử lý Đặt hàng (Paying)
async function Paying() {
    // Ngăn form submit mặc định (nếu nút nằm trong form)
    event.preventDefault(); 

    // A. Lấy dữ liệu từ Form
    const name = document.getElementById('text_name').value.trim();
    const sdt = document.getElementById('sdt').value.trim();
    const gmail = document.getElementById('gmail').value.trim();
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

    if (gmail === '') { toggleError('.erro_inputPay_gmail', true); isValid = false; } 
    else toggleError('.erro_inputPay_gmail', false);

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
        User_ID: user_id,
        HoTenNguoiNhan: name,
        SDT: sdt,
        Email: gmail,
        DiaChiGiaoHang: diachi,
        GhiChu: note,
        PhuongThucThanhToan: typePay,
        TongTien: totalOrderAmount,
        // Danh sách sản phẩm (Backend cần xử lý mảng này để insert vào chi tiết đơn hàng)
        ChiTiet: currentCartData.map(item => ({
            MaSach: item.MaSach,
            SoLuong: item.SoLuong,
            DonGia: item.GiaSach * (1 - (item.PhanTramGiam || 0) / 100) // Giá đã giảm
        }))
    };

    try {
        // Giả sử API tạo đơn hàng là POST /api/donhangs
        const response = await fetch(`${BASE_API_URL}donhangs`, {
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