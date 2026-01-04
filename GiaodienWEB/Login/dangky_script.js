const REGISTER_API_URL = 'http://localhost:3000/api/auth/register';

var hide = true;
function Show_Pass(){
    if (hide){
        document.getElementById('pass').type = 'text';
        document.getElementById('show').id = 'hide';
        hide = false;
    }
    else{
        document.getElementById('pass').type = 'password';
        document.getElementById('hide').id = 'show';
        hide = true
    }
}
async function CreateAccount() {
    // a. Lấy dữ liệu từ HTML
    // Lưu ý: ID phải khớp chính xác với file HTML bạn gửi
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('pass').value.trim();
    const username = document.getElementById('registerUsName').value.trim(); // Tên hiển thị
    const phone = document.getElementById('registerPhone').value.trim();

    // b. Lấy các thẻ hiển thị lỗi
    const noteTT = document.getElementById('note_tt');
    const noteEmail = document.getElementById('note_email');
    const notePhone = document.getElementById('note_phone');

    // c. Reset trạng thái lỗi (ẩn hết đi trước khi kiểm tra)
    noteTT.style.display = 'none';
    noteEmail.style.display = 'none';
    if(notePhone) notePhone.style.display = 'none';

    // d. Validate phía Client (Kiểm tra rỗng)
    if (!email || !password || !username || !phone) {
        noteTT.innerText = "Vui lòng điền đầy đủ thông tin.";
        noteTT.style.display = 'block';
        return; // Dừng lại, không gọi API
    }

    // e. Gọi API Node.js để lưu vào Database
    try {
        const response = await fetch(REGISTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username, // Map với 'username' trong database
                email: email,
                password: password,
                phone: phone,
                role: 'USER' // Mặc định là user
            })
        });

        const data = await response.json();

        // f. Xử lý kết quả trả về
        if (response.ok) {
            // --- THÀNH CÔNG (HTTP 201) ---
            alert("Đăng ký tài khoản thành công! Hãy đăng nhập ngay.");
            
            // Chuyển thẳng về trang đăng nhập (bỏ qua trang xác nhận)
            window.location.href = 'dangnhap.html'; 
        } else {
            // --- THẤT BẠI (Lỗi từ Backend trả về) ---
            const msg = data.message || "Đăng ký thất bại";

            // Logic hiển thị lỗi thông minh dựa trên tin nhắn Server
            if (msg.includes("Email")) {
                noteEmail.innerText = "Email này đã được sử dụng.";
                noteEmail.style.display = 'block';
            } else if (msg.includes("Phone") || msg.includes("số điện thoại")) {
                if(notePhone) {
                    notePhone.innerText = "Số điện thoại đã tồn tại.";
                    notePhone.style.display = 'block';
                } else {
                    alert(msg);
                }
            } else {
                // Lỗi chung chung thì hiện ở note_tt hoặc alert
                noteTT.innerText = msg;
                noteTT.style.display = 'block';
            }
        }

    } catch (error) {
        // Lỗi mạng hoặc Server chưa bật
        console.error("Error:", error);
        alert("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    }
}