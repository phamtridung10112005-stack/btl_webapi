const BOOK_DETAIL_API = `${BASE_API_URL}sachs/details`;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Lấy ID từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');

    if (!bookId) {
        alert("Không tìm thấy sản phẩm!");
        window.location.href = '../Trangchu/index.html'; // Quay về trang chủ nếu không có ID
        return;
    }

    // 2. Gọi API lấy dữ liệu chi tiết
    await loadBookDetail(bookId);

    // 3. Khởi tạo các sự kiện (Zoom, Thumbnail click, Tăng giảm số lượng...)
    // Lưu ý: Các hàm này cần chạy SAU khi HTML đã được render xong
    initProductEvents();
    console.log('load ok');
});
function formatCurrency(number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
}
async function loadBookDetail(id) {
    try {
        const response = await fetch(`${BOOK_DETAIL_API}/${id}`);
        if (!response.ok) throw new Error('Lỗi tải dữ liệu sản phẩm');

        const data = await response.json();
        console.log('detail sach: ', data);
        // Kiểm tra cấu trúc dữ liệu trả về (nếu API trả về { data: ... } thì lấy data.data)
        const book = data.data || data; 

        renderBookInfo(book);
        renderBookImages(book);

        let authorIdToFind = book.MaTacGia;
        if (book.AuthorIds && book.AuthorIds.length > 0) {
            authorIdToFind = book.AuthorIds[0]; // Lấy tác giả đầu tiên
        }

        if (authorIdToFind) {
            loadRelatedBooks(authorIdToFind, book.MaSach);
        }

    } catch (error) {
        console.error(error);
        document.querySelector('.product_single').innerHTML = `<p style="text-align:center; padding:50px; font-size:18px;">Lỗi: ${error.message}</p>`;
    }
}

function renderBookInfo(book) {
    // Tính toán giá
    const giaGoc = Number(book.GiaSach);
    const phanTramGiam = book.PhanTramGiam || 0;
    const giaBan = giaGoc * (1 - phanTramGiam / 100);
    const tietKiem = giaGoc - giaBan;

    // --- Cập nhật Tiêu đề trang (Title tag) ---
    document.title = book.TenSach;

    // --- Đổ dữ liệu vào HTML ---
    const breadcrumbLink = document.querySelector('.source span:nth-child(2) a');
    if (breadcrumbLink) {
        breadcrumbLink.textContent = book.TenSach;
        // Nếu muốn khi click vào nó sẽ reload lại trang hiện tại (tùy chọn)
        breadcrumbLink.href = window.location.href; 
    }
    // 1. Tên sách
    document.querySelector('.product_title .title h3').textContent = book.TenSach;

    // 2. Giá bán
    document.querySelector('.price_sale').textContent = formatCurrency(giaBan);
    document.querySelector('.price').textContent = formatCurrency(giaGoc);
    
    // 3. Note tiết kiệm (Ẩn nếu không giảm giá)
    const noteElement = document.querySelector('.note');
    if (phanTramGiam > 0) {
        noteElement.textContent = `(Bạn đã tiết kiệm được ${formatCurrency(tietKiem)})`;
        noteElement.style.display = 'inline';
    } else {
        noteElement.style.display = 'none';
        document.querySelector('.price').style.display = 'none'; // Ẩn giá gốc nếu không giảm
    }

    // 4. Số lượng đã bán (Giả lập hoặc lấy từ DB)
    const soldCount = book.SoLuongDaBan || 0;
    document.querySelector('.sold').textContent = `Đã bán: ${formatSold(soldCount)}`;

    // 5. Thông tin chi tiết (Mã sách, Tác giả,...)
    // Lưu ý: Cần kiểm tra class HTML của bạn có khớp không
    const infoProductContainer = document.querySelector('.information_container');
    if (infoProductContainer) {
        infoProductContainer.dataset.id = book.MaSach;
    }
    const infoList = document.querySelector('.product_infor_item_left ul');
    if (infoList) {
        let authorsHtml = '';
        if (book.TenTacGia) {
            authorsHtml = book.TenTacGia.split(',')
            .map(name => `<a href="#">${name.trim()}</a>`)
            .join('');
        }
        infoList.innerHTML = `
            <li><div class="field_lable">Mã sách: </div><div class="field_items"> ${book.MaSach}</div></li>
            <li>Tác giả: 
                <div class="author">
                    ${authorsHtml ? authorsHtml : `<a href="#">Đang cập nhật</a>`}
                </div>
            </li>
            ${book.TenNguoiDich ? `<li>Người dịch: ${book.TenNguoiDich}</li>` : ''}
            <li>Số trang: ${book.SoTrang || 'Đang cập nhật'} trang</li>
        `;
        if (window.highlightHeartIcons) {
            highlightHeartIcons();
        }
    }
    const motaBook = document.querySelector('.description');
    motaBook.innerHTML = `<p>${book.MoTaNoiDung ? book.MoTaNoiDung : 'Đang cập nhật'}</p>`;
}

function renderBookImages(book) {
    // 1. Xử lý dữ liệu ảnh đầu vào
    let images = [];
    
    if (book.LinkHinhAnh) {
        // Tách chuỗi bằng dấu phẩy, sau đó xóa khoảng trắng thừa ở 2 đầu (trim)
        // Ví dụ: "a.jpg, b.png" -> ["a.jpg", "b.png"]
        images = book.LinkHinhAnh.split(',').map(img => img.trim()).filter(img => img !== "");
    }

    // Nếu không có ảnh nào, dùng ảnh mặc định
    if (images.length === 0) {
        images = ['no-image.png'];
    }

    // 2. Render Slider ảnh lớn (Horizontal)
    const imageList = document.querySelector('.image_list');
    if (imageList) {
        // Tạo HTML cho từng ảnh trong mảng
        const imagesHtml = images.map(img => {
            return `
                <div class="image_item">
                    <a href="#"><img class="image" src="../Image/${img}" alt="${book.TenSach}" onerror="this.src='../Image/no-image.png'"></a>
                </div>
            `;
        }).join('');

        // Cộng thêm nhãn giảm giá (chỉ hiện 1 lần)
        const saleHtml = book.PhanTramGiam > 0 ? `<div class="on_sale">-${book.PhanTramGiam}%</div>` : '';

        // Gán vào DOM
        imageList.innerHTML = imagesHtml + saleHtml;
    }

    // 3. Render Thumbnail (Vertical)
    const thumbList = document.querySelector('.image_thumbnail_list');
    if (thumbList) {
        // Tạo HTML cho từng thumbnail, lưu ý data-volume tăng dần theo index (0, 1, 2...)
        const thumbsHtml = images.map((img, index) => {
            return `
                <li data-volume="${index}" class="image_thumbnail_item">
                    <a href="#" class="product_single_thumbnail">
                        <img src="../Image/${img}" alt="${book.TenSach}" onerror="this.src='../Image/no-image.png'">
                    </a>
                </li>
            `;
        }).join('');

        thumbList.innerHTML = thumbsHtml;
    }
}

// --- HÀM TẢI SÁCH CÙNG TÁC GIẢ (THEO MaTacGia) ---
async function loadRelatedBooks(authorId, currentBookId) {
    if (!authorId) return;

    try {
        // Gọi API lấy danh sách tất cả sách (hoặc API lọc nếu Backend hỗ trợ)
        // URL này dựa trên biến BASE_API_URL có sẵn trong base.js
        const response = await fetch(`${BASE_API_URL}sachs/details`);
        
        if (!response.ok) return;

        const data = await response.json();
        const allBooks = Array.isArray(data) ? data : (data.data || []);

        // Lọc sách:
        // 1. Có MaTacGia trùng với tác giả hiện tại
        // 2. Không phải cuốn sách đang xem (MaSach != currentBookId)
        const relatedBooks = allBooks.filter(book => {
            // Xử lý trường hợp API trả về mảng AuthorIds hoặc 1 giá trị MaTacGia
            const bookAuthorId = (book.MaTacGia && book.MaTacGia.length > 0) 
                                 ? book.MaTacGia[0] 
                                 : book.MaTacGia;
            // console.log(bookAuthorId);
            return bookAuthorId == authorId && book.MaSach != currentBookId;
        });
        // Chỉ hiển thị tối đa 5 cuốn
        // console.log();
        renderRelatedBooks(relatedBooks.slice(0, 5));
        if (relatedBooks.length <= 5)
            document.querySelector('.btn_see_more').style.display = 'none';
        else
            document.querySelector('.btn_see_more').style.display = 'display';

    } catch (error) {
        console.error("Lỗi tải sách cùng tác giả:", error);
    }
}

// --- HÀM RENDER HTML SÁCH LIÊN QUAN ---
function renderRelatedBooks(books) {
    const listContainer = document.querySelector('.relate_products_list');
    if (!listContainer) return;

    if (books.length === 0) {
        listContainer.innerHTML = '<p style="padding: 10px; color: #22a7ff; font-style: italic;">Chưa có sách liên quan.</p>';
        return;
    }

    const html = books.map(book => {
        const giaGoc = Number(book.GiaSach);
        const phanTramGiam = book.PhanTramGiam || 0;
        const giaBan = giaGoc * (1 - phanTramGiam / 100);
        
        const imgUrl = book.LinkHinhAnh ? `../Image/${book.LinkHinhAnh}` : '../Image/no-image.png';
        const detailLink = `../ChitietSP/chitiet_sp.html?id=${book.MaSach}`;

        return `
            <li class="relate_product_item">
                <div class="relate_product_item_left">
                    <div class="relate_product_item_img">
                        <a href="${detailLink}">
                            <img src="${imgUrl}" alt="${book.TenSach}" onerror="this.src='../Image/no-image.png'">
                        </a>
                    </div>
                </div>
                <div class="relate_product_item_right">
                    <div class="relate_product_item_title">
                        <a href="${detailLink}">${book.TenSach}</a>
                    </div>
                    <div class="relate_product_item_prices">
                        <span class="relate_product_item_sale_price">${formatCurrency(giaBan)}</span>
                        ${phanTramGiam > 0 ? `<span class="relate_product_item_original_price"><s>${formatCurrency(giaGoc)}</s></span>` : ''}
                    </div>
                </div>
            </li>
        `;
    }).join('');

    listContainer.innerHTML = html;
}

function initProductEvents() {
    // --- 1. Tăng giảm số lượng ---
    const up_amount = document.querySelector('.up_amount');
    const down_amount = document.querySelector('.down_amount');
    const amountSP = document.querySelector('.amount_sp');

    if (up_amount && down_amount && amountSP) {
        // Reset giá trị ban đầu
        amountSP.value = 1;

        // Xóa event cũ (nếu có) bằng cách clone node hoặc gán onclick trực tiếp
        up_amount.onclick = () => {
            let val = parseInt(amountSP.value) || 1;
            if (val < 100) amountSP.value = val + 1;
        };

        down_amount.onclick = () => {
            let val = parseInt(amountSP.value) || 1;
            if (val > 1) amountSP.value = val - 1;
        };

        amountSP.addEventListener('input', () => {
            let val = parseInt(amountSP.value) || 0;
            if (val > 99) amountSP.value = 99;
            else if (val < 1) amountSP.value = 1;
        });
    }

    // --- 2. Zoom ảnh ---
    let images = document.querySelectorAll('.image');
    let imageZoom = document.getElementById('ZoomImage'); // Đảm bảo HTML có thẻ này
    
    if (imageZoom) {
        images.forEach((item) => {
            item.addEventListener('mousemove', (ev) => {
                const ImageUrl = item.getAttribute('src');
                imageZoom.style.backgroundImage = `url('${ImageUrl}')`;
                imageZoom.style.setProperty('--display', 'block');
                let pointer = {
                    x: (ev.offsetX * 100) / item.offsetWidth,
                    y: (ev.offsetY * 100) / item.offsetHeight
                }
                imageZoom.style.setProperty('--zoom-x', pointer.x + '%');
                imageZoom.style.setProperty('--zoom-y', pointer.y + '%');
            });
            item.addEventListener('mouseout', () => {
                imageZoom.style.setProperty('--display', 'none');
            });
        });
    }

    // --- 3. Chọn ảnh Thumbnail ---
    let image_thumbnail_items = document.querySelectorAll('.image_thumbnail_item');
    const imageList = document.querySelector('.image_list');
    
    if (imageList) {
        image_thumbnail_items.forEach((item) => {
            item.addEventListener('click', (e) => {
                e.preventDefault(); // Ngăn thẻ a href="#" nhảy trang
                let index = item.dataset.volume;
                // Giả sử mỗi ảnh rộng 380px (theo code cũ của bạn)
                // Cần kiểm tra lại width thực tế trong CSS
                const imgWidth = document.querySelector('.image_item').offsetWidth || 380; 
                imageList.style.transform = `translateX(${-index * imgWidth}px)`;
            });
        });
    }

    // --- 4. Các nút chức năng khác (Share, Mô tả/Bình luận...) ---
    // Giữ nguyên logic cũ của bạn, chỉ cần đảm bảo selector đúng
    initTabEvents();
    initShareEvent();
}

function initTabEvents() {
    const btn_description = document.querySelector('.btn_description');
    const btn_comment = document.querySelector('.btn_comment');
    const description_content = document.querySelector('.description');
    const comment_content = document.querySelector('.comment');

    if (btn_description && btn_comment) {
        btn_description.onclick = () => {
            description_content.style.display = 'block';
            btn_description.style.background = '#22a7ff';
            comment_content.style.display = 'none';
            btn_comment.style.background = '#65c2ff';
        };
        btn_comment.onclick = () => {
            description_content.style.display = 'none';
            btn_description.style.background = '#65c2ff';
            comment_content.style.display = 'block';
            btn_comment.style.background = '#22a7ff';
        };
    }
}

function initShareEvent() {
    const btn_share = document.querySelector('.btn_share');
    const message = document.getElementById('message');

    if (btn_share && message) {
        btn_share.onclick = () => {
            if (!canClick) return;
            
            canClick = false; // Khóa nút
            const urlPage = window.location.href;

            navigator.clipboard.writeText(urlPage)
                .then(() => {
                    // 1. Reset thông số trước khi hiện
                    timeAutoHide = 5;
                    message.style.opacity = '1'; 
                    message.style.transform = `translateY(${100 + window.scrollY}px)`;
                    
                    // console.log('Hiện thông báo tại:', 100 + window.scrollY);

                    AutoHide(message);
                })
                .catch(err => {
                    console.error('Copy thất bại: ', err);
                    canClick = true; // Mở khóa nếu lỗi
                });
        };
    }
}
///////them/xoa class active
const content_review_body_name = document.querySelectorAll('.content_review_body_name');
content_review_body_name.forEach((item) => {
    item.addEventListener('click', () => {
        content_review_body_name.forEach((i) => i.classList.remove('content_review--active'));
        item.classList.add('content_review--active');
    })
})
//////////////////////////////////////////////////////
//////btn up/down
let index_down = 1
function BtnDown() {
    const image = document.querySelectorAll('.image_thumbnail_item');
    const image_list = document.querySelector('.image_thumbnail_list');
    if (index_down < image.length) {
        let y = index_down * 68;
        image_list.style.transform = `translateY(${-y}px)`;
        index_down++;
        index_up--;
        // console.log(`${y}\n${index_down}\n${index_up}`);
    }
}
let index_up = 1
function BtnUp(){
    const image_list = document.querySelector('.image_thumbnail_list');
    if (index_up < 1){
        let y = index_up * 68;
        image_list.style.transform = `translateY(${y}px)`;
        index_up++;
        index_down--;
        // console.log(`${y}\n${index_down}\n${index_up}`);
    }
}
/////////////////////////////////
// /////////chon sp
// let image_thumbnail_items = document.querySelectorAll('.image_thumbnail_item');
// const imageItems = document.querySelectorAll('.image_item');
// const imageList = document.querySelector('.image_list')
// image_thumbnail_items.forEach((item) => {
//     item.addEventListener('click', () => {
//         let index = item.dataset.volume;
//         // console.log(index);
//         imageList.style.transform = `translateX(${-index * 380}px)`;
//     });
// });
// //////////////////////////