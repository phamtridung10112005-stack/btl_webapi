// product-loader.js

export function initProductLoader(config) {
    // Cấu hình mặc định + cấu hình người dùng truyền vào
    const settings = {
        apiUrl: config.apiUrl,
        containerId: config.containerId || 'product-container',
        paginationId: config.paginationId || 'control-next-pre-Page',
        sortSelectId: config.sortSelectId || 'sort_pro',
        limit: config.limit || 24,
        // ĐÂY LÀ CHÌA KHÓA: Hàm render được truyền vào từ bên ngoài
        renderFunction: config.renderFunction 
    };

    let currentState = {
        currentPage: 1,
        limit: settings.limit,
        sortBy: 'defaut',
        orderBy: 'defaut'
    };

    // 1. Hàm load dữ liệu
    async function loadProducts(sortBy, orderBy) {
        try {
            const url = `${settings.apiUrl}page=${currentState.currentPage}&limit=${currentState.limit}&sortBy=${sortBy}&order=${orderBy}`;
            console.log("Fetching:", url);

            const token = localStorage.getItem('accessToken') || '';
            const headers = {
                'Content-Type': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            } else {
                console.log("error token");
            }
            
            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });

            if (response.status === 401) {
                console.log("Lỗi 401: Chưa đăng nhập hoặc Token hết hạn");
                return;
            }
            const responseData = await response.json();
            // console.log("RP Data", responseData);
            const books = responseData.data;
            console.log("Sach:", books);

            // GỌI HÀM RENDER CỦA NGƯỜI DÙNG, truyền dữ liệu vào
            if (typeof settings.renderFunction === 'function') {
                settings.renderFunction(books, settings.containerId);
            }

            const totalPages = responseData.pagination ? responseData.pagination.totalPages || responseData.pagination.tongSoTrang : 0;
            renderPagination(totalPages);
        } catch (error) {
            console.error("Lỗi khi tải sản phẩm:", error);
        }
    }

    // 2. Hàm phân trang (Logic ĐÃ SỬA)
    function renderPagination(totalPages) {
        const container = document.getElementById(settings.paginationId);
        if (!container) return;

        // Nếu chỉ có 1 trang hoặc không có trang nào thì ẩn đi
        if (totalPages <= 1) {
            container.style.display = 'none';
            return;
        } else {
            container.style.display = 'flex';
        }
        container.innerHTML = '';

        // --- LOGIC TÍNH TOÁN (ĐÃ SỬA) ---
        // Số lượng nút tối đa muốn hiển thị (ví dụ 5 nút: 2 trái + 1 giữa + 2 phải)
        const maxVisibleButtons = 5; 
        
        // Bước 1: Tính toán khoảng lý tưởng (Trang hiện tại nằm giữa)
        // Ví dụ max=5 -> offset=2 (2 bên trái, 2 bên phải)
        const sideOffset = Math.floor(maxVisibleButtons / 2);
        
        let startPage = currentState.currentPage - sideOffset;
        let endPage = currentState.currentPage + sideOffset;

        // Bước 2: Xử lý tràn đầu (startPage < 1)
        if (startPage < 1) {
            // Nếu bị tràn bên trái, ta đẩy dồn sang phải để cố gắng đủ 5 nút
            // Ví dụ: Đang ở trang 1. start = 1-2 = -1. 
            // Ta cộng bù (1 - startPage) vào endPage.
            endPage = endPage + (1 - startPage);
            startPage = 1;
        }

        // Bước 3: Xử lý tràn đuôi (endPage > totalPages)
        if (endPage > totalPages) {
            // Nếu bị tràn bên phải, ta đẩy dồn ngược về trái
            // Ví dụ: Tổng 6 trang, đang ở trang 6. end = 6+2 = 8.
            // Ta trừ bù (endPage - totalPages) vào startPage.
            startPage = startPage - (endPage - totalPages);
            endPage = totalPages;
        }

        // Bước 4: Chốt chặn cuối cùng (Đảm bảo startPage không bao giờ < 1)
        // Trường hợp tổng số trang (totalPages) nhỏ hơn maxVisibleButtons (ví dụ chỉ có 2 trang)
        // Thì bước 3 ở trên sẽ làm startPage bị âm. Ta cần reset lại về 1.
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
        // console.log("EDP", endPage);
        // console.log("TTP", totalPages);
        // 2. Tạo các nút SỐ TRANG
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.innerText = i;
            
            if (i === currentState.currentPage) {
                pageBtn.classList.add('active'); 
                // Style cứng (nếu chưa có CSS)
                pageBtn.style.backgroundColor = '#22a7ff'; 
                pageBtn.style.color = '#fff';
            }

            pageBtn.onclick = () => {
                if (currentState.currentPage !== i) { 
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

    // 3. Xử lý Sort
    function handleSort(sortString) {
        if(!sortString) return;
        const parts = sortString.split('-');
        currentState.sortBy = parts[0];
        currentState.orderBy = parts[1];
        currentState.currentPage = 1;
        loadProducts(currentState.sortBy, currentState.orderBy);
    }

    // 4. Khởi chạy
    const sortSelect = document.getElementById(settings.sortSelectId);
    if (sortSelect) {
        // Load lần đầu
        handleSort(sortSelect.value);
        
        // Sự kiện change
        sortSelect.addEventListener('change', (e) => handleSort(e.target.value));
    } else {
        // Nếu trang không có nút sort thì load mặc định
        loadProducts('defaut', 'defaut');
    }
}