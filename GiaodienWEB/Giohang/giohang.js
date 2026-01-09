// file: giohang.js

// Import hàm từ base.js nếu bạn dùng module (nhưng ở đây bạn đang nhúng script thẻ thường nên dùng biến toàn cục)
// Đảm bảo base.js được nhúng TRƯỚC giohang.js trong HTML
// const GIOHANG_API_URL = 'http://localhost:3000/api/giohangs/user/';
document.addEventListener('DOMContentLoaded', () => {
    // Gọi hàm tải giỏ hàng ngay khi vào trang
    loadCartPage();
});

// Biến lưu danh sách giỏ hàng hiện tại của trang này
let cartData = [];

// 1. Hàm tải dữ liệu giỏ hàng (Gọi API)
async function loadCartPage() {
    const listCartContainer = document.querySelector('.listCart');
    const priceTempElement = document.querySelector('.price_temp');
    const priceResultElement = document.querySelector('.price_result');

    if (!listCartContainer) return; // Không tìm thấy bảng giỏ hàng

    // Lấy thông tin user từ base.js (giả sử base.js đã có hàm getLoggedInUserId)
    const token = localStorage.getItem('accessToken');
    const user_id = getLoggedInUserId(); 

    if (!token || !user_id) {
        listCartContainer.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">Vui lòng <a href="../Login/dangnhap.html" style="color: blue;">đăng nhập</a> để xem giỏ hàng</td></tr>';
        if(priceTempElement) priceTempElement.textContent = formatCurrency(0);
        if(priceResultElement) priceResultElement.textContent = formatCurrency(0);
        return;
    }

    try {
        // Gọi API lấy chi tiết giỏ hàng
        // URL API lấy từ biến toàn cục trong base.js (GIOHANG_API_URL)
        const response = await fetch(`${GIOHANG_API_URL}?user_id=${user_id}`, {
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
    let totalPrice = 0;

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
        
        totalPrice += thanhTien;

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
    const formattedTotal = formatCurrency(totalPrice);
    if(priceTempElement) priceTempElement.textContent = formattedTotal;
    if(priceResultElement) priceResultElement.textContent = formattedTotal;
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
        const response = await fetch(GIOHANG_API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                User_ID: user_id,
                MaSach: maSach,
                SoLuong: soLuong
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
async function clearCart() {
    if (!cartData || cartData.length === 0) {
        alert("Giỏ hàng đang trống!");
        return;
    }
    
    if (!confirm("Bạn có chắc muốn xóa TOÀN BỘ giỏ hàng?")) return;

    // Ở đây ta có thể gọi vòng lặp xóa từng cái hoặc gọi 1 API xóa hết (nếu backend hỗ trợ)
    // Giả sử backend chưa có API xóa hết, ta sẽ xóa từng cái (hơi chậm nhưng an toàn)
    // Tốt nhất là backend nên có API: DELETE /api/giohangs/clear?user_id=...
    
    // Tạm thời gọi API xóa từng món (Cách đơn giản cho Frontend)
    const token = localStorage.getItem('accessToken');
    const user_id = getLoggedInUserId();
    
    try {
        // Cách tốt nhất: Backend hỗ trợ DELETE /api/giohangs/all
        // Nếu không, phải loop delete (không khuyến khích)
        alert("Chức năng đang được cập nhật (Cần Backend hỗ trợ API Xóa Hết)");
        
    } catch (error) {
        console.error(error);
    }
}

// 9. Nút Cập nhật giỏ hàng (Thực ra không cần thiết vì ta đã cập nhật AJAX từng dòng)
function updateCart() {
    loadCartPage();
    alert("Đã cập nhật dữ liệu mới nhất!");
}