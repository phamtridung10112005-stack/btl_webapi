const LOGIN_API_URL = 'http://localhost:3000/api/auth/login';
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
async function Login() {
    // Lưu ý: Backend yêu cầu Email để đăng nhập
    // Mặc dù ID bên HTML là 'Username', nhưng người dùng cần nhập Email vào đây
    const emailVal = document.getElementById('Username').value.trim(); 
    const passwordVal = document.getElementById('pass').value.trim();
    const noteLogin = document.getElementById('note_login');

    noteLogin.style.display = 'none';

    if (!emailVal || !passwordVal) {
        noteLogin.innerText = "Vui lòng nhập Email và Mật khẩu.";
        noteLogin.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(LOGIN_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Backend yêu cầu key là 'email' và 'password'
            body: JSON.stringify({
                email: emailVal, 
                password: passwordVal
            })
        });

        const data = await response.json();

        if (response.ok) {
            // --- THÀNH CÔNG ---
            // Backend trả về: { "token": "..." }
            console.log("Login OK");

            // 1. Lưu Token
            localStorage.setItem('accessToken', data.token);

            // 2. Vì Backend không trả về thông tin User, ta lưu tạm Email để hiển thị
            localStorage.setItem('userEmail', emailVal);

            // 3. Đánh dấu trạng thái
            localStorage.setItem('isLogIn', 'true');

            alert("Đăng nhập thành công!");
            window.location.href = '../Trangchu/index.html';
        } else {
            // --- THẤT BẠI ---
            noteLogin.innerText = data.message || "Email hoặc mật khẩu không đúng.";
            noteLogin.style.display = 'block';
        }

    } catch (error) {
        console.error("Lỗi:", error);
        noteLogin.innerText = "Lỗi kết nối server!";
        noteLogin.style.display = 'block';
    }
}