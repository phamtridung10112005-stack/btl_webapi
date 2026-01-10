function formatCurrency(number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
}
function formatSold(n) {
  const num = Number(n) || 0;

  if (num < 1000) return num.toString();

  return Math.floor(num / 1000) + "k+";
}
// ==============================================================
//                  LOGIC FLASH SALE SYSTEM
// ==============================================================

// 1. CẤU HÌNH THỜI GIAN KẾT THÚC SALE
// Định dạng: Năm-Tháng-Ngày Giờ:Phút:Giây (ISO format)
const CodeSale = "SALE10";
let SALE_END_TIMESTAMP = '';
(async () => {
    SALE_END_TIMESTAMP = await getNgayKetThucGiamGia(CodeSale);
})();
console.log('Time', SALE_END_TIMESTAMP)
async function getNgayKetThucGiamGia(code) {
    const response = await fetch(`http://localhost:3000/api/giamgias/${code}`);
    if (!response.ok) return;
    const rawData = await response.json();
    const isoDate = rawData.NgayKetThuc;

    // Chuyển sang timestamp (ms) – chuẩn toàn cầu
    const endTimestamp = new Date(isoDate).getTime();
    return endTimestamp;
}

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

        console.log(`${days}\t${hours}\t${minutes}\t${seconds}`)
    }
    const interval = setInterval(UpdateTime, 1000);
    UpdateTime();
}

// 2. KHỞI CHẠY ĐỒNG HỒ ĐẾM NGƯỢC (Sử dụng hàm CountDown cũ của bạn)
if (typeof CountDown === 'function') {
    CountDown(SALE_END_TIMESTAMP);
}

// 3. HÀM TẢI DỮ LIỆU FLASH SALE
async function loadFlashSaleItems() {
    const container = document.querySelector('.flash_sale_list_track');
    const marqueeContainer = document.querySelector('.flash_sale_header_mid marquee');
    if (!container) return;

    try {
        // Gọi API lấy tất cả sách (hoặc API chuyên biệt cho Flash Sale nếu có)
        // Lấy nhiều một chút để lọc ra
        const apiUrl = `${BOOKS_API_URL}?limit=50`; 
        
        const response = await fetch(apiUrl);
        if (!response.ok) return;

        const rawData = await response.json();
        const allBooks = Array.isArray(rawData) ? rawData : (rawData.data || []);

        // --- LỌC SẢN PHẨM SALE (LOGIC MỚI) ---
        const saleBooks = allBooks.filter(item => {
            const discount = item.PhanTramGiam || 0;
            
            // Điều kiện 1: Phải có giảm giá
            if (discount <= 0) return false;

            // Điều kiện 2: Kiểm tra ngày kết thúc có TRÙNG với ngày cài đặt không
            if (item.NgayKetThuc) {
                const itemDate = new Date(item.NgayKetThuc);
                const targetDate = new Date(SALE_END_DATE_STRING); // Ngày cố định: 2026-01-31

                // So sánh Năm, Tháng, Ngày (Bỏ qua giờ phút giây để chính xác hơn)
                const isSameYear = itemDate.getFullYear() === targetDate.getFullYear();
                const isSameMonth = itemDate.getMonth() === targetDate.getMonth();
                const isSameDay = itemDate.getDate() === targetDate.getDate();

                // Chỉ lấy những sản phẩm có cùng ngày/tháng/năm với ngày Sale
                return isSameYear && isSameMonth && isSameDay;
            }

            // Nếu sản phẩm không có ngày kết thúc thì loại bỏ (vì không thuộc đợt sale này)
            return false; 
        });

        // Nếu không có sản phẩm nào sale
        if (saleBooks.length === 0) {
            document.querySelector('.flash_sale_container').style.display = 'none';
            return;
        }

        // --- RENDER HTML ---
        // Chỉ lấy tối đa 10-15 sản phẩm cho Flash Sale
        const displayBooks = saleBooks.slice(0, 15);
        
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
                            Đã bán ${item.SoLuongDaBan || 0}
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

        if (marqueeContainer) {
            // Tạo chuỗi HTML các thẻ <a>
            const marqueeHtml = saleBooks.map(item => {
                const detailLink = `../ChitietSP/chitiet_sp.html?id=${item.MaSach}`;
                // Thêm style margin-right để các chữ không dính vào nhau
                return `<a href="${detailLink}">+ ${item.TenSach} - Giảm ${item.PhanTramGiam}%</a>`;
            }).join('');

            marqueeContainer.innerHTML = marqueeHtml;
        }

        // --- 4. KHỞI TẠO SLIDER SAU KHI RENDER XONG ---
        initFlashSaleSlider();

    } catch (error) {
        console.error("Lỗi tải Flash Sale:", error);
    }
}

// 4. LOGIC SLIDER (Được gọi sau khi có dữ liệu)
function initFlashSaleSlider() {
    const track = document.querySelector('.flash_sale_list_track');
    const items = document.querySelectorAll('.flash_sale_item');
    const nextBtn = document.querySelector('.flash_sale_body .next-btn');
    const preBtn = document.querySelector('.flash_sale_body .pre-btn');

    // Kiểm tra nếu không đủ phần tử thì dừng
    if (!track || items.length === 0 || !nextBtn || !preBtn) return;

    let currentIndex = 0;

    // --- HÀM TÍNH TOÁN KÍCH THƯỚC CHUẨN ---
    function getSlideMetrics() {
        const containerWidth = document.querySelector('.flash_sale_list').offsetWidth;
        
        // Lấy style thực tế của trình duyệt đang render
        const itemStyle = window.getComputedStyle(items[0]);
        
        // 1. Chiều rộng nội tại của thẻ div (bao gồm padding, border)
        const itemWidth = items[0].offsetWidth;
        
        // 2. Lấy margin trái và phải (CSS của bạn là 15px mỗi bên)
        const marginLeft = parseFloat(itemStyle.marginLeft) || 0;
        const marginRight = parseFloat(itemStyle.marginRight) || 0;
        
        // 3. TỔNG CHIỀU RỘNG 1 ITEM CHIẾM DỤNG
        // (Đây là con số quan trọng để dịch chuyển chính xác)
        const itemFullWidth = itemWidth + marginLeft + marginRight;

        // 4. Tính xem 1 khung hình hiện được bao nhiêu item trọn vẹn
        let itemsPerView = Math.floor(containerWidth / itemFullWidth);
        
        // Đảm bảo ít nhất là 1
        if (itemsPerView < 1) itemsPerView = 1;

        return {
            itemFullWidth,
            itemsPerView,
            totalItems: items.length
        };
    }

    // --- HÀM CẬP NHẬT VỊ TRÍ ---
    function updatePosition() {
        const { itemFullWidth, itemsPerView, totalItems } = getSlideMetrics();
        
        // Giới hạn index không chạy quá đà ra vùng trắng
        // Max Index = Tổng số - Số lượng đang hiện
        const maxIndex = Math.max(0, totalItems - itemsPerView);
        
        if (currentIndex > maxIndex) currentIndex = maxIndex;
        if (currentIndex < 0) currentIndex = 0;

        // Dịch chuyển = Index * Tổng chiều rộng (bao gồm margin)
        const translateValue = currentIndex * itemFullWidth;
        
        track.style.transform = `translateX(-${translateValue}px)`;
        // CSS bạn đã có transition, nhưng set thêm ở đây để đảm bảo logic JS
        track.style.transition = 'transform 0.5s ease-in-out';
    }

    // --- SỰ KIỆN CLICK NEXT ---
    nextBtn.onclick = () => {
        const { itemsPerView, totalItems } = getSlideMetrics();
        const maxIndex = Math.max(0, totalItems - itemsPerView);
        
        if (currentIndex < maxIndex) {
            currentIndex++;
            updatePosition();
        }
    };

    // --- SỰ KIỆN CLICK PREV ---
    preBtn.onclick = () => {
        if (currentIndex > 0) {
            currentIndex--;
            updatePosition();
        }
    };

    // --- RESPONSIVE: TÍNH LẠI KHI KÉO MÀN HÌNH ---
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updatePosition, 100);
    });
    
    // Gọi lần đầu để set vị trí đúng
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
    loadFlashSaleItems();
    loadHomeSections();
});
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateProductDisplayLimit, 200); // Debounce để tránh giật
});