import { initProductLoader } from "../Trangchu/product-loader.js";

const ttSachYeuThichs_API_URL_BASE = "http://localhost:3000/api/sachyeuthichs/details";

const user_id = getLoggedInUserId();

function loadWishList(productWishList) {
    const  container = document.getElementById('product-container');
    let htmlContent = '';
    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    productWishList.forEach(product => {
        const GiamGia = product.PhanTramGiam || 0;
        const GiaSale = product.GiaSach * (1 - GiamGia / 100);
        const detailLink = `../ChitietSP/chitiet_sp.html?id=${product.MaSach}`;

        // Xử lý ảnh
        let images = '';
        if (product.LinkHinhAnh) {
            // Tách chuỗi bằng dấu phẩy, sau đó xóa khoảng trắng thừa ở 2 đầu (trim)
            // Ví dụ: "a.jpg, b.png" -> ["a.jpg", "b.png"]
            images = product.LinkHinhAnh.split(',').map(img => img.trim()).filter(img => img !== "");
        }

        // Nếu không có ảnh nào, dùng ảnh mặc định
        if (images.length === 0) {
            images = ['no-image.png'];
        }
        if (images.length > 1)
            product.LinkHinhAnh = images[0];

        const imagePath = `../Image/${product.LinkHinhAnh}`;

        htmlContent += `
            <div class="wishlist_item" data-id="${product.MaSach}">
                <div class="wishlist_item_img">
                    <a href="${detailLink}">
                        <img src="${imagePath}" alt="${product.TenSach}">
                    </a>
                    ${GiamGia > 0 ? `<div class="discount">-${GiamGia}%</div>` : ''}
                </div>
                <div class="wishlist_item_title">
                    <a href="${detailLink}">${product.TenSach}</a>
                </div>
                <div class="wishlist_item_prices">
                    <div class="wishlist_item_priceSale">${formatPrice(GiaSale)}</div>
                    <div class="wishlist_item_priceOriginal"><s>${formatPrice(product.GiaSach)}</s></div>
                </div>
                <div class="wishlist_item_footer">
                    <div class="wishlist_item_sold">
                        <img src="../Image/fire.png" alt="">  Đã bán ${formatSold(product.SoLuongDaBan)}
                    </div>
                    <div class="wishlist_item_cart">
                        <i class="fa-solid fa-cart-plus"></i>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = htmlContent;
}

document.addEventListener('DOMContentLoaded', () => {
    initProductLoader({
        apiUrl: ttSachYeuThichs_API_URL_BASE + `?user_id=${user_id}&`,
        containerId: 'product-container',
        paginationId: 'control-next-pre-Page',
        sortSelectId: 'sort_pro',
        limit: 24,
        renderFunction: loadWishList // Truyền hàm render tùy chỉnh
    });
});