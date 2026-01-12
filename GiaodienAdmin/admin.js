// ================================================================================
// ADMIN PANEL - BOOKSTORE MANAGEMENT SYSTEM
// ================================================================================

// ===== CẤU HÌNH API & BIẾN TOÀN CỤC =====
const API_BASE_URL = 'http://localhost:3000/api';
const IMAGE_PATH_BASE = '../GiaodienWEB/Image/';
let authToken = localStorage.getItem('authToken') || null;

// Biến lưu dữ liệu
let books = [];
let categories = [];
let publishers = [];
let authors = [];
let orders = [];
let customers = [];
let discounts = [];

// Biến phụ trợ
let currentEditId = null;
let revenueChart = null;
let manageAuthorIds = []; // Dùng cho Modal Quản lý Sách - Tác Giả
let currentManageBook = null;
let currentEditDetails = []; // Chi tiết đơn hàng khi sửa
let currentAddDetails = []; // Chi tiết đơn hàng khi tạo mới


// ================================================================================
// 1. CORE FUNCTIONS - HÀM CƠ BẢN
// ================================================================================

/**
 * Gọi API với xác thực token
 */
async function fetchWithAuth(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });
        
        if (response.status === 401 || response.status === 403) {
            window.handleLogout();
            throw new Error('Phiên đăng nhập hết hạn');
        }
        
        return response;
    } catch (error) {
        console.error("Auth API Error:", error);
        throw error;
    }
}

/**
 * Parse response từ API về mảng
 */
function parseRes(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.rows)) return data.rows;
    if (Array.isArray(data.content)) return data.content;
    return [];
}

/**
 * Format số tiền theo định dạng VND
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount || 0);
}


// ================================================================================
// 2. INIT & LOGIN - KHỞI TẠO & ĐĂNG NHẬP
// ================================================================================

/**
 * Khởi tạo khi trang load
 */
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        // Đã đăng nhập -> Hiển thị Dashboard
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('dashboard').style.display = 'flex';
        initData();
    } else {
        // Chưa đăng nhập -> Hiển thị Login
        document.getElementById('loginPage').style.display = 'flex';
        document.getElementById('dashboard').style.display = 'none';
    }

    // Xử lý form đăng nhập
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                const res = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await res.json();
                
                if (res.ok) {
                    localStorage.setItem('authToken', data.token || data.accessToken);
                    location.reload();
                } else {
                    alert(data.message || 'Đăng nhập thất bại!');
                }
            } catch (err) {
                alert('Lỗi kết nối Server!');
            }
        });
    }
});

/**
 * Tải toàn bộ dữ liệu ban đầu
 */
async function initData() {
    console.log("Đang tải dữ liệu...");
    try {
        await Promise.all([
            fetchCategories(), 
            fetchPublishers(), 
            fetchAuthors(), 
            fetchDiscounts()
        ]);
        
        await fetchBooks();
        await fetchCustomers();
        await fetchOrders();
        
        updateDashboardStats();
        renderBookAuthorsTable();
        
        console.log("Tải dữ liệu hoàn tất.");
    } catch(e) {
        console.error("Lỗi Init Data:", e);
    }
}


// ================================================================================
// 3. GLOBAL FUNCTIONS - HÀM TOÀN CỤC
// ================================================================================

/**
 * Đăng xuất hệ thống
 */
window.handleLogout = function() {
    localStorage.removeItem('authToken');
    location.reload();
};

/**
 * Chuyển trang trong dashboard
 */
window.switchPage = function(pageId, element) {
    // Xóa active khỏi tất cả menu
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    if (element) {
        element.classList.add('active');
    }

    // Ẩn tất cả sections
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    
    // Hiển thị section được chọn
    const target = document.getElementById(pageId + 'Page');
    if (target) {
        target.classList.add('active');
        
        // Refresh dữ liệu nếu cần
        if (pageId === 'bookAuthors') {
            renderBookAuthorsTable();
        }
        if (pageId === 'customers') {
            fetchCustomers();
        }
    }
};

/**
 * Đóng modal
 */
window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.classList.remove('active');
    }
};


// ================================================================================
// 4. QUẢN LÝ KHÁCH HÀNG (USER)
// ================================================================================

/**
 * Tải danh sách khách hàng
 */
async function fetchCustomers() {
    try {
        const res = await fetchWithAuth('/users');
        const all = parseRes(await res.json());
        
        // Hiển thị cả những user bị mất role (!u.role) để Admin thấy và sửa
        customers = all.filter(u => !u.role || u.role === 'USER' || u.role === 'LOCKED'); 

        const tbody = document.getElementById('customersTableBody');
        if (!tbody) return;

        tbody.innerHTML = customers.map(c => {
            const isLocked = c.role === 'LOCKED';
            let statusLabel = '';
            let lockBtn = '';

            if (isLocked) {
                statusLabel = '<span class="status-badge" style="background:#fee2e2; color:#ef4444; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:12px;"><i class="fas fa-ban"></i> Bị chặn</span>';
                lockBtn = `<button class="btn-sm btn-success" onclick="toggleBlockUser(${c.id})" title="Mở khóa"><i class="fas fa-unlock"></i></button>`;
            } else if (!c.role) {
                statusLabel = '<span class="status-badge" style="background:#f3f4f6; color:#6b7280; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:12px;">Chưa có Role</span>';
                lockBtn = `<button class="btn-sm btn-delete" onclick="toggleBlockUser(${c.id})" title="Chặn mua hàng"><i class="fas fa-lock"></i></button>`;
            } else {
                statusLabel = '<span class="status-badge" style="background:#dcfce7; color:#16a34a; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:12px;"><i class="fas fa-check-circle"></i> Hoạt động</span>';
                lockBtn = `<button class="btn-sm btn-delete" onclick="toggleBlockUser(${c.id})" title="Chặn mua hàng"><i class="fas fa-lock"></i></button>`;
            }

            return `
                <tr style="${isLocked ? 'background:#fff1f2' : ''}">
                    <td><strong>${c.username}</strong></td>
                    <td>${c.email}</td>
                    <td>${c.phone || '-'}</td>
                    <td>${statusLabel}</td>
                    <td class="text-center">
                        <button class="btn-sm btn-edit" onclick="editUser(${c.id})" title="Sửa thông tin"><i class="fas fa-edit"></i></button>
                        ${lockBtn}
                        <button class="btn-sm btn-info" onclick="viewCustomerHistory(${c.id}, '${c.username}')" title="Xem lịch sử"><i class="fas fa-history"></i></button>
                    </td>
                </tr>`;
        }).join('');
    } catch (e) { 
        console.error("Lỗi tải khách hàng:", e); 
    }
}

/**
 * Mở Modal Thêm User
 */
window.openAddUserModal = function() {
    currentEditId = null;
    document.getElementById('userForm').reset();
    document.getElementById('userModalTitle').innerText = "Thêm Khách Hàng Mới";
    
    // Mật khẩu bắt buộc khi thêm mới
    const passGroup = document.getElementById('passwordGroup');
    const passReq = document.getElementById('passRequired');
    const passNote = document.getElementById('passNote');
    
    if(passGroup) passGroup.style.display = 'block';
    if(passReq) passReq.style.display = 'inline';
    if(passNote) passNote.innerText = "";
    
    document.getElementById('userModal').classList.add('active');
};

/**
 * Mở Modal Sửa User
 */
window.editUser = function(userId) {
    currentEditId = userId;
    const user = customers.find(u => u.id == userId);
    if (!user) return alert("Không tìm thấy user!");

    document.getElementById('userModalTitle').innerText = "Cập Nhật Khách Hàng";
    document.getElementById('userId').value = user.id;
    document.getElementById('userName').value = user.username;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userPhone').value = user.phone || "";
    
    // Mật khẩu không bắt buộc khi sửa
    const passGroup = document.getElementById('passwordGroup');
    const passReq = document.getElementById('passRequired');
    const passNote = document.getElementById('passNote');

    if(passGroup) passGroup.style.display = 'block';
    if(passReq) passReq.style.display = 'none';
    if(passNote) passNote.innerText = "(Để trống nếu không muốn đổi mật khẩu)";
    document.getElementById('userPassword').value = "";

    document.getElementById('userModal').classList.add('active');
};

/**
 * Lưu User (Tạo/Sửa)
 */
window.saveUser = async function() {
    const id = currentEditId;
    const username = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const phone = document.getElementById('userPhone').value;
    const password = document.getElementById('userPassword').value;

    if (!username || !email) {
        return alert("Vui lòng nhập tên và email!");
    }

    // Thêm role: 'USER' vào payload để đảm bảo backend nhận được
    const payload = { 
        username, 
        email, 
        phone, 
        role: 'USER' 
    };

    try {
        let res;
        
        if (id) {
            // CẬP NHẬT (PUT)
            if(password) payload.password = password; 
            
            res = await fetchWithAuth(`/users/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        } else {
            // THÊM MỚI (POST)
            if (!password) {
                return alert("Vui lòng nhập mật khẩu cho tài khoản mới!");
            }
            payload.password = password;
            
            // Thử gọi API users chuẩn trước
            try {
                res = await fetchWithAuth(`/users`, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
            } catch (err) {
               // Fallback sang register nếu API /users chưa mở
               res = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
        }

        if (res.ok) {
            alert(id ? "Cập nhật thành công!" : "Thêm khách hàng thành công!");
            closeModal('userModal');
            fetchCustomers();
            updateDashboardStats();
        } else {
            const err = await res.json();
            alert("Lỗi: " + (err.message || "Thao tác thất bại"));
        }
    } catch (e) {
        alert("Lỗi kết nối: " + e.message);
    }
};

/**
 * Khóa / Mở khóa User (Block)
 */
window.toggleBlockUser = async function(userId) {
    const user = customers.find(c => c.id == userId);
    const isLocked = user && user.role === 'LOCKED';
    const action = isLocked ? "Mở KHÓA" : "CHẶN MUA HÀNG";
    
    if(!confirm(`Bạn có chắc muốn ${action} tài khoản ${user.username}?`)) {
        return;
    }

    try {
        const res = await fetchWithAuth(`/users/${userId}/block`, { 
            method: 'PUT' 
        });
        
        if(res.ok) {
            const data = await res.json();
            alert(data.message);
            fetchCustomers();
        } else {
            const err = await res.json();
            alert("Lỗi: " + (err.message || "Không thể thực hiện"));
        }
    } catch(e) { 
        alert("Lỗi kết nối server: " + e.message); 
    }
};

/**
 * Xem Lịch sử mua hàng
 */
window.viewCustomerHistory = async function(userId, username) {
    try {
        // Reset bảng trước khi tải
        const tbody = document.getElementById('historyTableBody');
        if(!tbody) {
            return alert("Chưa cập nhật file admin.html để có Modal Lịch Sử!");
        }
        
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Đang tải dữ liệu...</td></tr>';
        
        document.getElementById('historyCustomerName').innerText = `Khách hàng: ${username}`;
        document.getElementById('historyTotalCount').innerText = '...';
        
        // Mở Modal Lịch Sử
        document.getElementById('historyModal').classList.add('active');

        // Tải dữ liệu đơn hàng mới nhất
        await fetchOrders(); 
        
        const history = orders.filter(o => o.user_id == userId);
        history.sort((a, b) => new Date(b.NgayLap) - new Date(a.NgayLap));

        // Hiển thị dữ liệu
        document.getElementById('historyTotalCount').innerText = `Tổng số đơn: ${history.length}`;

        if (history.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center" style="padding: 20px; color: #666;">Khách hàng này chưa có đơn hàng nào.</td></tr>`;
        } else {
            tbody.innerHTML = history.map(o => {
                let color = '#333';
                let statusText = o.TrangThai;
                
                if(o.TrangThai === 'DaGiao') { 
                    color = 'green'; 
                    statusText = '<i class="fas fa-check"></i> Đã giao'; 
                } else if(o.TrangThai === 'DaHuy') { 
                    color = 'red'; 
                    statusText = '<i class="fas fa-times"></i> Đã hủy'; 
                } else if(o.TrangThai === 'DangGiao') { 
                    color = 'blue'; 
                    statusText = '<i class="fas fa-truck"></i> Đang giao'; 
                } else { 
                    color = 'orange'; 
                    statusText = '<i class="fas fa-clock"></i> Chờ xác nhận'; 
                }

                const date = o.NgayLap ? new Date(o.NgayLap).toLocaleDateString('vi-VN') : 'N/A';
                
                return `
                    <tr>
                        <td><strong>#${o.MaHoaDon}</strong></td>
                        <td>${date}</td>
                        <td style="font-weight:bold; color: var(--primary);">${formatCurrency(o.TongTien)}</td>
                        <td style="color:${color}; font-weight:500;">${statusText}</td>
                    </tr>
                `;
            }).join('');
        }

    } catch(e) {
        alert("Lỗi tải lịch sử: " + e.message);
        closeModal('historyModal');
    }
};


// ================================================================================
// 5. QUẢN LÝ ĐỚN HÀNG (ORDERS)
// ================================================================================

/**
 * Tải danh sách đơn hàng
 */
async function fetchOrders() {
    try {
        const res = await fetchWithAuth('/hoadons');
        orders = parseRes(await res.json());
        orders.sort((a, b) => b.MaHoaDon - a.MaHoaDon);
        
        const tableBody = document.getElementById('ordersTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = orders.map(o => {
            let statusColor = '#f59e0b';
            if (o.TrangThai === 'DaGiao') statusColor = '#10b981';
            if (o.TrangThai === 'DaHuy') statusColor = '#ef4444';
            if (o.TrangThai === 'DangGiao') statusColor = '#3b82f6';

            const ngayLap = o.NgayLap ? new Date(o.NgayLap).toLocaleDateString('vi-VN') : 'N/A';
            const canDelete = o.TrangThai === 'DaHuy' || o.TrangThai === 'ChoXacNhan';

            return `
            <tr>
                <td><strong>#${o.MaHoaDon}</strong></td>
                <td>${o.user_id}</td>
                <td>${ngayLap}</td>
                <td style="font-weight:bold;">${formatCurrency(o.TongTien)}</td>
                <td><span style="color:${statusColor}; font-weight:600;">${o.TrangThai}</span></td>
                <td class="text-center">
                    <button class="btn-sm btn-info" onclick="viewOrderDetail('${o.MaHoaDon}')" title="Xem chi tiết"><i class="fas fa-eye"></i></button>
                    <button class="btn-sm btn-edit" onclick="editOrder('${o.MaHoaDon}')" title="Sửa đơn hàng"><i class="fas fa-edit"></i></button>
                    <button class="btn-sm btn-delete" onclick="deleteOrder('${o.MaHoaDon}')" 
                        ${!canDelete ? 'disabled' : ''} title="Xóa"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        }).join('');
    } catch (e) { 
        console.error("Lỗi tải đơn hàng:", e); 
    }
}

/**
 * Xem Chi Tiết Đơn Hàng (Modal chỉ đọc)
 */
window.viewOrderDetail = async (maHoaDon) => {
    // Khôi phục lại HTML gốc của Modal nếu bị lỗi
    if(!document.getElementById('detailMaHoaDon')) {
        location.reload();
    }

    const order = orders.find(o => o.MaHoaDon == maHoaDon);
    if (!order) return alert("Không tìm thấy đơn hàng!");

    const setVal = (id, val) => { 
        const el = document.getElementById(id); 
        if(el) el.value = val; 
    };

    setVal('detailMaHoaDon', order.MaHoaDon);
    setVal('detailUserId', order.user_id);
    setVal('detailNgayLap', order.NgayLap ? new Date(order.NgayLap).toLocaleString('vi-VN') : '');
    setVal('detailHoTen', order.HoTen || 'Không có tên');
    setVal('detailSoDienThoai', order.SoDienThoai || '');
    setVal('detailDiaChi', order.DiaChiGiaoHang || 'Tại cửa hàng');
    setVal('detailPhuongThuc', order.PhuongThucThanhToan || 'Tiền mặt');
    setVal('detailMaGiamGia', order.MaGiamGia || 'Không');
    setVal('detailTongTien', formatCurrency(order.TongTien));
    setVal('detailGhiChu', order.GhiChu || '');
    setVal('detailTrangThaiText', order.TrangThai);

    const tableBody = document.getElementById('detailProductsBody');
    if(tableBody) {
        tableBody.innerHTML = '<tr><td colspan="2" class="text-center">Đang tải...</td></tr>';
        
        try {
            const res = await fetchWithAuth(`/chitiethds?MaHoaDon=${maHoaDon}`);
            let details = [];
            
            if (res.ok) {
                details = parseRes(await res.json());
                details = details.filter(d => d.MaHoaDon == maHoaDon);
            }

            if (details.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="2" class="text-center">Không có sản phẩm nào.</td></tr>';
            } else {
                tableBody.innerHTML = details.map(d => {
                    const bookInfo = books.find(b => b.MaSach == d.MaSach);
                    const bookName = bookInfo ? `<span style="font-weight:500; color:var(--primary)">${bookInfo.TenSach}</span>` : `Mã Sách: ${d.MaSach}`;
                    return `<tr><td>${bookName}</td><td style="font-weight:bold; text-align:center;">${d.SoLuong}</td></tr>`;
                }).join('');
            }
        } catch (e) {
            tableBody.innerHTML = '<tr><td colspan="2" class="text-center" style="color:red">Lỗi tải dữ liệu!</td></tr>';
        }
    }
    
    document.getElementById('orderDetailModal').classList.add('active');
}

/**
 * Sửa Đơn Hàng
 */
window.editOrder = async (maHoaDon) => {
    try {
        const order = orders.find(o => o.MaHoaDon == maHoaDon);
        if (!order) return alert("Không tìm thấy dữ liệu đơn hàng!");

        const setVal = (id, val) => { 
            const el = document.getElementById(id); 
            if(el) el.value = val; 
        };

        setVal('editMaHoaDon', order.MaHoaDon);
        setVal('editUserId', order.user_id);
        setVal('editNgayLap', order.NgayLap ? new Date(order.NgayLap).toLocaleString('vi-VN') : '');
        setVal('editHoTen', order.HoTen || '');
        setVal('editSoDienThoai', order.SoDienThoai || '');
        setVal('editDiaChi', order.DiaChiGiaoHang || '');
        setVal('editPhuongThuc', order.PhuongThucThanhToan || 'COD');
        setVal('editGhiChu', order.GhiChu || '');
        setVal('editTrangThai', order.TrangThai);

        // Populate discount select
        const discountSelect = document.getElementById('editMaGiamGia');
        if (discountSelect) {
            let options = '<option value="">-- Không áp dụng --</option>';
            if (discounts && discounts.length > 0) {
                options += discounts.map(d => `<option value="${d.MaGiamGia}">${d.MaGiamGia} (-${d.PhanTramGiam}%)</option>`).join('');
            }
            discountSelect.innerHTML = options;
            discountSelect.value = order.MaGiamGia || '';
        }

        // Populate product select
        const productSelect = document.getElementById('editProductSelect');
        if (productSelect) {
            productSelect.innerHTML = '<option value="">-- Chọn sách để thêm --</option>' + 
            books.map(b => `<option value="${b.MaSach}">${b.TenSach} - ${formatCurrency(b.GiaSach)}</option>`).join('');
        }

        // Load chi tiết đơn hàng
        currentEditDetails = []; 
        const tbody = document.getElementById('editProductsBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">Đang tải...</td></tr>';
            
            const res = await fetchWithAuth(`/chitiethds?MaHoaDon=${maHoaDon}`);
            if (res.ok) {
                let details = parseRes(await res.json());
                currentEditDetails = details.filter(d => d.MaHoaDon == maHoaDon)
                    .map(d => ({ MaSach: d.MaSach, SoLuong: d.SoLuong }));
            }
            
            renderEditProductsTable();
        }

        document.getElementById('editOrderModal').classList.add('active');
    } catch (err) {
        alert("Lỗi khi mở sửa đơn hàng: " + err.message);
    }
}

/**
 * Render bảng sản phẩm trong modal Sửa Đơn
 */
function renderEditProductsTable() {
    const tbody = document.getElementById('editProductsBody');
    if (!tbody) return;
    
    if (currentEditDetails.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center" style="color:#999;">Chưa có sản phẩm nào</td></tr>';
        return;
    }
    
    tbody.innerHTML = currentEditDetails.map((item, index) => {
        const book = books.find(b => b.MaSach == item.MaSach);
        const name = book ? book.TenSach : `Sách #${item.MaSach}`;
        
        return `
        <tr>
            <td>${name}</td>
            <td class="text-center">
                <input type="number" class="form-control" 
                    style="padding:5px; height:30px; width:60px; text-align:center; display:inline-block;" 
                    value="${item.SoLuong}" min="1" 
                    onchange="updateProductQty(${index}, this.value)">
            </td>
            <td class="text-center">
                <i class="fas fa-trash text-danger" style="cursor:pointer;" 
                    onclick="removeProductFromEditOrder(${index})"></i>
            </td>
        </tr>`;
    }).join('');
}

/**
 * Thêm sản phẩm vào đơn đang sửa
 */
window.addProductToEditOrder = () => {
    const select = document.getElementById('editProductSelect');
    const qtyInput = document.getElementById('editProductQty');
    const maSach = parseInt(select.value);
    const soLuong = parseInt(qtyInput.value);
    
    if (!maSach || soLuong < 1) {
        return alert("Vui lòng chọn sách và số lượng hợp lệ!");
    }
    
    const existingIndex = currentEditDetails.findIndex(x => x.MaSach == maSach);
    if (existingIndex >= 0) {
        currentEditDetails[existingIndex].SoLuong += soLuong;
    } else {
        currentEditDetails.push({ MaSach: maSach, SoLuong: soLuong });
    }
    
    select.value = "";
    qtyInput.value = 1;
    renderEditProductsTable();
}

/**
 * Cập nhật số lượng sản phẩm
 */
window.updateProductQty = (index, newQty) => {
    if (newQty > 0) {
        currentEditDetails[index].SoLuong = parseInt(newQty);
    } else {
        renderEditProductsTable();
    }
}

/**
 * Xóa sản phẩm khỏi đơn đang sửa
 */
window.removeProductFromEditOrder = (index) => {
    currentEditDetails.splice(index, 1);
    renderEditProductsTable();
}

/**
 * Lưu thay đổi đơn hàng
 */
window.saveEditOrder = async () => {
    try {
        const maHoaDon = document.getElementById('editMaHoaDon').value;
        const originalOrder = orders.find(o => o.MaHoaDon == maHoaDon);
        const getVal = (id) => document.getElementById(id).value;

        const payload = {
            ...originalOrder, 
            HoTen: getVal('editHoTen'),
            SoDienThoai: getVal('editSoDienThoai'),
            DiaChiGiaoHang: getVal('editDiaChi'),
            PhuongThucThanhToan: getVal('editPhuongThuc'),
            MaGiamGia: getVal('editMaGiamGia'), 
            GhiChu: getVal('editGhiChu'),
            TrangThai: getVal('editTrangThai'),
            ChiTiet: currentEditDetails 
        };

        const res = await fetchWithAuth(`/hoadons/${maHoaDon}`, { 
            method: 'PUT', 
            body: JSON.stringify(payload) 
        });
        
        if (res.ok) {
            alert('Cập nhật đơn hàng thành công!');
            closeModal('editOrderModal');
            fetchOrders();
            updateDashboardStats();
        } else {
            const error = await res.json();
            alert('Lỗi: ' + (error.message || 'Không thể cập nhật'));
        }
    } catch (e) { 
        alert('Lỗi kết nối: ' + e.message); 
    }
}

/**
 * Mở Modal Thêm Đơn Hàng
 */
window.openAddOrderModal = function() {
    document.getElementById('addOrderForm').reset();
    currentAddDetails = []; 
    renderAddProductsTable();

    document.getElementById('addNgayLap').value = new Date().toISOString().split('T')[0];

    // Select Khách Hàng
    const userSelect = document.getElementById('addUserId');
    if (userSelect) {
        let userOpts = '<option value="">-- Chọn khách hàng --</option>';
        userOpts += customers.map(c => `<option value="${c.id}">${c.username} (${c.email})</option>`).join('');
        userSelect.innerHTML = userOpts;
    }

    // Select Sản phẩm
    const productSelect = document.getElementById('addProductSelect');
    if (productSelect) {
        productSelect.innerHTML = '<option value="">-- Chọn sách --</option>' + 
        books.map(b => `<option value="${b.MaSach}">${b.TenSach} - ${formatCurrency(b.GiaSach)}</option>`).join('');
    }

    // Select Mã giảm giá
    const discountSelect = document.getElementById('addMaGiamGia');
    if (discountSelect) {
        let opts = '<option value="">-- Không áp dụng --</option>';
        opts += discounts.map(d => `<option value="${d.MaGiamGia}">${d.MaGiamGia} (-${d.PhanTramGiam}%)</option>`).join('');
        discountSelect.innerHTML = opts;
    }

    document.getElementById('addOrderModal').classList.add('active');
};

/**
 * Render bảng sản phẩm trong modal Thêm Đơn
 */
function renderAddProductsTable() {
    const tbody = document.getElementById('addProductsBody');
    if (!tbody) return;

    if (currentAddDetails.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center" style="color:#999;font-style:italic">Chưa chọn sách nào</td></tr>';
        return;
    }

    tbody.innerHTML = currentAddDetails.map((item, index) => {
        const book = books.find(b => b.MaSach == item.MaSach);
        const name = book ? book.TenSach : `ID: ${item.MaSach}`;
        
        return `
        <tr>
            <td>${name}</td>
            <td class="text-center"><strong>${item.SoLuong}</strong></td>
            <td class="text-center">
                <i class="fas fa-trash text-danger" style="cursor:pointer;" 
                    onclick="removeProductFromAddOrder(${index})"></i>
            </td>
        </tr>`;
    }).join('');
}

/**
 * Thêm sản phẩm vào đơn mới
 */
window.addProductToAddOrder = function() {
    const select = document.getElementById('addProductSelect');
    const qtyInput = document.getElementById('addProductQty');
    const maSach = parseInt(select.value);
    const soLuong = parseInt(qtyInput.value);

    if (!maSach || soLuong < 1) {
        return alert("Vui lòng chọn sách và số lượng > 0");
    }

    const existingIndex = currentAddDetails.findIndex(x => x.MaSach == maSach);
    if (existingIndex >= 0) {
        currentAddDetails[existingIndex].SoLuong += soLuong;
    } else {
        currentAddDetails.push({ MaSach: maSach, SoLuong: soLuong });
    }
    
    select.value = "";
    qtyInput.value = 1;
    renderAddProductsTable();
};

/**
 * Xóa sản phẩm khỏi đơn mới
 */
window.removeProductFromAddOrder = function(index) {
    currentAddDetails.splice(index, 1);
    renderAddProductsTable();
};

/**
 * Lưu Đơn Hàng Mới
 */
window.saveNewOrder = async function() {
    const getVal = (id) => document.getElementById(id).value;
    const userId = getVal('addUserId');

    if (!userId) {
        return alert("Vui lòng chọn khách hàng!");
    }
    if (currentAddDetails.length === 0) {
        return alert("Vui lòng thêm ít nhất 1 sản phẩm!");
    }

    const payload = {
        user_id: parseInt(userId),
        HoTen: getVal('addHoTen'),
        SoDienThoai: getVal('addSoDienThoai'),
        DiaChiGiaoHang: getVal('addDiaChi'),
        PhuongThucThanhToan: getVal('addPhuongThuc'),
        MaGiamGia: getVal('addMaGiamGia') || null,
        GhiChu: getVal('addGhiChu'),
        NgayLap: getVal('addNgayLap') ? new Date(getVal('addNgayLap')) : new Date(),
        TrangThai: 'ChoXacNhan', 
        ChiTiet: currentAddDetails
    };

    try {
        const res = await fetchWithAuth('/hoadons', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Tạo đơn hàng mới thành công!");
            closeModal('addOrderModal');
            fetchOrders();
            updateDashboardStats();
        } else {
            const err = await res.json();
            alert("Lỗi: " + (err.message || "Không thể tạo đơn hàng"));
        }
    } catch (e) {
        alert("Lỗi kết nối Server: " + e.message);
    }
};

/**
 * Xóa Đơn Hàng
 */
window.deleteOrder = async (maHoaDon) => {
    const order = orders.find(o => o.MaHoaDon == maHoaDon);
    if (!order) return alert("Không tìm thấy đơn hàng!");

    if (order.TrangThai !== 'DaHuy' && order.TrangThai !== 'ChoXacNhan') {
        return alert('Chỉ có thể xóa đơn hàng có trạng thái "Đã Hủy" hoặc "Chờ Xác Nhận"!');
    }

    if (!confirm(`Bạn có chắc muốn xóa đơn hàng #${maHoaDon}?`)) {
        return;
    }

    try {
        const res = await fetchWithAuth(`/hoadons/${maHoaDon}`, { 
            method: 'DELETE' 
        });
        
        if (res.ok) {
            alert('Xóa đơn hàng thành công!');
            fetchOrders();
            updateDashboardStats();
        } else {
            const error = await res.json();
            alert('Lỗi: ' + (error.message || 'Không thể xóa'));
        }
    } catch (e) {
        alert('Lỗi kết nối Server!');
    }
}


// ================================================================================
// 6. QUẢN LÝ SÁCH (BOOKS)
// ================================================================================

/**
 * Tải danh sách sách
 */
async function fetchBooks() {
    try {
        const res = await fetch(`${API_BASE_URL}/sachs?page=1&size=1000&sortBy=MaSach&order=asc`);
        books = parseRes(await res.json());
        renderBooks();
        renderBookAuthorsTable();
    } catch (e) {
        console.error("Lỗi tải sách:", e);
    }
}

/**
 * Render bảng sách
 */
function renderBooks() {
    const t = document.getElementById('booksTableBody');
    if (!t) return;
    
    t.innerHTML = books.map(b => {
        const cat = categories.find(c => c.MaTheLoai == b.MaTheLoai)?.TenTheLoai || '---';

        // Xử lý ảnh
        let images = '';
        let image_path_rutgon = b.LinkHinhAnh;
        if (b.LinkHinhAnh) {
            // Tách chuỗi bằng dấu phẩy, sau đó xóa khoảng trắng thừa ở 2 đầu (trim)
            // Ví dụ: "a.jpg, b.png" -> ["a.jpg", "b.png"]
            images = b.LinkHinhAnh.split(',').map(img => img.trim()).filter(img => img !== "");
        }

        if (images.length > 1)
            image_path_rutgon = images[0];

        const img = `${IMAGE_PATH_BASE}${image_path_rutgon}`;
        const discountInfo = b.MaGiamGia ? `<span class="tag-discount">${b.MaGiamGia}</span>` : '-';
        
        return `
        <tr>
            <td><img src="${img}" class="book-thumb"></td>
            <td><strong>${b.TenSach}</strong></td>
            <td>${b.TenNguoiDich||'(Gốc)'}</td>
            <td>${cat}</td>
            <td>${discountInfo}</td>
            <td style="color:var(--primary);font-weight:bold">${formatCurrency(b.GiaSach)}</td>
            <td>${b.SoLuongDaBan||0}</td>
            <td class="text-center">
                <button class="btn-sm btn-edit" onclick="editBook(${b.MaSach})"><i class="fas fa-edit"></i></button>
                <button class="btn-sm btn-delete" onclick="deleteBook(${b.MaSach})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('');
}

/**
 * Render bảng Sách - Tác Giả
 */
function renderBookAuthorsTable() {
    const tbody = document.getElementById('bookAuthorsTableBody');
    if(!tbody) return;
    
    tbody.innerHTML = books.map(b => `
        <tr>
            <td>#${b.MaSach}</td>
            <td style="font-weight:500">${b.TenSach}</td>
            <td style="color:#666; font-style:italic">(Xem chi tiết)</td>
            <td class="text-center">
                <button class="btn-sm btn-edit" onclick="openAuthorManager(${b.MaSach})">
                    <i class="fas fa-users-cog"></i> Quản lý
                </button>
            </td>
        </tr>`).join('');
}

/**
 * Mở Modal Thêm Sách
 */
window.openAddBookModal = function() {
    currentEditId = null;
    document.getElementById('bookForm').reset();
    populateDropdowns();
    document.getElementById('finalPricePreview').innerText = "0 đ";
    document.getElementById('bookModal').classList.add('active');
}

/**
 * Mở Modal Sửa Sách
 */
window.editBook = (id) => {
    currentEditId = id;
    const b = books.find(x => x.MaSach == id);
    
    if (b) {
        populateDropdowns();
        document.getElementById('bookName').value = b.TenSach;
        document.getElementById('bookPrice').value = b.GiaSach;
        document.getElementById('bookCategory').value = b.MaTheLoai;
        document.getElementById('bookPublisher').value = b.MaNXB;
        document.getElementById('bookTranslator').value = b.TenNguoiDich || '';
        document.getElementById('bookDiscount').value = b.MaGiamGia || '';
        
        if (b.NamXuatBan) {
            document.getElementById('bookYear').value = new Date(b.NamXuatBan).toISOString().split('T')[0];
        }
        
        document.getElementById('bookPages').value = b.SoTrang || 0;
        document.getElementById('bookSold').value = b.SoLuongDaBan || 0;
        document.getElementById('bookImage').value = b.LinkHinhAnh || '';
        document.getElementById('bookDescription').value = b.MoTaNoiDung || '';
        
        calculateFinalPrice();
        document.getElementById('bookModal').classList.add('active');
    }
}

/**
 * Lưu Sách (Tạo/Sửa)
 */
window.saveBook = async () => {
    const tenSach = document.getElementById('bookName').value;
    const giaSach = document.getElementById('bookPrice').value;
    const maTheLoai = document.getElementById('bookCategory').value;
    const maNXB = document.getElementById('bookPublisher').value;
    
    if (!tenSach || !giaSach || !maTheLoai || !maNXB) {
        return alert('Nhập đủ thông tin!');
    }
    
    const p = {
        TenSach: tenSach, 
        GiaSach: Number(giaSach), 
        MaTheLoai: Number(maTheLoai), 
        MaNXB: Number(maNXB),
        MaGiamGia: document.getElementById('bookDiscount').value || null,
        NamXuatBan: document.getElementById('bookYear').value ? new Date(document.getElementById('bookYear').value) : new Date(),
        SoTrang: Number(document.getElementById('bookPages').value) || 0,
        LinkHinhAnh: document.getElementById('bookImage').value,
        MoTaNoiDung: document.getElementById('bookDescription').value,
        SoLuongDaBan: Number(document.getElementById('bookSold').value) || 0,
        TenNguoiDich: document.getElementById('bookTranslator').value
    };
    
    const url = currentEditId ? `${API_BASE_URL}/sachs/${currentEditId}` : `${API_BASE_URL}/sachs`;
    
    try {
        const res = await fetch(url, { 
            method: currentEditId ? 'PUT' : 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(p) 
        });
        
        if (res.ok) { 
            alert('Thành công'); 
            closeModal('bookModal'); 
            fetchBooks(); 
        } else {
            alert('Lỗi');
        }
    } catch (e) { 
        alert('Lỗi kết nối'); 
    }
}

/**
 * Xóa Sách
 */
window.deleteBook = async (id) => { 
    if (confirm('Xóa?')) { 
        await fetch(`${API_BASE_URL}/sachs/${id}`, { method: 'DELETE' }); 
        fetchBooks(); 
    } 
}

/**
 * Populate các dropdown trong form sách
 */
function populateDropdowns() {
    const c = document.getElementById('bookCategory');
    const p = document.getElementById('bookPublisher');
    const d = document.getElementById('bookDiscount');
    
    if (c) {
        c.innerHTML = categories.map(i => `<option value="${i.MaTheLoai}">${i.TenTheLoai}</option>`).join('');
    }
    if (p) {
        p.innerHTML = publishers.map(i => `<option value="${i.MaNXB}">${i.TenNXB}</option>`).join('');
    }
    if (d) {
        d.innerHTML = '<option value="">-- Không áp dụng --</option>' + 
        discounts.map(i => `<option value="${i.MaGiamGia}">${i.MaGiamGia} (-${i.PhanTramGiam}%)</option>`).join('');
    }
}

/**
 * Tính giá sau giảm
 */
window.calculateFinalPrice = function() {
    const price = Number(document.getElementById('bookPrice').value) || 0;
    const discountCode = document.getElementById('bookDiscount').value;
    let finalPrice = price;
    
    if (discountCode) {
        const discountObj = discounts.find(d => d.MaGiamGia === discountCode);
        if (discountObj) {
            finalPrice = price * (1 - discountObj.PhanTramGiam / 100);
        }
    }
    
    document.getElementById('finalPricePreview').innerText = formatCurrency(finalPrice);
}


// ================================================================================
// 7. QUẢN LÝ SÁCH - TÁC GIẢ
// ================================================================================

/**
 * Mở Modal Quản Lý Tác Giả cho Sách
 */
window.openAuthorManager = async function(maSach) {
    const bookBasic = books.find(b => b.MaSach == maSach);
    if (!bookBasic) return alert("Không tìm thấy sách!");

    currentManageBook = bookBasic;
    document.getElementById('manageBookId').value = maSach;
    document.getElementById('manageBookTitle').innerText = bookBasic.TenSach;

    manageAuthorIds = []; 
    
    const select = document.getElementById('manageAuthorSelect');
    select.innerHTML = '<option value="">-- Chọn tác giả --</option>' + 
        authors.map(a => `<option value="${a.MaTacGia}">${a.TenTacGia}</option>`).join('');

    try {
        const res = await fetch(`${API_BASE_URL}/sachs/${maSach}`);
        if(res.ok) {
            const bookDetail = await res.json();
            if (bookDetail.AuthorIds && Array.isArray(bookDetail.AuthorIds)) {
                manageAuthorIds = bookDetail.AuthorIds;
            }
        }
    } catch (e) {
        console.error("Lỗi kết nối:", e);
    }

    renderManageAuthorsTags();
    document.getElementById('authorManagerModal').classList.add('active');
};

/**
 * Render danh sách tag tác giả
 */
function renderManageAuthorsTags() {
    const container = document.getElementById('manageAuthorsContainer');
    
    if (manageAuthorIds.length === 0) {
        container.innerHTML = '<p style="font-style:italic; color:#999; padding:10px;">Chưa có tác giả nào.</p>';
        return;
    }
    
    container.innerHTML = manageAuthorIds.map((authId, index) => {
        const author = authors.find(a => a.MaTacGia == authId);
        const name = author ? author.TenTacGia : `ID: ${authId}`;
        
        return `<div class="author-tag">
            ${name} 
            <i class="fas fa-times" onclick="removeManagerAuthorTag(${index})"></i>
        </div>`;
    }).join('');
}

/**
 * Thêm tác giả vào danh sách
 */
window.addManagerAuthorTag = function() {
    const select = document.getElementById('manageAuthorSelect');
    const authId = Number(select.value);
    
    if (!authId) {
        return alert("Vui lòng chọn tác giả!");
    }
    if (manageAuthorIds.includes(authId)) {
        return alert("Tác giả này đã có trong danh sách!");
    }
    
    manageAuthorIds.push(authId);
    renderManageAuthorsTags();
    select.value = "";
};

/**
 * Xóa tác giả khỏi danh sách
 */
window.removeManagerAuthorTag = function(index) {
    manageAuthorIds.splice(index, 1);
    renderManageAuthorsTags();
};

/**
 * Lưu quan hệ Sách - Tác Giả
 */
window.saveBookAuthorsRelation = async function() {
    if (!currentManageBook) return;
    
    const payload = {
        ...currentManageBook,      
        AuthorIds: manageAuthorIds 
    };

    try {
        const res = await fetch(`${API_BASE_URL}/sachs/${currentManageBook.MaSach}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            alert("Cập nhật tác giả thành công!");
            closeModal('authorManagerModal');
            await fetchBooks(); 
        } else {
            const err = await res.json();
            alert("Lỗi khi lưu: " + (err.message || "Không xác định"));
        }
    } catch (e) {
        alert("Lỗi kết nối Server: " + e.message);
    }
};


// ================================================================================
// 8. DASHBOARD STATS & CHARTS
// ================================================================================

/**
 * Cập nhật thống kê dashboard
 */
function updateDashboardStats() {
    if (document.getElementById('totalBooks')) {
        document.getElementById('totalBooks').innerText = books.length;
    }
    if (document.getElementById('totalCustomers')) {
        document.getElementById('totalCustomers').innerText = customers.length;
    }
    if (document.getElementById('totalOrders')) {
        document.getElementById('totalOrders').innerText = orders.length;
    }
    
    const validOrders = orders.filter(o => o.TrangThai === 'DaGiao');
    const totalRev = validOrders.reduce((sum, o) => sum + (Number(o.TongTien) || 0), 0);
    
    if (document.getElementById('totalRevenue')) {
        document.getElementById('totalRevenue').innerText = formatCurrency(totalRev);
    }
    
    renderRevenueChart();
    renderTopBooks();
}

/**
 * Vẽ biểu đồ doanh thu
 */
function renderRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    const monthlyData = Array(12).fill(0);
    
    orders.forEach(o => {
        if (o.NgayLap && o.TrangThai === 'DaGiao') {
            const d = new Date(o.NgayLap);
            monthlyData[d.getMonth()] += (Number(o.TongTien) || 0);
        }
    });
    
    if (revenueChart) {
        revenueChart.destroy();
    }
    
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: { 
            labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'], 
            datasets: [{ 
                label: 'Doanh thu (VNĐ)', 
                data: monthlyData, 
                borderColor: '#10b981', 
                backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                fill: true, 
                tension: 0.4 
            }] 
        },
        options: { 
            responsive: true 
        }
    });
}

/**
 * Hiển thị top sách bán chạy
 */
function renderTopBooks() {
    const list = document.getElementById('topBooksList');
    if (!list) return;
    
    const topBooks = [...books]
        .sort((a, b) => (b.SoLuongDaBan || 0) - (a.SoLuongDaBan || 0))
        .slice(0, 5);
    
    list.innerHTML = topBooks.map((b, i) => `
        <div class="ranking-item">
            <div class="rank-index">${i + 1}</div>
            <img src="${IMAGE_PATH_BASE}${b.LinkHinhAnh}" class="rank-thumb">
            <div class="rank-info">
                <h4>${b.TenSach}</h4>
                <p>Đã bán: <strong>${b.SoLuongDaBan || 0}</strong></p>
            </div>
        </div>`).join('');
}


// ================================================================================
// 9. QUẢN LÝ CÁC DANH MỤC (CATEGORIES, AUTHORS, PUBLISHERS, DISCOUNTS)
// ================================================================================

// ----- THỂ LOẠI (CATEGORIES) -----
async function fetchCategories() {
    try {
        const res = await fetch(`${API_BASE_URL}/theloais`);
        categories = parseRes(await res.json());
        renderCategories();
    } catch (e) {}
}

function renderCategories() {
    const tbody = document.getElementById('categoriesTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = categories.map(c => `
        <tr>
            <td>${c.MaTheLoai}</td>
            <td><strong>${c.TenTheLoai}</strong></td>
            <td class="text-center">
                <button class="btn-sm btn-edit" onclick="editCategory(${c.MaTheLoai})"><i class="fas fa-edit"></i></button>
                <button class="btn-sm btn-delete" onclick="deleteCategory(${c.MaTheLoai})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`).join('');
}

window.openAddCategoryModal = () => { 
    currentEditId = null; 
    document.getElementById('categoryForm').reset(); 
    document.getElementById('categoryModal').classList.add('active'); 
}

window.editCategory = (id) => { 
    currentEditId = id; 
    const i = categories.find(c => c.MaTheLoai == id); 
    if (i) { 
        document.getElementById('categoryName').value = i.TenTheLoai; 
        document.getElementById('categoryModal').classList.add('active'); 
    } 
}

window.saveCategory = async () => { 
    const payload = { 
        TenTheLoai: document.getElementById('categoryName').value, 
        MaTheLoai: currentEditId ? Number(currentEditId) : 0 
    }; 
    
    await fetch(
        currentEditId ? `${API_BASE_URL}/theloais/${currentEditId}` : `${API_BASE_URL}/theloais`, 
        { 
            method: currentEditId ? 'PUT' : 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload) 
        }
    ); 
    
    closeModal('categoryModal'); 
    fetchCategories(); 
}

window.deleteCategory = async (id) => { 
    if (confirm('Xóa?')) { 
        await fetch(`${API_BASE_URL}/theloais/${id}`, { method: 'DELETE' }); 
        fetchCategories(); 
    } 
}


// ----- TÁC GIẢ (AUTHORS) -----
async function fetchAuthors() {
    try {
        const res = await fetch(`${API_BASE_URL}/tacgias`);
        authors = parseRes(await res.json());
        renderAuthors();
    } catch (e) {}
}

function renderAuthors() {
    const tbody = document.getElementById('authorsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = authors.map(a => `
        <tr>
            <td>${a.MaTacGia}</td>
            <td><strong>${a.TenTacGia}</strong></td>
            <td>${a.MoTa || ''}</td>
            <td class="text-center">
                <button class="btn-sm btn-edit" onclick="editAuthor(${a.MaTacGia})"><i class="fas fa-edit"></i></button>
                <button class="btn-sm btn-delete" onclick="deleteAuthor(${a.MaTacGia})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`).join('');
}

window.openAddAuthorModal = () => { 
    currentEditId = null; 
    document.getElementById('authorForm').reset(); 
    document.getElementById('authorModal').classList.add('active'); 
}

window.editAuthor = (id) => { 
    currentEditId = id; 
    const i = authors.find(a => a.MaTacGia == id); 
    if (i) { 
        document.getElementById('authorName').value = i.TenTacGia; 
        document.getElementById('authorDesc').value = i.MoTa || ''; 
        document.getElementById('authorModal').classList.add('active'); 
    } 
}

window.saveAuthor = async () => { 
    const payload = { 
        TenTacGia: document.getElementById('authorName').value, 
        MoTa: document.getElementById('authorDesc').value, 
        MaTacGia: currentEditId ? Number(currentEditId) : 0 
    }; 
    
    await fetch(
        currentEditId ? `${API_BASE_URL}/tacgias/${currentEditId}` : `${API_BASE_URL}/tacgias`, 
        { 
            method: currentEditId ? 'PUT' : 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload) 
        }
    ); 
    
    closeModal('authorModal'); 
    fetchAuthors(); 
}

window.deleteAuthor = async (id) => { 
    if (confirm('Xóa?')) { 
        await fetch(`${API_BASE_URL}/tacgias/${id}`, { method: 'DELETE' }); 
        fetchAuthors(); 
    } 
}


// ----- NHÀ XUẤT BẢN (PUBLISHERS) -----
async function fetchPublishers() {
    try {
        const res = await fetch(`${API_BASE_URL}/nhaxuatbans`);
        publishers = parseRes(await res.json());
        renderPublishers();
    } catch (e) {}
}

function renderPublishers() {
    const tbody = document.getElementById('publishersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = publishers.map(p => `
        <tr>
            <td>${p.MaNXB}</td>
            <td><strong>${p.TenNXB}</strong></td>
            <td>${p.DiaChi || '-'}</td>
            <td>${p.SoDienThoai || '-'}</td>
            <td class="text-center">
                <button class="btn-sm btn-edit" onclick="editPublisher(${p.MaNXB})"><i class="fas fa-edit"></i></button>
                <button class="btn-sm btn-delete" onclick="deletePublisher(${p.MaNXB})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`).join('');
}

window.openAddPublisherModal = () => { 
    currentEditId = null; 
    document.getElementById('publisherForm').reset(); 
    document.getElementById('publisherModal').classList.add('active'); 
}

window.editPublisher = (id) => { 
    currentEditId = id; 
    const i = publishers.find(p => p.MaNXB == id); 
    if (i) { 
        document.getElementById('publisherName').value = i.TenNXB; 
        document.getElementById('publisherAddress').value = i.DiaChi || ''; 
        document.getElementById('publisherPhone').value = i.SoDienThoai || ''; 
        document.getElementById('publisherModal').classList.add('active'); 
    } 
}

window.savePublisher = async () => { 
    const payload = { 
        TenNXB: document.getElementById('publisherName').value, 
        DiaChi: document.getElementById('publisherAddress').value, 
        SoDienThoai: document.getElementById('publisherPhone').value, 
        MaNXB: currentEditId ? Number(currentEditId) : 0 
    }; 
    
    await fetch(
        currentEditId ? `${API_BASE_URL}/nhaxuatbans/${currentEditId}` : `${API_BASE_URL}/nhaxuatbans`, 
        { 
            method: currentEditId ? 'PUT' : 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload) 
        }
    ); 
    
    closeModal('publisherModal'); 
    fetchPublishers(); 
}

window.deletePublisher = async (id) => { 
    if (confirm('Xóa?')) { 
        await fetch(`${API_BASE_URL}/nhaxuatbans/${id}`, { method: 'DELETE' }); 
        fetchPublishers(); 
    } 
}


// ----- MÃ GIẢM GIÁ (DISCOUNTS) -----
async function fetchDiscounts() {
    try {
        const res = await fetch(`${API_BASE_URL}/giamgias`);
        discounts = parseRes(await res.json());
        
        document.getElementById('discountsTableBody').innerHTML = discounts.map(d => {
            const start = d.NgayBatDau ? new Date(d.NgayBatDau).toLocaleDateString('vi-VN') : '-';
            const end = d.NgayKetThuc ? new Date(d.NgayKetThuc).toLocaleDateString('vi-VN') : '-';
            const qty = (d.SoLuong !== null && d.SoLuong !== undefined) 
                ? `<strong>${d.SoLuong}</strong>` 
                : '<span class="tag-unlimited">Vô Hạn</span>';
            
            return `
            <tr>
                <td><strong>${d.MaGiamGia}</strong></td>
                <td style="color:var(--danger); font-weight:bold">-${d.PhanTramGiam}%</td>
                <td>${start}</td>
                <td>${end}</td>
                <td>${qty}</td>
                <td class="text-center">
                    <button class="btn-sm btn-edit" onclick="editDiscount('${d.MaGiamGia}')"><i class="fas fa-edit"></i></button>
                    <button class="btn-sm btn-delete" onclick="deleteDiscount('${d.MaGiamGia}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        }).join('');
    } catch (e) {}
}

window.openAddDiscountModal = () => { 
    currentEditId = null; 
    document.getElementById('discountForm').reset(); 
    document.getElementById('discountCode').disabled = false; 
    document.getElementById('discountModal').classList.add('active'); 
}

window.editDiscount = (id) => { 
    currentEditId = id; 
    const d = discounts.find(x => x.MaGiamGia == id); 
    if (d) { 
        document.getElementById('discountCode').value = d.MaGiamGia; 
        document.getElementById('discountCode').disabled = true; 
        document.getElementById('discountValue').value = d.PhanTramGiam; 
        
        const toInputString = (dateStr) => { 
            if(!dateStr) return ""; 
            const date = new Date(dateStr); 
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); 
            return date.toISOString().slice(0, 16); 
        }; 
        
        document.getElementById('discountStart').value = toInputString(d.NgayBatDau); 
        document.getElementById('discountEnd').value = toInputString(d.NgayKetThuc); 
        document.getElementById('discountQuantity').value = d.SoLuong; 
        document.getElementById('discountModal').classList.add('active'); 
    } 
}

window.saveDiscount = async () => { 
    const p = { 
        MaGiamGia: document.getElementById('discountCode').value, 
        PhanTramGiam: Number(document.getElementById('discountValue').value), 
        NgayBatDau: document.getElementById('discountStart').value || null, 
        NgayKetThuc: document.getElementById('discountEnd').value || null, 
        SoLuong: document.getElementById('discountQuantity').value 
            ? Number(document.getElementById('discountQuantity').value) 
            : null 
    }; 
    
    const url = currentEditId 
        ? `${API_BASE_URL}/giamgias/${currentEditId}` 
        : `${API_BASE_URL}/giamgias`; 
    
    try { 
        const res = await fetch(url, { 
            method: currentEditId ? 'PUT' : 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(p) 
        }); 
        
        if (res.ok) { 
            alert('Lưu mã giảm giá thành công!'); 
            closeModal('discountModal'); 
            fetchDiscounts(); 
        } else { 
            const err = await res.json(); 
            alert('Lỗi: ' + (err.message || 'Không thể lưu')); 
        } 
    } catch (e) { 
        alert('Lỗi kết nối'); 
    } 
}

window.deleteDiscount = async (id) => { 
    if (confirm('Xóa?')) { 
        await fetch(`${API_BASE_URL}/giamgias/${id}`, { method: 'DELETE' }); 
        fetchDiscounts(); 
    } 
}


// ================================================================================
// KẾT THÚC FILE - END OF FILE
// ================================================================================