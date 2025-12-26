// 1. Đường dẫn API của bạn
const API_URL = 'http://localhost:3000/api/sachs'; 

// 2. Hàm lấy dữ liệu và hiển thị
async function loadProducts() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json(); // Giả sử API trả về mảng danh sách sản phẩm
        console.log(data); // Kiểm tra dữ liệu nhận được
        renderProducts(data); // Gọi hàm hiển thị
    } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
    }
}

// 3. Hàm tạo HTML từ dữ liệu (Phần quan trọng nhất)
function renderProducts(productList) {
    const container = document.getElementById('product-container');
    let htmlContent = '';

    productList.forEach(product => {
        // --- XỬ LÝ DỮ LIỆU TRƯỚC KHI HIỂN THỊ ---
        
        // Format tiền tệ sang dạng Việt Nam (VD: 423000 -> 423.000₫)
        const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
        
        // Tính lại giá Sale (nếu API chưa tính sẵn)
        const priceSale = product.priceOriginal * (1 - product.discount / 100);

        // Tạo đường dẫn chi tiết (Dùng chung 1 trang chitiet và truyền ID)
        // Thay vì dẫn đến 'chitiet_sp_combo_kusuriya.html', hãy dẫn đến trang chung kèm ID
        const detailLink = `../ChitietSP/chitiet_sp.html?id=${product.MaSach}`;
        
        // Đường dẫn ảnh (Nếu API chỉ trả về tên file, cần nối thêm thư mục)
        // Ví dụ API trả về "anh1.png" -> src = "../Image/anh1.png"
        const imagePath = `../Image/${product.image}`; 

        // --- TẠO HTML ---
        // Lưu ý: Dấu huyền (`) bao quanh toàn bộ khối HTML
        htmlContent += `
            <div class="allproduct_item">
                <div class="allproduct_item_img">
                    <a href="${detailLink}">
                        <img src="${imagePath}" alt="${product.TenSach}">
                    </a>
                    <div class="discount">-${product.discount}%</div>
                </div>
                
                <div class="allproduct_item_title">
                    <a href="${detailLink}">${product.TenSach}</a>
                </div>
                
                <div class="allproduct_item_prices">
                    <div class="allproduct_item_priceSale">${formatPrice(priceSale)}</div>
                    <div class="allproduct_item_priceOriginal"><s>${formatPrice(product.priceOriginal)}</s></div>
                </div>
                
                <div class="allproduct_item_footer">
                    <div class="allproduct_item_sold">
                        <img src="../Image/fire.png" alt=""> Đã bán ${product.sold}+
                    </div>
                    
                    <div class="wishlist" data-id="${product.MaSach}">
                        <i onclick="addToWishList('${product.MaSach}')" class="fa-solid fa-heart"></i>
                    </div>
                    
                    <div class="allproduct_item_cart">
                        <i onclick="addToCart('${product.MaSach}')" class="fa-solid fa-cart-plus"></i>
                    </div>
                </div>
            </div>
        `;
    });

    // Gán HTML vào container
    container.innerHTML = htmlContent;
}

// 4. Chạy hàm khi trang tải xong
document.addEventListener('DOMContentLoaded', loadProducts);