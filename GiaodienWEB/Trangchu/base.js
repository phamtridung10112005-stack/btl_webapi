//////Xu li load trang
document.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', (ev) => {
        const href = link.getAttribute('href');
        if (href === '#' || href === ''){
            ev.preventDefault(); //////chan hanh vi mac dinh
            // console.log('Ko load trang');
        }
    });
});
////////////////////////////////////////////
////////////////Login/Logout
function logout() {
    localStorage.removeItem('isLogIn');
    document.getElementById('btn_dangnhap').style.display = 'block';
    document.getElementById('btn_dangky').style.display = 'block';
    document.getElementById('btn_dangxuat').style.display = 'none';
}
document.addEventListener('DOMContentLoaded', () => {
    const isLogIn = localStorage.getItem('isLogIn');
    if (isLogIn == 'true') {
        document.getElementById('btn_dangnhap').style.display = 'none';
        document.getElementById('btn_dangky').style.display = 'none';
        document.getElementById('btn_dangxuat').style.display = 'block';
    }
    else {
        document.getElementById('btn_dangnhap').style.display = 'block';
        document.getElementById('btn_dangky').style.display = 'block';
        document.getElementById('btn_dangxuat').style.display = 'none';
    }
});
/////////////////////////////////////////////
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
/////////////////////////////////
document.addEventListener('DOMContentLoaded', () => {
    const isCart = JSON.parse(localStorage.getItem('cart')) || [];
    if (isCart === null || isCart.length === 0) {
        // console.log(0);
        // cartIcon.classList.remove('active');
        let styleCartIcon = document.querySelector('style[data-cart-icon]');
        styleCartIcon.remove();
    }
    else {
        // console.log(isCart.length);
        // cartIcon.classList.add('active');
        let styleCartIcon = document.querySelector('style[data-cart-icon]');
        if (!styleCartIcon) {
            styleCartIcon = document.createElement('style');
            styleCartIcon.setAttribute('data-cart-icon', 'true');
            document.head.appendChild(styleCartIcon)
        }
        styleCartIcon.textContent = `
            .giohang::before {
                content: '`+ isCart.length + `';
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
});
//////Them vao gio hang message
let timeAutoHide = 5;
let canClick = true;
console.log('zzz');
function AutoHide(item){
    console.log('auto hide');
    console.log(window.scrollY);
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
        console.log(timeAutoHide);
    }
}
const listbtn_addToCart = document.querySelectorAll('.fa-cart-plus');
if (listbtn_addToCart) {
    console.log('true');
}
const addToCart_message = document.getElementById('addToCart_message');
if (addToCart_message) {
    console.log('true');
}
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