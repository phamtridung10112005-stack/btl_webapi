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
            const books = responseData.data;
            console.log(books);

            // GỌI HÀM RENDER CỦA NGƯỜI DÙNG, truyền dữ liệu vào
            if (typeof settings.renderFunction === 'function') {
                settings.renderFunction(books, settings.containerId);
            }

            const totalPages = responseData.pagination ? responseData.pagination.tongSoTrang : 0;
            renderPagination(totalPages);
        } catch (error) {
            console.error("Lỗi khi tải sản phẩm:", error);
        }
    }

    // 2. Hàm phân trang (Giữ nguyên logic của bạn, chỉ sửa selector)
    function renderPagination(totalPages) {
        const container = document.getElementById(settings.paginationId);
        if (!container) return;

        if (totalPages <= 1) {
            container.style.display = 'none';
            return;
        } else {
            container.style.display = 'flex';
        }
        container.innerHTML = '';
        
        // (Bạn copy đoạn code phân trang cũ vào đây là được)
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