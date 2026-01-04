import { initProductLoader } from '../Trangchu/product-loader.js';

// 1. Đường dẫn API của bạn
const sachsAPI_URL_BASE = 'http://localhost:3000/api/sachs?';

// Khởi tạo bộ tải sản phẩm với hàm render tùy chỉnh
function renderProducts(productList) {
    const container = document.getElementById('product-container');
    // Format tiền tệ sang dạng Việt Nam (VD: 423000 -> 423.000₫)
    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    let htmlContent = '';

    productList.forEach(product => {
        // --- XỬ LÝ DỮ LIỆU TRƯỚC KHI HIỂN THỊ ---
        const GiamGia = product.PhanTramGiam || 0;
        const GiaSale = product.GiaSach * (1 - GiamGia / 100);

        // Tạo đường dẫn chi tiết (Dùng chung 1 trang chitiet và truyền ID)
        // Thay vì dẫn đến 'chitiet_sp_combo_kusuriya.html', hãy dẫn đến trang chung kèm ID
        const detailLink = `../ChitietSP/chitiet_sp.html?id=${product.MaSach}`;
        const imagePath = `../Image/${product.LinkHinhAnh}`; 

        // --- TẠO HTML ---
        htmlContent += `
            <div class="allproduct_item" data-id="${product.MaSach}">
                <div class="allproduct_item_img">
                    <a href="${detailLink}">
                        <img src="${imagePath}" alt="${product.TenSach}">
                    </a>
                    <div class="discount">-${GiamGia}%</div>
                </div>
                
                <div class="allproduct_item_title">
                    <a href="${detailLink}">${product.TenSach}</a>
                </div>
                
                <div class="allproduct_item_prices">
                    <div class="allproduct_item_priceSale">${formatPrice(GiaSale)}</div>
                    <div class="allproduct_item_priceOriginal"><s>${formatPrice(product.GiaSach)}</s></div>
                </div>
                
                <div class="allproduct_item_footer">
                    <div class="allproduct_item_sold">
                        <img src="../Image/fire.png" alt=""> Đã bán ${product.SoLuongDaBan}+
                    </div>
                    
                    <div class="wishlist">
                        <i class="fa-solid fa-heart"></i>
                    </div>
                    
                    <div class="allproduct_item_cart">
                        <i class="fa-solid fa-cart-plus"></i>
                    </div>
                </div>
            </div>
        `;
    });
    // Gán HTML vào container
    container.innerHTML = htmlContent;
    if (window.highlightHeartIcons) {
        highlightHeartIcons();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initProductLoader({
        apiUrl: sachsAPI_URL_BASE,
        containerId: 'product-container',
        paginationId: 'control-next-pre-Page',
        sortSelectId: 'sort_pro',
        limit: 24,
        renderFunction: renderProducts // Truyền hàm render tùy chỉnh
    });
});