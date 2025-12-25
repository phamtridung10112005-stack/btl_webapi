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
function Login(){
    const user_name = document.getElementById('Username').value;
    const password = document.getElementById('pass').value;
    if (user_name === '' || password === ''){
        document.getElementById('note_login').style.display = 'block';
        return;
    }
    console.log(user_name);
    console.log(password);
    const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    console.log(accounts);
    const userAccount = accounts.find((account) => account.user === user_name && account.password === password);
    if (userAccount){
        localStorage.setItem('loggedInUser', JSON.stringify(userAccount));
        localStorage.setItem('isLogIn', 'true');
        window.location.href = '../Trangchu/index.html';
    }
    else{
        document.getElementById('note_login').style.display = 'block';
    }
}