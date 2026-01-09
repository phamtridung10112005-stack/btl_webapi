const BASE_API_URL = 'http://localhost:3000/api/';
const SACHYEUTHICH_BY_USERID_API_URL = `${BASE_API_URL}sachyeuthichs/user/`;
const SACHYEUTHICH_API_URL = `${BASE_API_URL}sachyeuthichs`;
const GIOHANG_API_URL = `${BASE_API_URL}giohangs`;

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
    await initCartSystem();
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
    // Xử lý thêm giỏ hàng
    document.addEventListener('click', (ev) => {
        if (ev.target.tagName === 'I' && ev.target.closest('.allproduct_item_cart, .wishlist_item_cart')) {
            const item = ev.target.closest('[data-id]');
            console.log(item);
            if (item && item.dataset.id) {
                addToCart(item);
            }
        }
    })
});
function checkUserLoginStatus() {
    // Xử lý Ẩn/Hiện nút Đăng nhập - Đăng ký - Đăng xuất
    const btnLogin = document.getElementById('btn_dangnhap');
    const btnRegister = document.getElementById('btn_dangky');
    const btnLogout = document.getElementById('btn_dangxuat');
    const btnAdmin = document.getElementById('btn_admin');

    const token = localStorage.getItem('accessToken');
    let isValidSession = false;

    const decoded = parseJwt(token);
    // Kiểm tra Token
    if (token) {
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

    // Cập nhật giao diện dựa trên kết quả kiểm tra
    if (isValidSession) {
        // --- TRẠNG THÁI: ĐÃ ĐĂNG NHẬP ---
        if(btnLogin) btnLogin.style.display = 'none';
        if(btnRegister) btnRegister.style.display = 'none';
        if(btnLogout) btnLogout.style.display = 'block';
        if (decoded && decoded.role == 'ADMIN') {
            if (btnAdmin) btnAdmin.style.display = 'block';
            else btnAdmin.style.display = 'none';
        }
    } else {
        // --- TRẠNG THÁI: KHÁCH (CHƯA ĐĂNG NHẬP) ---
        if(btnLogin) btnLogin.style.display = 'block';
        if(btnRegister) btnRegister.style.display = 'block';
        if(btnLogout) btnLogout.style.display = 'none';
        if(btnAdmin) btnAdmin.style.display = 'none';
    }
}
window.getLoggedInUserId = function() {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    const decoded = parseJwt(token);
    return decoded ? decoded.id : null;
}
/////////////////////Cart system//////////////////////////
function updateCartListBadge(count) {
    let styleCartlistIcon = document.querySelector('style[data-cart-icon]');
    if (count === 0) {
        if (styleCartlistIcon) {
            styleCartlistIcon.remove();
        }
        return;
    }
    if (!styleCartlistIcon) {
        styleCartlistIcon = document.createElement('style');
        styleCartlistIcon.setAttribute('data-cart-icon', 'true');
        document.head.appendChild(styleCartlistIcon)
    }
    styleCartlistIcon.textContent = `
        .giohang::before {
            content: '${count}';
            font-size: 12px;
            text-align: center;
            line-height: 20px;
            font-weight: bold;
            font-family: Arial, Helvetica, sans-serif;
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
async function initCartSystem() {
    const token = localStorage.getItem('accessToken');
    const user_id = getLoggedInUserId();
    if (!token || !user_id) {
        updateCartListBadge(0);
        return;
    }
    try {
        const url = `${GIOHANG_API_URL}/user?user_id=${user_id}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const cartList = await response.json();
            console.log('Cart List: ', cartList);
            const countCartItems = Array.isArray(cartList) ? cartList.length : 0;
            updateCartListBadge(countCartItems);
        } else {
            console.error('Lỗi tải giỏ hàng', response.statusText);
            updateCartListBadge(0);
        }
    } catch (err) {
        console.error('Lỗi kết nối tới server (Cart):', error);
        updateCartListBadge(0);
    }
}
let timeAutoHide = 5;
let canClick = true;
const addToCart_message = document.getElementById('addToCart_message');

function AutoHide(item) {
    if (timeAutoHide <= 0) {
        canClick = true;
        timeAutoHide = 5;
        item.style.opacity = '0'; // Ẩn đi
        item.style.transform = `translateY(${-100 - window.scrollY}px)`;
        return;
    } else {
        timeAutoHide--;
        // Hiệu ứng mờ dần
        item.style.opacity = timeAutoHide * 0.2; 
        setTimeout(() => AutoHide(item), 1000);
    }
}

function showAddToCartSuccess() {
    if (!addToCart_message) return;
    
    // Reset trạng thái hiển thị
    addToCart_message.style.opacity = '1'; 
    addToCart_message.style.display = 'block'; // Đảm bảo nó hiển thị
    
    // Tính toán vị trí hiển thị (giống logic cũ của bạn)
    addToCart_message.style.transform = `translateY(${100 + window.scrollY}px)`;
    
    // Bắt đầu đếm ngược ẩn
    timeAutoHide = 5;
    if (canClick) {
        canClick = false;
        AutoHide(addToCart_message);
    }
}
async function addToCart(item) {
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
        console.log('Không tìm thấy mã sách để thêm vào gio hang');
        return;
    }
    try {
        const amountSP = document.querySelector('.amount_sp');
        let dataPost;
        
        if (amountSP) {
            dataPost = JSON.stringify({ User_ID: user_id, MaSach: bookId, SoLuong: Number(amountSP.value) })
        } else {
            dataPost = JSON.stringify({ User_ID: user_id, MaSach: bookId, SoLuong: 1 })
        }
        const response = await fetch(GIOHANG_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: dataPost
        });
        if (response.ok) {
            const data = await response.json();
            // console.log("Thêm giỏ hàng thành công: ", data);
            await initCartSystem();
            showAddToCartSuccess();
        } else {
            const errData = await response.json();
            console.log("Lỗi thêm giỏ hàng: ", errData);
            alert(errorData.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng.');
        }
    } catch (err) {
        console.error('Lỗi mạng hoặc server:', err);
        alert('Không thể kết nối đến máy chủ.');
    }
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
            console.log('Wishlist:', booksLikedList);
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
            font-size: 12px;
            text-align: center;
            line-height: 20px;
            font-weight: bold;
            font-family: Arial, Helvetica, sans-serif;
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
            const url = new URL(SACHYEUTHICH_API_URL);
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
            response = await fetch(SACHYEUTHICH_API_URL, {
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