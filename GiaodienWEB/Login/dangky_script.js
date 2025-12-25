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
function CreateAccount(){
    const user = document.getElementById('registerUser').value;
    const password = document.getElementById('pass').value;
    const nameaccount = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    if (user === '' || password === '' || nameaccount === '' || email === ''){
        document.getElementById('note_tt').style.display = 'block';
        return;
    }
    else{
        document.getElementById('note_tt').style.display = 'none';
    }
    const account = {
        user: user,
        password: password,
        nameaccount: nameaccount,
        email: email
    };
    let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    const isExistingUser = accounts.some((acc) => acc.user === user);
    if (isExistingUser){
        document.getElementById('note_user').style.display = 'block';
        return;
    }
    else{
        document.getElementById('note_user').style.display = 'none';
    }
    const isExistingEmail = accounts.some((acc) => acc.email === email);
    if (isExistingEmail){
        document.getElementById('note_email').style.display = 'block';
        return;
    }
    else {
        document.getElementById('note_email').style.display = 'none';
    }
    accounts.push(account);
    localStorage.setItem('accounts', JSON.stringify(accounts));
    alert('Đăng ký thành công!');
    window.location.href = 'dangnhap.html'
}