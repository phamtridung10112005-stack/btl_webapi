document.addEventListener('DOMContentLoaded', () => {
    loadCartPage();

    const btnCheckout = document.querySelector('.btn_thanhtoan');
    if (btnCheckout) {
        btnCheckout.addEventListener('click', (e) => {
            e.preventDefault(); // Ngăn chặn chuyển trang ngay lập tức

            // 1. Lưu thông tin mã giảm giá hiện tại vào LocalStorage
            const couponData = {
                code: currentCouponCode,      // Biến toàn cục bạn đã khai báo ở đầu file
                percent: currentCouponPercent // Biến toàn cục bạn đã khai báo ở đầu file
            };
            
            // Lưu object dưới dạng chuỗi JSON
            localStorage.setItem('checkoutCoupon', JSON.stringify(couponData));

            // 2. Chuyển hướng sang trang thanh toán
            window.location.href = '../PayingProducts/paying.html';
        });
    }
});

// Biến lưu danh sách giỏ hàng hiện tại của trang này
let cartData = [];
let currentCouponPercent = 0; 
let currentCouponCode = '';

function nowForMySQL() {
  const now = new Date();

  const pad = n => n.toString().padStart(2, '0');

  return (
    now.getFullYear() + '-' +
    pad(now.getMonth() + 1) + '-' +
    pad(now.getDate()) + ' ' +
    pad(now.getHours()) + ':' +
    pad(now.getMinutes()) + ':' +
    pad(now.getSeconds())
  );
}

// 1. Hàm tải dữ liệu giỏ hàng (Gọi API)
async function loadCartPage() {
    const listCartContainer = document.querySelector('.listCart');
    const priceTempElement = document.querySelector('.price_temp');
    const priceResultElement = document.querySelector('.price_result');

    if (!listCartContainer) return;

    const token = localStorage.getItem('accessToken');
    const user_id = getLoggedInUserId(); 

    if (!token || !user_id) {
        listCartContainer.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">Vui lòng <a href="../Login/dangnhap.html" style="color: blue;">đăng nhập</a> để xem giỏ hàng</td></tr>';
        if(priceTempElement) priceTempElement.textContent = formatCurrency(0);
        if(priceResultElement) priceResultElement.textContent = formatCurrency(0);
        return;
    }

    try {
        const response = await fetch(`${GIOHANG_API_URL}/details?user_id=${user_id}`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });

        if (response.ok) {
            cartData = await response.json();
            renderCartTable(cartData);
        } else {
            console.error('Lỗi tải dữ liệu giỏ hàng');
            listCartContainer.innerHTML = '<tr><td colspan="6" class="text-center">Có lỗi xảy ra khi tải giỏ hàng.</td></tr>';
        }
    } catch (error) {
        console.error('Lỗi kết nối:', error);
        listCartContainer.innerHTML = '<tr><td colspan="6" class="text-center">Lỗi kết nối đến máy chủ.</td></tr>';
    }
}

// 2. Hàm vẽ bảng HTML
function renderCartTable(list) {
    const listCartContainer = document.querySelector('.listCart');
    const priceTempElement = document.querySelector('.price_temp');
    const priceResultElement = document.querySelector('.price_result');

    if (!listCartContainer) return;

    let html = '';
    let subTotal = 0;

    if (!list || list.length === 0) {
        listCartContainer.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 30px; font-size: 16px;">Giỏ hàng của bạn đang trống</td></tr>';
        if(priceTempElement) priceTempElement.textContent = formatCurrency(0);
        if(priceResultElement) priceResultElement.textContent = formatCurrency(0);
        return;
    }

    list.forEach(item => {
        const giaGoc = Number(item.GiaSach);
        const phanTramGiam = item.PhanTramGiam || 0;
        const giaBan = giaGoc * (1 - phanTramGiam / 100);
        const thanhTien = giaBan * item.SoLuong;
        
        subTotal += thanhTien;

        const detailLink = `../ChitietSP/chitiet_sp.html?id=${item.MaSach}`;
        const imagePath = `../Image/${item.LinkHinhAnh}`;

        html += `
            <tr data-id="${item.MaSach}">
                <td class="product_Cart">
                    <div class="imgCart">
                        <a href="${detailLink}">
                            <img src="${imagePath}" alt="${item.TenSach}">
                        </a>
                    </div>
                    <div class="titleCart">
                        <h3><a href="${detailLink}">${item.TenSach}</a></h3>
                    </div>
                </td>
                <td>
                    <div class="pricesCart Clearfix">
                        <div class="priceCart_original"><s>${formatCurrency(giaGoc)}</s></div>
                        <div class="priceCart_sale">${formatCurrency(giaBan)}</div>
                    </div>
                </td>
                <td>
                    <div class="amount_container" style="height: 30px;">
                        <div class="btn_amount">
                            <button onclick="updateCartQuantity(${item.MaSach}, -1)" class="down_amount"><i class="fa-solid fa-minus"></i></button>
                            
                            <input id="quantity_${item.MaSach}" 
                                   class="amount_sp" 
                                   type="number" 
                                   min="1" max="99"
                                   value="${item.SoLuong}" 
                                   onchange="handleInputQuantityChange(${item.MaSach}, this)">
                            
                            <button onclick="updateCartQuantity(${item.MaSach}, 1)" class="up_amount"><i class="fa-solid fa-plus"></i></button>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="total_priceCart">${formatCurrency(thanhTien)}</div>
                </td>
                <td>
                    <div class="btn_remove">
                        <i onclick="deleteCartItem(${item.MaSach})" class="fa-regular fa-circle-xmark" title="Xóa sản phẩm"></i>
                    </div>
                </td>
            </tr>
        `;
    });

    listCartContainer.innerHTML = html;
    
    // Cập nhật tổng tiền
    const formattedTotal = formatCurrency(subTotal);
    if(priceTempElement) priceTempElement.textContent = formattedTotal;
    const couponDiscountAmount = subTotal * (currentCouponPercent / 100);
    const finalTotal = subTotal - couponDiscountAmount
    if(priceResultElement) {
        priceResultElement.textContent = formatCurrency(finalTotal);
        
        // [MỚI] Hiển thị dòng chú thích nếu có mã giảm giá
        // Xóa các chú thích cũ trước khi thêm mới
        const existingNote = document.getElementById('coupon-note');
        if(existingNote) existingNote.remove();

        if (currentCouponPercent > 0) {
            priceResultElement.innerHTML += `
                <div id="coupon-note" style="font-size: 13px; color: #28a745; font-weight: normal; margin-top: 5px;">
                    (Đã giảm ${currentCouponPercent}% từ mã <b>${currentCouponCode}</b>: -${formatCurrency(couponDiscountAmount)})
                </div>
            `;
        }
    }
}

// 3. Xử lý nút Tăng/Giảm (+/-)
async function updateCartQuantity(maSach, delta) {
    const item = cartData.find(i => i.MaSach == maSach);
    if (!item) return;

    let newQty = item.SoLuong + delta;
    if (newQty < 1) newQty = 1;
    if (newQty > 99) newQty = 99;

    if (newQty !== item.SoLuong) {
        // Optimistic UI Update: Cập nhật giao diện ngay lập tức cho mượt
        // Sau đó gọi API ngầm. Nếu lỗi thì revert lại.
        document.getElementById(`quantity_${maSach}`).value = newQty;
        await callUpdateApi(maSach, newQty);
    }
}

// 4. Xử lý nhập trực tiếp vào ô Input
async function handleInputQuantityChange(maSach, inputElement) {
    let newQty = parseInt(inputElement.value);
    if (isNaN(newQty) || newQty < 1) newQty = 1;
    if (newQty > 99) newQty = 99;
    
    inputElement.value = newQty; // Reset lại giá trị hợp lệ nếu nhập sai
    await callUpdateApi(maSach, newQty);
}

// 5. Gọi API Cập nhật (PUT)
async function callUpdateApi(maSach, soLuong) {
    const token = localStorage.getItem('accessToken');
    const user_id = getLoggedInUserId();

    try {
        const response = await fetch(`${GIOHANG_API_URL}?user_id=${user_id}&masach=${maSach}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                SoLuong: soLuong,
                NgayThem: nowForMySQL()
            })
        });

        if (response.ok) {
            // Reload lại toàn bộ bảng để tính lại tổng tiền chính xác
            loadCartPage();
            // Cập nhật số trên badge header (gọi hàm từ base.js)
            if (typeof initCartSystem === 'function') initCartSystem();
        } else {
            console.error('Cập nhật thất bại');
            alert('Có lỗi khi cập nhật số lượng.');
            loadCartPage(); // Revert lại dữ liệu cũ
        }
    } catch (error) {
        console.error(error);
    }
}

// 6. Xử lý Xóa sản phẩm
async function deleteCartItem(maSach) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) return;

    const token = localStorage.getItem('accessToken');
    const user_id = getLoggedInUserId();

    try {
        const url = new URL(GIOHANG_API_URL);
        url.searchParams.append('user_id', user_id);
        url.searchParams.append('masach', maSach);

        const response = await fetch(url.toString(), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            // Xóa thành công
            loadCartPage();
            if (typeof initCartSystem === 'function') initCartSystem();
        } else {
            alert('Xóa thất bại. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Lỗi xóa:', error);
        alert('Lỗi kết nối.');
    }
}

// 7. Hàm format tiền tệ (Copy từ base.js sang để dùng cục bộ nếu cần)
function formatCurrency(number){
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
}

// 8. Xử lý nút "Xóa giỏ hàng" (Xóa tất cả)
// 8. Xử lý nút "Xóa giỏ hàng" (Xóa tất cả)
async function clearCart() {
    // Kiểm tra nếu giỏ hàng trống thì không làm gì
    if (!cartData || cartData.length === 0) {
        alert("Giỏ hàng đang trống!");
        return;
    }
    
    // Xác nhận người dùng muốn xóa
    if (!confirm("Bạn có chắc muốn xóa TOÀN BỘ giỏ hàng không? Hành động này không thể hoàn tác.")) {
        return;
    }

    const token = localStorage.getItem('accessToken');
    const user_id = getLoggedInUserId();

    if (!token || !user_id) {
        alert("Vui lòng đăng nhập lại.");
        return;
    }
    
    try {
        // Xây dựng URL: http://localhost:3000/api/giohangsall?user_id=...
        // Lưu ý: BASE_API_URL được lấy từ base.js ('http://localhost:3000/api/')
        const url = `${BASE_API_URL}giohangsall?user_id=${user_id}`;

        const response = await fetch(url, {
            method: 'DELETE', // Dùng DELETE theo chuẩn RESTful
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            // Xóa thành công
            // 1. Làm sạch mảng dữ liệu cục bộ
            cartData = [];
            
            // 2. Vẽ lại bảng (sẽ hiện thông báo "Giỏ hàng trống")
            renderCartTable(cartData);
            
            // 3. Cập nhật số lượng trên Header (về 0)
            if (typeof initCartSystem === 'function') {
                await initCartSystem();
            }
            
            // 4. Thông báo nhẹ
            // alert("Đã xóa sạch giỏ hàng!"); 
        } else {
            const err = await response.json();
            console.error("Lỗi server:", err);
            alert("Xóa thất bại: " + (err.message || "Lỗi không xác định"));
        }
        
    } catch (error) {
        console.error("Lỗi mạng:", error);
        alert("Không thể kết nối đến máy chủ.");
    }
}

// 9. Nút Cập nhật giỏ hàng (Thực ra không cần thiết vì ta đã cập nhật AJAX từng dòng)
function updateCart() {
    loadCartPage();
    alert("Đã cập nhật dữ liệu mới nhất!");
}

document.addEventListener('DOMContentLoaded', () => {
    loadCartPage();

    // --- [MỚI] THÊM ĐOẠN NÀY ---
    // Tìm nút "Áp dụng" bằng class
    const btnCoupon = document.querySelector('.btn_discountCode');
    
    // Nếu nút tồn tại thì gắn sự kiện click
    if (btnCoupon) {
        btnCoupon.addEventListener('click', (e) => {
            e.preventDefault(); // Ngăn chặn hành vi mặc định (nếu nút nằm trong form)
            applyCoupon();      // Gọi hàm xử lý
        });
    }
});

async function applyCoupon() {
    // 1. Tìm ô input và vùng thông báo
    const input = document.querySelector('.input_discountCode') || document.getElementById('coupon_input');
    
    // Tìm hoặc tạo vùng thông báo động
    let msgDiv = document.querySelector('.coupon_message_dynamic');
    if (!msgDiv) {
        const container = document.querySelector('.discountCode_container');
        if (container) {
            msgDiv = document.createElement('div');
            msgDiv.className = 'coupon_message_dynamic';
            msgDiv.style.marginTop = '10px';
            msgDiv.style.fontSize = '14px';
            msgDiv.style.fontWeight = 'bold';
            container.appendChild(msgDiv);
        }
    }

    if (!input) return;
    const code = input.value.trim().toUpperCase();

    // Reset thông báo
    if (msgDiv) {
        msgDiv.innerHTML = '';
        msgDiv.style.color = '#22a7ff';
    }

    // Nếu ô trống -> Hủy mã
    if (!code) {
        currentCouponPercent = 0;
        currentCouponCode = '';
        renderCartTable(cartData);
        if (msgDiv) msgDiv.textContent = "Đã bỏ áp dụng mã giảm giá.";
        return;
    }

    try {
        // Gọi API lấy thông tin mã
        // URL: .../api/giamgias/check?code=...
        const apiUrl = `${BASE_API_URL}giamgias/${code}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        // -----------------------------------------------------------
        // XỬ LÝ KẾT QUẢ VÀ KIỂM TRA LOGIC JS (Validation)
        // -----------------------------------------------------------
        
        if (response.ok) {
            const coupon = data;

            // ==> GỌI HÀM KIỂM TRA ĐIỀU KIỆN CHI TIẾT <==
            const validationError = validateCouponData(coupon);

            if (validationError) {
                // Nếu có lỗi logic (Hết hạn, Null, Hết số lượng...)
                currentCouponPercent = 0;
                currentCouponCode = '';
                renderCartTable(cartData);
                
                if (msgDiv) {
                    msgDiv.style.color = '#dc3545'; // Đỏ
                    msgDiv.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${validationError}`;
                }
            } else {
                // Hợp lệ hoàn toàn -> Áp dụng
                currentCouponPercent = coupon.PhanTramGiam;
                currentCouponCode = coupon.MaGiamGia;
                
                renderCartTable(cartData); 
                
                if (msgDiv) {
                    msgDiv.style.color = '#28a745'; // Xanh
                    msgDiv.innerHTML = `<i class="fa-solid fa-check-circle"></i> Mã <b>${currentCouponCode}</b> hợp lệ! Giảm <b>${currentCouponPercent}%</b>`;
                }
            }

        } else {
            // Lỗi từ Server trả về (404, 400...)
            currentCouponPercent = 0;
            currentCouponCode = '';
            renderCartTable(cartData);
            
            if (msgDiv) {
                msgDiv.style.color = '#dc3545';
                msgDiv.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${data.message || "Mã không hợp lệ"}`;
            }
        }

    } catch (error) {
        console.error("Lỗi check coupon:", error);
        if (msgDiv) {
            msgDiv.style.color = '#dc3545';
            msgDiv.textContent = "Lỗi kết nối server.";
        }
    }
}

function validateCouponData(coupon) {
    // 1. Kiểm tra các trường bắt buộc có bị NULL không
    // (Yêu cầu: Nếu NgayBatDau, NgayKetThuc, SoLuong là null => Không áp dụng)
    if (coupon.NgayBatDau === null || coupon.NgayKetThuc === null || coupon.SoLuong === null) {
        return "Mã này chưa được kích hoạt (Thiếu thông tin ngày/số lượng).";
    }

    // Lưu ý: Nếu API không trả về các trường này (undefined), ta cũng coi như lỗi
    if (typeof coupon.NgayBatDau === 'undefined' || typeof coupon.SoLuong === 'undefined') {
        return null; 
    }

    // 2. Kiểm tra Số lượng
    if (coupon.SoLuong <= 0) {
        return "Mã giảm giá này đã hết lượt sử dụng.";
    }

    // 3. Kiểm tra Thời gian (Ngày bắt đầu & Kết thúc)
    const now = new Date();
    const startDate = new Date(coupon.NgayBatDau);
    const endDate = new Date(coupon.NgayKetThuc);
    startDate.setHours(0,0,0,0);
    endDate.setHours(23,59,59,999);

    if (now < startDate) {
        return `Mã này chỉ bắt đầu áp dụng từ ngày ${formatDateVN(startDate)}.`;
    }

    if (now > endDate) {
        return "Mã giảm giá này đã hết hạn.";
    }

    return null;
}

// Hàm phụ trợ: Format ngày tháng VN (dd/mm/yyyy)
function formatDateVN(dateObj) {
    return dateObj.toLocaleDateString('vi-VN');
}