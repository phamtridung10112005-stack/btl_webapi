const BASE_API_URL = 'http://localhost:3000/api/';
const SACHYEUTHICH_BY_USERID_API_URL = `${BASE_API_URL}sachyeuthichs/user/`;
const CREATE_SACHYEUTHICH_API_URL = `${BASE_API_URL}sachyeuthichs`;
const DELETE_SACHYEUTHICH_API_URL = `${BASE_API_URL}sachyeuthichs`;

let userBooksWishList = new Set();

////////////////Login/Logout
// --- 1. Hàm tiện ích: Giải mã Token JWT ---
// Giúp đọc thông tin bên trong token để biết thời gian hết hạn (exp)
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}
// --- 2. Hàm Logout (Được gọi khi bấm nút Đăng xuất) ---
function logout() {
    // Xóa sạch dữ liệu đăng nhập
    localStorage.removeItem('isLogIn');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('loggedInUser');
    localStorage.clear();

    // Tải lại trang để giao diện cập nhật về trạng thái khách
    window.location.reload();
}

// --- 3. Xử lý chính khi trang Web tải xong ---
document.addEventListener('DOMContentLoaded', async () => {
    
    await initWishListSystem();
    checkUserLoginStatus();

    // Xử lý link # (Giữ nguyên code cũ của bạn)
    document.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', (ev) => {
            const href = link.getAttribute('href');
            if (href === '#' || href === '') {
                ev.preventDefault();
            }
        });
    });

    // Xử lý sự kiện thêm/xóa sách yêu thích (Wishlist)
    document.addEventListener('click', (ev) => {
        // console.log(ev.target);
        if (ev.target.tagName === 'I' && ev.target.closest('.wishlist')) {
            const item = ev.target.closest('[data-id]');
            // console.log(item);
            if (item && item.dataset.id) {
                addToWishList(item);
            }
        }
    });
});
function checkUserLoginStatus() {
    // Xử lý Ẩn/Hiện nút Đăng nhập - Đăng ký - Đăng xuất
    const btnLogin = document.getElementById('btn_dangnhap');
    const btnRegister = document.getElementById('btn_dangky');
    const btnLogout = document.getElementById('btn_dangxuat');

    const token = localStorage.getItem('accessToken');
    let isValidSession = false;

    // Kiểm tra Token
    if (token) {
        const decoded = parseJwt(token);
        const currentTime = Date.now() / 1000; // Thời gian hiện tại tính bằng giây

        if (decoded && decoded.exp > currentTime) {
            // Token còn hạn -> Phiên đăng nhập hợp lệ
            isValidSession = true;
        } else {
            // Token hết hạn -> Tự động xóa rác
            console.log("Phiên đăng nhập hết hạn");
            logout();
            return;
        }
    }

    // console.log('isValidSession:', isValidSession);
    // Cập nhật giao diện dựa trên kết quả kiểm tra
    if (isValidSession) {
        // --- TRẠNG THÁI: ĐÃ ĐĂNG NHẬP ---
        if(btnLogin) btnLogin.style.display = 'none';
        if(btnRegister) btnRegister.style.display = 'none';
        if(btnLogout) btnLogout.style.display = 'block'; // Hoặc 'inline-block' tùy CSS của bạn
    } else {
        // --- TRẠNG THÁI: KHÁCH (CHƯA ĐĂNG NHẬP) ---
        if(btnLogin) btnLogin.style.display = 'block';
        if(btnRegister) btnRegister.style.display = 'block';
        if(btnLogout) btnLogout.style.display = 'none';
    }
}
function getLoggedInUserId() {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    const decoded = parseJwt(token);
    return decoded ? decoded.id : null;
}
/////////////////////Wish list system//////////////////////////////
async function initWishListSystem() {
    const token = localStorage.getItem('accessToken');
    const user_id = getLoggedInUserId();
    // console.log('User ID for Wishlist:', user_id);
    if (!token || !user_id) {
        updateWishListBadge(0);
        console.log('No valid token or user ID for Wishlist');
        return;
    }
    // console.log(`${SACHYEUTHICH_BY_USERID_API_URL}${user_id}`);
    try {
        const response = await fetch(SACHYEUTHICH_BY_USERID_API_URL + user_id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const booksLikedList = await response.json();
            // console.log('Wishlist tải về:', booksLikedList);
            userBooksWishList = new Set(booksLikedList);
            updateWishListBadge(userBooksWishList.size);
            highlightHeartIcons();
        } else {
            console.error('Lỗi tải Wishlist', response.statusText);
            updateWishListBadge(0);
        }
    } catch (error) {
        console.error('Lỗi kết nối tới server:', error);
        updateWishListBadge(0);
    }
}
function updateWishListBadge(count) {
    let styleWishlistIcon = document.querySelector('style[data-wishlist-icon]');
    if (count === 0) {
        if (styleWishlistIcon) {
            styleWishlistIcon.remove();
        }
        return;
    }
    if (!styleWishlistIcon) {
        styleWishlistIcon = document.createElement('style');
        styleWishlistIcon.setAttribute('data-wishlist-icon', 'true');
        document.head.appendChild(styleWishlistIcon)
    }
    styleWishlistIcon.textContent = `
        .sp_uathich::before {
            content: '${count}';
            font-size: 18px;
            text-align: center;
            font-weight: bold;
            position: absolute;
            top: -10px;
            right: -5px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: #ff2732;
            color: #fff;
        }
    `;
}
window.highlightHeartIcons = function() {
    const heartButtons = document.querySelectorAll('.wishlist');
    heartButtons.forEach(btnWL => {
        const container = btnWL.closest('[data-id]') || btnWL;
        const bookId = parseInt(container.dataset.id);
        const icon = btnWL.querySelector('i');
        if (icon) {
            if (userBooksWishList.has(bookId)) {
                btnWL.classList.add('active');
            } else {
                btnWL.classList.remove('active');
            }
        }
    });
}
async function addToWishList(item) {
    const token = localStorage.getItem('accessToken');
    const user_id = getLoggedInUserId();
    if (!token || !user_id) {
        if (confirm("Bạn cần đăng nhập để sử dụng chức năng này. Đăng nhập ngay?")) {
            window.location.href = '../Login/dangnhap.html';
        }
        return;
    }
    const bookId = parseInt(item.dataset.id);
    if (!bookId) {
        console.log('Không tìm thấy mã sách để thêm vào Wishlist');
        return;
    }
    const isLiked = userBooksWishList.has(bookId);
    toggleHeartIcon(bookId, !isLiked);
    try {
        let response;
        if (isLiked) {
            // Gỡ bỏ khỏi Wishlist
            const url = new URL(DELETE_SACHYEUTHICH_API_URL);
            url.searchParams.append('user_id', user_id);
            url.searchParams.append('masach', bookId);
            response = await fetch(url.toString(), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
        } else {
            // Thêm vào Wishlist
            response = await fetch(CREATE_SACHYEUTHICH_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ User_ID: user_id, MaSach: bookId })
            });
        }
        if (response.ok) {
            if (isLiked) {
                userBooksWishList.delete(bookId);
            } else {
                userBooksWishList.add(bookId);
            }
            updateWishListBadge(userBooksWishList.size);
        } else {
            console.error('Lỗi cập nhật Wishlist:', response.statusText);
            toggleHeartIcon(bookId, isLiked); // Revert UI change
            alert('Cập nhật Wishlist thất bại. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Lỗi kết nối tới server:', error);
        toggleHeartIcon(bookId, isLiked);
    }
}
function toggleHeartIcon(bookId, isActive) {
    const heartButtons = document.querySelectorAll('.wishlist');
    heartButtons.forEach(btnWL => {
        const container = btnWL.closest('[data-id]') || btnWL;
        const id = parseInt(container.dataset.id);
        const icon = btnWL.querySelector('i');
        if (icon && id === bookId) {
            if (isActive) {
                btnWL.classList.add('active');
            } else {
                btnWL.classList.remove('active');
            }
        }
    });
}

//////button back head
const posision_scrollTop_btn = 750;
const scroll_btn = document.getElementById('scroll_btn');
window.addEventListener('scroll', () => {
    if (window.scrollY > posision_scrollTop_btn) {
        scroll_btn.style.display = 'block';
    }
    else {
        scroll_btn.style.display = 'none';
    }
});
//////Them vao gio hang message
let timeAutoHide = 5;
let canClick = true;
function AutoHide(item){
    // console.log('auto hide');
    // console.log(window.scrollY);
    if (timeAutoHide === 0){
        canClick = true;
        timeAutoHide = 5;
        item.style.transform = `translateY(${-100 - window.scrollY}px)`;
        return;
    }
    else{
        timeAutoHide--;
        item.style.opacity = timeAutoHide * 0.2;
        setTimeout(() => AutoHide(item), 1000);
        // console.log(timeAutoHide);
    }
}
const listbtn_addToCart = document.querySelectorAll('.fa-cart-plus');
// if (listbtn_addToCart) {
//     console.log('true');
// }
const addToCart_message = document.getElementById('addToCart_message');
// if (addToCart_message) {
//     console.log('true');
// }
listbtn_addToCart.forEach((btn_addToCart) => {
    btn_addToCart.addEventListener('click', () => {
        console.log(canClick);
        if (!canClick){
            return;
        }
        canClick = false;
        timeAutoHide = 5;
        addToCart_message.style.transform = `translateY(${+100 + window.scrollY}px)`;
        AutoHide(addToCart_message);
    });
});
/////////////////////////////////