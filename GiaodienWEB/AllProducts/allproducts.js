// 1. Đường dẫn API của bạn
const sachsAPI_URL_BASE = 'http://localhost:3000/api/sachs'; 
const giamgiaIDAPI_URL = 'http://localhost:3000/api/giamgias/';

async function getDiscountPercent(maGiamGia) {
    // Nếu không có mã giảm giá (null hoặc 0), trả về 0 luôn
    if (!maGiamGia) return 0;

    try {
        const response = await fetch(giamgiaIDAPI_URL + maGiamGia);
        if (response.ok) {
            const data = await response.json();
            
            // --- LƯU Ý QUAN TRỌNG ---
            // Hãy kiểm tra Console xem API trả về key tên là 'PhanTram', 'GiaTri' hay 'discount'
            // Ví dụ: return data.PhanTram;
            return data.PhanTramGiam || 0; 
        }
    } catch (error) {
        console.warn(`Không lấy được mã giảm giá ID ${maGiamGia}`, error);
    }

    // Nếu có lỗi hoặc không tìm thấy, mặc định giảm 0%
    return 0;
}

// 2. Hàm lấy dữ liệu và hiển thị
async function loadProducts() {
    try {
        const url = `${sachsAPI_URL_BASE}?page=1&limit=5&sortBy=TenSach&order=desc`
        const response = await fetch(url);
        const responseData = await response.json();
        console.log(responseData);
        const books = responseData.data // Giả sử API trả về mảng danh sách sản phẩm
        // console.log(books); // Kiểm tra dữ liệu nhận được

        const sachDaGiamGia = await Promise.all(books.map(async (book) => {
            const phanTramGiam = await getDiscountPercent(book.MaGiamGia);
            return { ...book, GiamGia: phanTramGiam };
        }));
        // console.log(sachDaGiamGia); // Kiểm tra dữ liệu sau khi thêm giảm giá
        renderProducts(sachDaGiamGia); // Gọi hàm hiển thị
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
        
        const GiamGia = product.GiamGia || 0; // Giảm giá (nếu có)
        // Tính lại giá Sale (nếu API chưa tính sẵn)
        const GiaSale = product.GiaSach * (1 - product.GiamGia / 100);

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
                    <div class="discount">-${product.GiamGia}%</div>
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