// 1. Đường dẫn API của bạn
const sachsAPI_URL_BASE = 'http://localhost:3000/api/sachs';
let currentState = {
    currentPage: 1,
    limit: 24,
    sortBy: 'defaut',
    orderBy: 'asc'
};

document.addEventListener('DOMContentLoaded', function() {
    // 1. Lấy phần tử select
    const sortSelect = document.getElementById('sort_pro');

    function handleSort(sortString) {
        const parts = sortString.split('-'); 
        
        currentState.sortBy = parts[0];
        currentState.orderBy = parts[1];

        // reset trang về 1 mỗi khi sắp xếp
        currentState.currentPage = 1;

        console.log(`Đang sắp xếp theo cột: ${currentState.sortBy}, Chiều: ${currentState.orderBy}`);
        
        // Gọi hàm load API với 2 tham số riêng biệt
        loadProducts(currentState.sortBy, currentState.orderBy);
    }
    
    if (sortSelect) {
        console.log(`sortSelect value on load: ${sortSelect.value}`);
        handleSort(sortSelect.value); // Tải sản phẩm với sắp xếp mặc định khi trang load
    }

    // Lắng nghe sự kiện thay đổi (change)
    sortSelect.addEventListener('change', function(event) {
        const selectedSortValue = event.target.value;
        
        // console.log("Người dùng chọn sắp xếp theo:", selectedSortValue); // Kiểm tra log

        handleSort(selectedSortValue);
    });
});

// Hàm vẽ phân trang
function renderPagination(totalPages) {
    const container = document.getElementById('control-next-pre-Page');
    
    // Nếu chỉ có 1 trang hoặc không có trang nào thì ẩn đi
    if (totalPages <= 1) {
        container.style.display = 'none';
        return;
    } else {
        container.style.display = 'flex'; 
    }

    container.innerHTML = '';

    // --- LOGIC TÍNH TOÁN 5 NÚT ---
    let maxVisibleButtons = 5;
    
    // Mặc định: Lấy trang hiện tại làm tâm, trừ 2 và cộng 2
    let startPage = currentState.currentPage - 2;
    let endPage = currentState.currentPage + 2;

    // Xử lý đầu mút (Nếu trang hiện tại là 1 hoặc 2)
    if (startPage < 1) {
        startPage = 1;
        endPage = maxVisibleButtons;
    }

    // Xử lý cuối mút (Nếu trang hiện tại gần cuối)
    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = totalPages - (maxVisibleButtons - 1);
    }

    // Đảm bảo startPage không bao giờ < 1 (trường hợp tổng trang < 5)
    if (startPage < 1) {
        startPage = 1;
    }
    // -----------------------------

    // 1. Tạo nút PREVIOUS (<)
    const prevBtn = document.createElement('button');
    prevBtn.innerText = '<';
    if (currentState.currentPage === 1) {
        prevBtn.disabled = true; 
        prevBtn.style.opacity = '0.5';
    } else {
        prevBtn.onclick = () => {
            currentState.currentPage--;
            loadProducts(currentState.sortBy, currentState.orderBy);
        };
    }
    container.appendChild(prevBtn);

    // 2. Tạo các nút SỐ TRANG (Chạy từ startPage đến endPage)
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.innerText = i;
        
        if (i === currentState.currentPage) {
            pageBtn.classList.add('active'); 
            // Style cứng nếu chưa có CSS class
            pageBtn.style.backgroundColor = '#22a7ff'; 
            pageBtn.style.color = '#fff';
        }

        pageBtn.onclick = () => {
            if (currentState.currentPage !== i) { // Chỉ load nếu bấm trang khác trang hiện tại
                currentState.currentPage = i;
                loadProducts(currentState.sortBy, currentState.orderBy);
            }
        };
        container.appendChild(pageBtn);
    }

    // 3. Tạo nút NEXT (>)
    const nextBtn = document.createElement('button');
    nextBtn.innerText = '>';
    if (currentState.currentPage === totalPages) {
        nextBtn.disabled = true;
        nextBtn.style.opacity = '0.5';
    } else {
        nextBtn.onclick = () => {
            currentState.currentPage++;
            loadProducts(currentState.sortBy, currentState.orderBy);
        };
    }
    container.appendChild(nextBtn);
}

// 2. Hàm lấy dữ liệu và hiển thị
async function loadProducts(sortBy, orderBy) {
    try {
        const url = `${sachsAPI_URL_BASE}?page=${currentState.currentPage}&limit=${currentState.limit}&sortBy=${sortBy}&order=${orderBy}`
        console.log(url);
        const response = await fetch(url);
        const responseData = await response.json();
        console.log(responseData);
        const books = responseData.data // Giả sử API trả về mảng danh sách sản phẩm
        renderProducts(books); // Gọi hàm hiển thị

        const totalPages = responseData.pagination ? responseData.pagination.tongSoTrang : 0;
        renderPagination(totalPages); // Vẽ phân trang
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
        
        const GiamGia = product.PhanTramGiam || 0;
        const GiaSale = product.GiaSach * (1 - GiamGia / 100);

        // Tạo đường dẫn chi tiết (Dùng chung 1 trang chitiet và truyền ID)
        // Thay vì dẫn đến 'chitiet_sp_combo_kusuriya.html', hãy dẫn đến trang chung kèm ID
        const detailLink = `../ChitietSP/chitiet_sp.html?id=${product.MaSach}`;
        const imagePath = `../Image/${product.LinkHinhAnh}`; 

        // --- TẠO HTML ---
        htmlContent += `
            <div class="allproduct_item">
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

// // 4. Chạy hàm khi trang tải xong
// document.addEventListener('DOMContentLoaded', loadProducts);