function formatCurrency(number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
}
function formatSold(n) {
  const num = Number(n) || 0;

  if (num < 1000) return num.toString();

  return Math.floor(num / 1000) + "k+";
}
// ==============================================================
//                  LOGIC FLASH SALE SYSTEM (DYNAMIC)
// ==============================================================

// 1. CẤU HÌNH MÃ GIẢM GIÁ MUỐN CHẠY
const TARGET_SALE_CODE = "SALE10"; // Nhập mã bạn muốn áp dụng tại đây
const MAX_SHOW_FSLIDER = 20;

// Biến lưu trữ ngày kết thúc (sẽ được cập nhật từ API)
let GLOBAL_SALE_END_DATE = null;

function CountDown(C){
    const dayElement = document.querySelector('.days');
    const hourElement = document.querySelector('.hours');
    const minuteElement = document.querySelector('.minutes');
    const secondElement = document.querySelector('.seconds');
    function UpdateTime(){
        const now = new Date().getTime();
        const timeRun = C - now;
        if (timeRun < 0){
            clearInterval(interval);
            return;
        }
        const days = Math.floor(timeRun / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRun % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRun % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRun % (1000 * 60)) / (1000));

        dayElement.textContent = days;
        hourElement.textContent = hours < 10 ? `0${hours}` :hours;
        minuteElement.textContent = minutes < 10 ? `0${minutes}` : minutes;
        secondElement.textContent = seconds < 10 ? `0${seconds}` : seconds;

        // console.log(`${days}\t${hours}\t${minutes}\t${seconds}`)
    }
    const interval = setInterval(UpdateTime, 1000);
    UpdateTime();
}
// 2. HÀM KHỞI TẠO HỆ THỐNG FLASH SALE
async function initFlashSaleSystem() {
    try {
        // A. Gọi API lấy thông tin mã giảm giá
        // Lưu ý: Đảm bảo đường dẫn API đúng (dùng BASE_API_URL nếu có)
        const response = await fetch(`${BASE_API_URL}giamgias/${TARGET_SALE_CODE}`);
        
        if (!response.ok) {
            console.warn("Không tìm thấy mã giảm giá hoặc lỗi server.");
            document.querySelector('.flash_sale_container').style.display = 'none';
            return;
        }

        const data = await response.json();
        console.log('DT:', data);
        
        // Kiểm tra xem mã có ngày kết thúc không
        if (!data || !data.NgayKetThuc) {
            console.warn("Mã giảm giá không có ngày kết thúc.");
            return;
        }

        // B. Lưu ngày kết thúc vào biến toàn cục
        GLOBAL_SALE_END_DATE = new Date(data.NgayKetThuc);
        const endTimeStamp = GLOBAL_SALE_END_DATE.getTime();

        console.log(`Flash Sale kết thúc vào: ${GLOBAL_SALE_END_DATE}`);

        // C. Bắt đầu đếm ngược
        if (typeof CountDown === 'function') {
            CountDown(endTimeStamp);
        }

        // D. Tải và lọc sản phẩm theo ngày này
        loadFlashSaleItems();

    } catch (error) {
        console.error("Lỗi khởi tạo Flash Sale:", error);
        document.querySelector('.flash_sale_container').style.display = 'none';
    }
}

// 3. HÀM TẢI DỮ LIỆU VÀ LỌC SẢN PHẨM
async function loadFlashSaleItems() {
    const container = document.querySelector('.flash_sale_list_track');
    const marqueeContainer = document.querySelector('.flash_sale_header_mid marquee');
    
    // Nếu chưa lấy được ngày kết thúc từ mã giảm giá thì dừng
    if (!container || !GLOBAL_SALE_END_DATE) return;

    try {
        const apiUrl = `${BOOKS_API_URL}?limit=50`; 
        
        const response = await fetch(apiUrl);
        if (!response.ok) return;

        const rawData = await response.json();
        const allBooks = Array.isArray(rawData) ? rawData : (rawData.data || []);
        // console.log('DAT books: ', allBooks);
        // --- LỌC SẢN PHẨM ---
        const saleBooks = allBooks.filter(item => {
            if (item.MaGiamGia === TARGET_SALE_CODE) return true;

            return false; 
        });

        // Nếu không có sản phẩm nào -> Ẩn khối Flash Sale
        console.log(saleBooks);
        if (saleBooks.length === 0) {
            document.querySelector('.flash_sale_container').style.display = 'none';
            return;
        }

        // --- RENDER SLIDER HTML ---
        const displayBooks = saleBooks.slice(0, MAX_SHOW_FSLIDER);
        
        const html = displayBooks.map(item => {
            const giaGoc = Number(item.GiaSach);
            const phanTram = item.PhanTramGiam;
            const giaBan = giaGoc * (1 - phanTram / 100);
            const imgUrl = item.LinkHinhAnh ? `../Image/${item.LinkHinhAnh}` : '../Image/no-image.png';
            const detailLink = `../ChitietSP/chitiet_sp.html?id=${item.MaSach}`;

            return `
                <div class="flash_sale_item">
                    <div class="flash_sale_item_img">
                        <a href="${detailLink}"><img src="${imgUrl}" alt="${item.TenSach}" onerror="this.src='../Image/no-image.png'"></a>
                    </div>
                    <div class="flash_sale_item_text">
                        <a href="${detailLink}">${item.TenSach}</a>
                    </div>
                    <div class="flash_sale_item_price">
                        <div class="price_sale">${formatCurrency(giaBan)}</div>
                        <div class="price">${formatCurrency(giaGoc)}</div>
                    </div>
                    <div class="flash_sale_item_footer">
                        <div class="flash_sale_item_sold">
                            <img style="width: 16px;object-fit: contain;" src="../Image/fire.png" alt=""> 
                            Đã bán ${formatSold(item.SoLuongDaBan)}
                        </div>
                        <div class="wishlist" onclick="addToWishList(this)" data-id="${item.MaSach}">
                            <i class="fa-solid fa-heart"></i>
                        </div>
                        <div class="cart" onclick="addToCart(this)" data-id="${item.MaSach}">
                            <i class="fa-solid fa-cart-plus"></i>
                        </div>
                    </div>
                    <div class="discount">-${phanTram}%</div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;

        // --- RENDER MARQUEE ---
        if (marqueeContainer) {
            const marqueeHtml = saleBooks.map(item => {
                const detailLink = `../ChitietSP/chitiet_sp.html?id=${item.MaSach}`;
                return `<a href="${detailLink}">+ ${item.TenSach} - Giảm ${item.PhanTramGiam}%</a>`;
            }).join('');
            marqueeContainer.innerHTML = marqueeHtml;
        }

        // --- KHỞI TẠO SLIDER ---
        initFlashSaleSlider();

    } catch (error) {
        console.error("Lỗi tải danh sách sản phẩm Flash Sale:", error);
    }
}

// 4. LOGIC SLIDER (Đã tối ưu không bị cắt item)
function initFlashSaleSlider() {
    const track = document.querySelector('.flash_sale_list_track');
    const items = document.querySelectorAll('.flash_sale_item');
    const nextBtn = document.querySelector('.flash_sale_body .next-btn');
    const preBtn = document.querySelector('.flash_sale_body .pre-btn');

    if (!track || items.length === 0 || !nextBtn || !preBtn) return;

    let currentIndex = 0;

    function getSlideMetrics() {
        const containerWidth = document.querySelector('.flash_sale_list').offsetWidth;
        const itemStyle = window.getComputedStyle(items[0]);
        
        const itemWidth = items[0].offsetWidth;
        const marginLeft = parseFloat(itemStyle.marginLeft) || 0;
        const marginRight = parseFloat(itemStyle.marginRight) || 0;
        
        // Tính tổng chiều rộng (Width + Margins)
        const itemFullWidth = itemWidth + marginLeft + marginRight;

        let itemsPerView = Math.floor(containerWidth / itemFullWidth);
        if (itemsPerView < 1) itemsPerView = 1;

        return { itemFullWidth, itemsPerView, totalItems: items.length };
    }

    function updatePosition() {
        const { itemFullWidth, itemsPerView, totalItems } = getSlideMetrics();
        const maxIndex = Math.max(0, totalItems - itemsPerView);
        
        if (currentIndex > maxIndex) currentIndex = maxIndex;
        if (currentIndex < 0) currentIndex = 0;

        const translateValue = currentIndex * itemFullWidth;
        
        track.style.transform = `translateX(-${translateValue}px)`;
        track.style.transition = 'transform 0.5s ease-in-out';
    }

    nextBtn.onclick = () => {
        const { itemsPerView, totalItems } = getSlideMetrics();
        const maxIndex = Math.max(0, totalItems - itemsPerView);
        if (currentIndex < maxIndex) {
            currentIndex++;
            updatePosition();
        }
    };

    preBtn.onclick = () => {
        if (currentIndex > 0) {
            currentIndex--;
            updatePosition();
        }
    };

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updatePosition, 100);
    });
    updatePosition();
}
///////////////////////////////////
/////////////////// Logic tính toán số lượng sản phẩm (Grid System) ///////////////////
const BOOKS_API_URL = `http://localhost:3000/api/sachs`;
/**
 * Hàm tính số lượng sản phẩm tối ưu
 * @param {string} containerSelector - Selector của container
 * @param {number} minItemWidth - Chiều rộng tối thiểu item (250px)
 * @param {number} gap - Khoảng cách (20px)
 * @param {number} rows - Số dòng muốn hiển thị (2 dòng)
 * @param {number} minItemsTotal - Số lượng tối thiểu bắt buộc (4 sản phẩm)
 */
function calculateLimitForRows(containerSelector = '.container', minItemWidth = 250, gap = 20, rows = 2, minItemsTotal = 4) {
    const container = document.querySelector(containerSelector);
    if (!container) return 10; 

    // Lấy chiều rộng container
    const containerWidth = container.offsetWidth;

    // 1. Tính số cột hiển thị được trên 1 dòng
    const itemsPerRow = Math.floor((containerWidth + gap) / (minItemWidth + gap));
    const columns = itemsPerRow > 0 ? itemsPerRow : 1;

    console.log(`Màn hình hiển thị: ${columns} cột.`);
    
    // 2. Tính tổng số sản phẩm dựa trên số dòng mong muốn
    let limit = columns * rows;

    // 3. [MỚI] Kiểm tra điều kiện tối thiểu (Ít nhất 4 sản phẩm)
    // Nếu tính ra nhỏ hơn 4 (ví dụ trên điện thoại 1 cột x 2 dòng = 2), thì ép về 4
    if (limit < minItemsTotal) {
        limit = minItemsTotal;
    }

    return limit;
}

function updateProductDisplayLimit() {
    // Tính toán số lượng cần cho 2 dòng
    const limitNeeded = calculateLimitForRows('.container', 250, 20, 2, 4);
    
    console.log(`Hiển thị: ${limitNeeded} sản phẩm.`);
    const lists = document.querySelectorAll('.list_sp');
    lists.forEach(list => {
        const items = list.querySelectorAll('.item_sp');
        items.forEach((item, index) => {
            if (index < limitNeeded) {
                item.style.display = 'flex'; // Hiện
            } else {
                item.style.display = 'none'; // Ẩn bớt nếu vượt quá 2 dòng
            }
        });
    });
}

// --- HÀM RENDER HTML CHO 1 SẢN PHẨM ---
function createProductHTML(item) {
    // Tính giá
    const giaGoc = Number(item.GiaSach);
    const phanTramGiam = item.PhanTramGiam || 0;
    const giaBan = giaGoc * (1 - phanTramGiam / 100);
    
    // Xử lý ảnh
    const imgUrl = `../Image/${item.LinkHinhAnh}`;
    const detailLink = `../ChitietSP/chitiet_sp.html?id=${item.MaSach}`;

    // Tạo chuỗi HTML
    return `
        <div class="item_sp" data-id="${item.MaSach}">
            <div class="img_item_sp">
                <a href="${detailLink}"><img src="${imgUrl}" alt="${item.TenSach}"></a>
            </div>
            <div class="title_item_sp">
                <a href="${detailLink}">${item.TenSach}</a>
            </div>
            <div class="gia_sp">
                <div class="price_sale">${formatCurrency(giaBan)}</div>
                <div class="price">${formatCurrency(giaGoc)}</div>
            </div>
            <div class="item_sp_footer">
                <div class="item_sp_sold">
                    <img style="width: 16px;object-fit: contain;" src="../Image/fire.png" alt=""> 
                    Đã bán ${formatSold(item.SoLuongDaBan)}
                </div>
                <div class="wishlist">
                    <i class="fa-solid fa-heart"></i>
                </div>
                <div class="cart">
                    <i class="fa-solid fa-cart-plus"></i>
                </div>
            </div>
            ${phanTramGiam > 0 ? `<div class="discount">-${phanTramGiam}%</div>` : ''}
        </div>
    `;
}

// --- HÀM GỌI API VÀ HIỂN THỊ ---
async function loadHomeSections() {
    // 1. Tính toán số lượng cần load (Responsive)
    // Lấy container đầu tiên để làm mẫu đo kích thước
    const apiLimit = 12;
    const displayLimit = calculateLimitForRows('.list_sp', 250, 20, 2, 4);
    console.log(`Loading ${displayLimit} items per section...`);

    // 2. Lấy danh sách các container cần load data
    const containers = document.querySelectorAll('.list_sp[data-type]');

    // 3. Duyệt qua từng section và gọi API tương ứng
    const promises = Array.from(containers).map(async (container) => {
        const type = container.dataset.type;
        const cateId = container.dataset.id;
        let apiUrl = '';

        // Xây dựng URL
        if (type === 'hot') {
            apiUrl = `${BOOKS_API_URL}?sortBy=SoLuongDaBan&order=DESC&limit=${apiLimit}`;
        } else if (type === 'new') {
            apiUrl = `${BOOKS_API_URL}?sortBy=NamXuatBan&order=DESC&limit=${apiLimit}`;
        } else if (type === 'category' && cateId) {
            apiUrl = `${BOOKS_API_URL}?sortBy=MaSach&order=DESC&matheloai=${cateId}&limit=${apiLimit}`;
        }

        if (apiUrl) {
            try {
                const response = await fetch(apiUrl);
                if (response.ok) {
                    const data = await response.json();
                    const bookList = Array.isArray(data) ? data : (data.data || []);
                    
                    if (bookList.length > 0) {
                        // --- LOGIC QUAN TRỌNG: ẨN NGAY KHI TẠO HTML ---
                        const html = bookList.map((book, index) => {
                            let itemHTML = createProductHTML(book);
                            
                            // Nếu vị trí item vượt quá giới hạn hiển thị hiện tại -> Thêm style ẩn
                            if (index >= displayLimit) {
                                // Chèn style="display: none" vào thẻ div đầu tiên
                                itemHTML = itemHTML.replace('class="item_sp"', 'class="item_sp" style="display: none"');
                            }
                            return itemHTML;
                        }).join('');

                        container.innerHTML = html;
                    } else {
                        container.innerHTML = '<p style="text-align:center; width:100%">Đang cập nhật...</p>';
                    }
                }
            } catch (error) {
                console.error(`Lỗi tải section ${type}:`, error);
                container.innerHTML = '<p style="text-align:center; color:red">Lỗi kết nối.</p>';
            }
        }
    });

    // Đợi tất cả hoàn tất
    await Promise.all(promises);
}

// Gọi khi tải trang và khi resize màn hình
document.addEventListener('DOMContentLoaded', () => {
    initFlashSaleSystem();
    loadHomeSections();
});
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateProductDisplayLimit, 200); // Debounce để tránh giật
});