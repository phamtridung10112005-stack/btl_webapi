// ===== CẤU HÌNH API =====
const API_BASE_URL = 'http://localhost:3000/api';
let authToken = localStorage.getItem('authToken') || null;

// Biến lưu dữ liệu
let books = [],
    categories = [],
    publishers = [],
    authors = [],
    orders = [],
    customers = [],
    discounts = [];
let currentEditId = null;
let revenueChart = null;

// Biến dùng cho Modal Quản lý Sách - Tác Giả
let manageAuthorIds = [];
let currentManageBook = null;

// ===== 1. CORE FUNCTIONS =====

async function fetchWithAuth(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

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

function parseRes(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.rows)) return data.rows;
    if (data && Array.isArray(data.content)) return data.content;
    return [];
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount || 0);
}

// ===== 2. INIT & LOGIN =====

document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('dashboard').style.display = 'flex';
        initData();
    } else {
        document.getElementById('loginPage').style.display = 'flex';
        document.getElementById('dashboard').style.display = 'none';
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            try {
                const res = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                });
                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem('authToken', data.token || data.accessToken);
                    location.reload();
                } else alert(data.message || 'Đăng nhập thất bại!');
            } catch (err) {
                alert('Lỗi kết nối Server!');
            }
        });
    }
});

async function initData() {
    console.log("Đang tải dữ liệu...");
    await Promise.all([fetchCategories(), fetchPublishers(), fetchAuthors()]);
    await fetchBooks();
    await fetchOrders();
    await fetchDiscounts();
    await fetchCustomers();
    updateDashboardStats();
    renderBookAuthorsTable();
}

// ===== 3. GLOBAL FUNCTIONS =====

window.handleLogout = function() {
    localStorage.removeItem('authToken');
    location.reload();
};

window.switchPage = function(pageId, element) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    if (element) element.classList.add('active');

    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    const target = document.getElementById(pageId + 'Page');
    if (target) {
        target.classList.add('active');
        if (pageId === 'bookAuthors') renderBookAuthorsTable();
    }
};

window.closeModal = function(modalId) {
    document.getElementById(modalId).classList.remove('active');
};

// ===== 4. DASHBOARD =====

function updateDashboardStats() {
    if (document.getElementById('totalBooks')) document.getElementById('totalBooks').innerText = books.length;
    if (document.getElementById('totalCustomers')) document.getElementById('totalCustomers').innerText = customers.length;
    if (document.getElementById('totalOrders')) document.getElementById('totalOrders').innerText = orders.length;

    const validOrders = orders.filter(o => o.TrangThai === 'DaGiao');
    const totalRev = validOrders.reduce((sum, o) => sum + (Number(o.TongTien) || 0), 0);
    if (document.getElementById('totalRevenue')) document.getElementById('totalRevenue').innerText = formatCurrency(totalRev);

    renderRevenueChart();
    renderTopBooks();
}

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

    if (revenueChart) revenueChart.destroy();

    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
            datasets: [{
                label: 'Doanh thu thực tế (VNĐ)',
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

function renderTopBooks() {
    const list = document.getElementById('topBooksList');
    if (!list) return;
    const topBooks = [...books].sort((a, b) => (b.SoLuongDaBan || 0) - (a.SoLuongDaBan || 0)).slice(0, 5);
    list.innerHTML = topBooks.map((b, i) => {
        const img = (b.LinkHinhAnh && b.LinkHinhAnh.startsWith('http')) ? b.LinkHinhAnh : 'https://via.placeholder.com/50';
        return `
            <div class="ranking-item">
                <div class="rank-index">${i + 1}</div>
                <img src="${img}" class="rank-thumb">
                <div class="rank-info">
                    <h4>${b.TenSach}</h4>
                    <p>Đã bán: <strong>${b.SoLuongDaBan || 0}</strong></p>
                </div>
            </div>`;
    }).join('');
}

// ===== 5. FETCH & RENDER =====

async function fetchCategories() {
    try {
        const res = await fetch(`${API_BASE_URL}/theloais`);
        categories = parseRes(await res.json());
        renderCategories();
    } catch (e) {}
}
async function fetchAuthors() {
    try {
        const res = await fetch(`${API_BASE_URL}/tacgias`);
        authors = parseRes(await res.json());
        renderAuthors();
    } catch (e) {}
}
async function fetchPublishers() {
    try {
        const res = await fetch(`${API_BASE_URL}/nhaxuatbans`);
        publishers = parseRes(await res.json());
        renderPublishers();
    } catch (e) {}
}
async function fetchCustomers() {
    try {
        const res = await fetchWithAuth('/users');
        const all = parseRes(await res.json());
        customers = all.filter(u => u.role === 'USER');
        document.getElementById('customersTableBody').innerHTML = customers.map(c => `<tr><td>${c.username}</td><td>${c.email}</td><td>${c.phone||'-'}</td><td>${c.role}</td></tr>`).join('');
    } catch (e) {}
}
async function fetchDiscounts() {
    try {
        const res = await fetch(`${API_BASE_URL}/giamgias`);
        discounts = parseRes(await res.json());
        document.getElementById('discountsTableBody').innerHTML = discounts.map(d => `<tr><td>${d.MaGiamGia}</td><td>${d.PhanTramGiam}%</td><td class="text-center"><button class="btn-sm btn-edit" onclick="editDiscount('${d.MaGiamGia}')"><i class="fas fa-edit"></i></button><button class="btn-sm btn-delete" onclick="deleteDiscount('${d.MaGiamGia}')"><i class="fas fa-trash"></i></button></td></tr>`).join('');
    } catch (e) {}
}
async function fetchOrders() {
    try {
        const res = await fetch(`${API_BASE_URL}/hoadons`);
        orders = parseRes(await res.json());
        document.getElementById('ordersTableBody').innerHTML = orders.map(o => `<tr><td>#${o.MaHoaDon}</td><td>${o.user_id}</td><td>${new Date(o.NgayLap).toLocaleDateString()}</td><td>${formatCurrency(o.TongTien)}</td><td><span style="color:${o.TrangThai==='DaGiao'?'green':'orange'}">${o.TrangThai}</span></td></tr>`).join('');
    } catch (e) {}
}

async function fetchBooks() {
    try {
        const res = await fetch(`${API_BASE_URL}/sachs?page=1&size=1000&sortBy=MaSach&sortOrder=DESC`);
        books = parseRes(await res.json());
        renderBooks();
        renderBookAuthorsTable();
    } catch (e) {}
}

function renderBooks() {
    const t = document.getElementById('booksTableBody');
    if (t) {
        t.innerHTML = books.map(b => {
            const cat = categories.find(c => c.MaTheLoai == b.MaTheLoai)?.TenTheLoai || '---';
            const img = b.LinkHinhAnh?.startsWith('http') ? b.LinkHinhAnh : 'https://via.placeholder.com/50';
            const dichGia = b.TenNguoiDich ? b.TenNguoiDich : '(Gốc)';
            return `
            <tr>
                <td><img src="${img}" class="book-thumb"></td>
                <td><strong>${b.TenSach}</strong></td>
                <td>${dichGia}</td>
                <td>${cat}</td>
                <td style="color:var(--primary);font-weight:bold">${formatCurrency(b.GiaSach)}</td>
                <td>${b.SoLuongDaBan||0}</td>
                <td class="text-center">
                    <button class="btn-sm btn-edit" onclick="editBook(${b.MaSach})"><i class="fas fa-edit"></i></button>
                    <button class="btn-sm btn-delete" onclick="deleteBook(${b.MaSach})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        }).join('');
    }
}

// ===== 6. QUẢN LÝ SÁCH - TÁC GIẢ =====

function renderBookAuthorsTable() {
    const tbody = document.getElementById('bookAuthorsTableBody');
    if (!tbody) return;
    tbody.innerHTML = books.map(b => `
        <tr>
            <td>#${b.MaSach}</td>
            <td style="font-weight:500">${b.TenSach}</td>
            <td style="color:#666; font-style:italic">(Bấm nút Quản lý để xem chi tiết)</td>
            <td class="text-center">
                <button class="btn-sm btn-edit" onclick="openAuthorManager(${b.MaSach})" style="width:auto; padding:5px 15px">
                    <i class="fas fa-users-cog"></i> Quản lý Tác Giả
                </button>
            </td>
        </tr>
    `).join('');
}

window.openAuthorManager = async function(bookId) {
    try {
        const res = await fetch(`${API_BASE_URL}/sachs/${bookId}`);
        const book = await res.json();

        currentManageBook = book;
        manageAuthorIds = book.AuthorIds || [];

        document.getElementById('manageBookTitle').innerText = book.TenSach;
        document.getElementById('manageBookId').value = book.MaSach;

        const select = document.getElementById('manageAuthorSelect');
        select.innerHTML = '<option value="">-- Chọn thêm tác giả --</option>' +
            authors.map(a => `<option value="${a.MaTacGia}">${a.TenTacGia}</option>`).join('');

        renderManageAuthorTags();
        document.getElementById('authorManagerModal').classList.add('active');
    } catch (e) {
        alert('Lỗi tải thông tin sách!');
    }
}

window.addManagerAuthorTag = function() {
    const sel = document.getElementById('manageAuthorSelect');
    const id = parseInt(sel.value);
    if (!id) return;
    if (!manageAuthorIds.includes(id)) {
        manageAuthorIds.push(id);
        renderManageAuthorTags();
    }
    sel.value = "";
}

window.removeManagerAuthorTag = function(id) {
    manageAuthorIds = manageAuthorIds.filter(x => x !== id);
    renderManageAuthorTags();
}

function renderManageAuthorTags() {
    const box = document.getElementById('manageAuthorsContainer');
    if (manageAuthorIds.length === 0) {
        box.innerHTML = '<p style="color:#999; padding:10px; font-style:italic">Chưa có tác giả nào.</p>';
        return;
    }
    box.innerHTML = manageAuthorIds.map(id => {
        const auth = authors.find(x => x.MaTacGia == id);
        return `<div class="author-tag">${auth ? auth.TenTacGia : 'Unknown'} <i class="fas fa-times-circle" onclick="removeManagerAuthorTag(${id})"></i></div>`;
    }).join('');
}

window.saveBookAuthorsRelation = async function() {
    if (!currentManageBook) return;
    const payload = {
        ...currentManageBook,
        AuthorIds: manageAuthorIds
    };
    try {
        const url = `${API_BASE_URL}/sachs/${currentManageBook.MaSach}`;
        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            alert('Cập nhật tác giả thành công!');
            closeModal('authorManagerModal');
        } else alert('Lỗi cập nhật!');
    } catch (e) {
        alert('Lỗi kết nối!');
    }
}

// ===== 7. CRUD FUNCTIONS (ĐÃ FIX LỖI ZOD UNDEFINED) =====

function populateDropdowns() {
    const c = document.getElementById('bookCategory');
    const p = document.getElementById('bookPublisher');
    if (c) c.innerHTML = categories.map(i => `<option value="${i.MaTheLoai}">${i.TenTheLoai}</option>`).join('');
    if (p) p.innerHTML = publishers.map(i => `<option value="${i.MaNXB}">${i.TenNXB}</option>`).join('');
}

// --- BOOK ---
window.openAddBookModal = function() {
    currentEditId = null;
    document.getElementById('bookForm').reset();
    populateDropdowns();
    document.getElementById('bookModal').classList.add('active');
}

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
        if (b.NamXuatBan) document.getElementById('bookYear').value = new Date(b.NamXuatBan).toISOString().split('T')[0];
        document.getElementById('bookPages').value = b.SoTrang || 0;
        document.getElementById('bookSold').value = b.SoLuongDaBan || 0;
        document.getElementById('bookImage').value = b.LinkHinhAnh || '';
        document.getElementById('bookDescription').value = b.MoTaNoiDung || '';
        document.getElementById('bookModal').classList.add('active');
    }
}

window.saveBook = async () => {
    const tenSach = document.getElementById('bookName').value;
    const giaSach = document.getElementById('bookPrice').value;
    const maTheLoai = document.getElementById('bookCategory').value;
    const maNXB = document.getElementById('bookPublisher').value;
    const namXB = document.getElementById('bookYear').value;
    const soTrang = document.getElementById('bookPages').value;

    if (!tenSach || !giaSach || !maTheLoai || !maNXB) return alert('Nhập đủ thông tin!');

    const p = {
        TenSach: tenSach,
        GiaSach: Number(giaSach),
        MaTheLoai: Number(maTheLoai),
        MaNXB: Number(maNXB),
        NamXuatBan: namXB ? new Date(namXB) : new Date(),
        SoTrang: Number(soTrang) || 0,
        LinkHinhAnh: document.getElementById('bookImage').value,
        MoTaNoiDung: document.getElementById('bookDescription').value,
        SoLuongDaBan: Number(document.getElementById('bookSold').value) || 0,
        TenNguoiDich: document.getElementById('bookTranslator').value
    };
    const url = currentEditId ? `${API_BASE_URL}/sachs/${currentEditId}` : `${API_BASE_URL}/sachs`;
    try {
        const res = await fetch(url, {
            method: currentEditId ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(p)
        });
        if (res.ok) {
            alert('Thành công');
            closeModal('bookModal');
            fetchBooks();
        } else alert('Lỗi');
    } catch (e) {
        alert('Lỗi kết nối');
    }
}

window.deleteBook = async (id) => {
    if (confirm('Xóa?')) {
        await fetch(`${API_BASE_URL}/sachs/${id}`, {
            method: 'DELETE'
        });
        fetchBooks();
    }
}

// --- CATEGORY ---
function renderCategories() {
    document.getElementById('categoriesTableBody').innerHTML = categories.map(c =>
        `<tr>
            <td>${c.MaTheLoai}</td>
            <td>${c.TenTheLoai}</td>
            <td class="text-center">
                <button class="btn-sm btn-edit" onclick="editCategory(${c.MaTheLoai})"><i class="fas fa-edit"></i></button>
                <button class="btn-sm btn-delete" onclick="deleteCategory(${c.MaTheLoai})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`
    ).join('');
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
    // FIX: Gửi MaTheLoai = 0 nếu là thêm mới
    const payload = {
        TenTheLoai: document.getElementById('categoryName').value,
        MaTheLoai: currentEditId ? Number(currentEditId) : 0
    };
    await fetch(currentEditId ? `${API_BASE_URL}/theloais/${currentEditId}` : `${API_BASE_URL}/theloais`, {
        method: currentEditId ? 'PUT' : 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    closeModal('categoryModal');
    fetchCategories();
}

window.deleteCategory = async (id) => {
    if (confirm('Xóa?')) {
        await fetch(`${API_BASE_URL}/theloais/${id}`, {
            method: 'DELETE'
        });
        fetchCategories();
    }
}

// --- AUTHOR ---
function renderAuthors() {
    document.getElementById('authorsTableBody').innerHTML = authors.map(a =>
        `<tr>
            <td>${a.MaTacGia}</td>
            <td>${a.TenTacGia}</td>
            <td>${a.MoTa||'-'}</td>
            <td class="text-center">
                <button class="btn-sm btn-edit" onclick="editAuthor(${a.MaTacGia})"><i class="fas fa-edit"></i></button>
                <button class="btn-sm btn-delete" onclick="deleteAuthor(${a.MaTacGia})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`
    ).join('');
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
    // FIX: Gửi MaTacGia = 0 nếu là thêm mới
    const payload = {
        TenTacGia: document.getElementById('authorName').value,
        MoTa: document.getElementById('authorDesc').value,
        MaTacGia: currentEditId ? Number(currentEditId) : 0
    };
    await fetch(currentEditId ? `${API_BASE_URL}/tacgias/${currentEditId}` : `${API_BASE_URL}/tacgias`, {
        method: currentEditId ? 'PUT' : 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    closeModal('authorModal');
    fetchAuthors();
}

window.deleteAuthor = async (id) => {
    if (confirm('Xóa?')) {
        await fetch(`${API_BASE_URL}/tacgias/${id}`, {
            method: 'DELETE'
        });
        fetchAuthors();
    }
}

// --- PUBLISHER ---
function renderPublishers() {
    document.getElementById('publishersTableBody').innerHTML = publishers.map(p =>
        `<tr>
            <td>${p.MaNXB}</td>
            <td>${p.TenNXB}</td>
            <td>${p.DiaChi||'-'}</td>
            <td>${p.SoDienThoai||'-'}</td>
            <td class="text-center">
                <button class="btn-sm btn-edit" onclick="editPublisher(${p.MaNXB})"><i class="fas fa-edit"></i></button>
                <button class="btn-sm btn-delete" onclick="deletePublisher(${p.MaNXB})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`
    ).join('');
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
    // FIX: Gửi MaNXB = 0 nếu là thêm mới
    const payload = {
        TenNXB: document.getElementById('publisherName').value,
        DiaChi: document.getElementById('publisherAddress').value,
        SoDienThoai: document.getElementById('publisherPhone').value,
        MaNXB: currentEditId ? Number(currentEditId) : 0
    };
    await fetch(currentEditId ? `${API_BASE_URL}/nhaxuatbans/${currentEditId}` : `${API_BASE_URL}/nhaxuatbans`, {
        method: currentEditId ? 'PUT' : 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    closeModal('publisherModal');
    fetchPublishers();
}

window.deletePublisher = async (id) => {
    if (confirm('Xóa?')) {
        await fetch(`${API_BASE_URL}/nhaxuatbans/${id}`, {
            method: 'DELETE'
        });
        fetchPublishers();
    }
}

// --- DISCOUNT ---
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
        document.getElementById('discountModal').classList.add('active');
    }
}

window.saveDiscount = async () => {
    // FIX: Chuyển đổi PhanTramGiam sang Number
    const p = {
        MaGiamGia: document.getElementById('discountCode').value,
        PhanTramGiam: Number(document.getElementById('discountValue').value)
    };
    const url = currentEditId ? `${API_BASE_URL}/giamgias/${currentEditId}` : `${API_BASE_URL}/giamgias`;
    await fetch(url, {
        method: currentEditId ? 'PUT' : 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(p)
    });
    closeModal('discountModal');
    fetchDiscounts();
}

window.deleteDiscount = async (id) => {
    if (confirm('Xóa?')) {
        await fetch(`${API_BASE_URL}/giamgias/${id}`, {
            method: 'DELETE'
        });
        fetchDiscounts();
    }
}