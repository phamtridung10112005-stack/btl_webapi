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
////////main slider/////////////////
const main_slider = document.querySelector('.main_slider');
const slides = document.querySelector('.slider_list');
const img = document.querySelectorAll('.slider_list .slider_item');
const next_btn = document.querySelector('.next_btn');
const pre_btn = document.querySelector('.pre_btn');
let index = 0;
function showSlider(index){
    const width = img[0].clientWidth;
    let x = index * width;
    slides.style.transform = `translateX(${-x}px)`;
}
next_btn.addEventListener('click', () => {
    index = (index + 1) % img.length;
    showSlider(index);
    ResetAutoSlider();
});
pre_btn.addEventListener('click', () => {
    index = (index - 1 + img.length) % img.length;
    showSlider(index);
    ResetAutoSlider();
});
// setInterval(() => {
//     next_btn.click();
// }, 10000);
let setTimeoutID;
let timeAuto = 10;
function AutoSlider(){
    if (timeAuto == 0){
        next_btn.click();
        timeAuto = 10;
    }
    timeAuto--;
    // console.log(timeAuto);
    setTimeoutID = setTimeout(AutoSlider, 1000);
}
function ResetAutoSlider(){
    clearTimeout(setTimeoutID);
    timeAuto = 10;
    AutoSlider();
}
AutoSlider();
////////login/out/////////////////
const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
console.log(accounts);
function logout(){
    localStorage.removeItem('isLogIn');
    localStorage.removeItem('loggedInUser');
    document.getElementById('btn_dangnhap').style.display = 'block';
    document.getElementById('btn_dangky').style.display = 'block';
    document.getElementById('btn_dangxuat').style.display = 'none';
}
document.addEventListener('DOMContentLoaded', function(){
    const isLogIn = localStorage.getItem('isLogIn');
    if (isLogIn === 'true'){
        document.getElementById('btn_dangnhap').style.display = 'none';
        document.getElementById('btn_dangky').style.display = 'none';
        document.getElementById('btn_dangxuat').style.display = 'block';
    }
});
///////////////////////////////////////
/////////////back to head///////////////
const posision_scrollTop_btn = 750;
const scroll_btn = document.getElementById('scroll_btn');
window.addEventListener('scroll', () =>{
    if (window.scrollY > posision_scrollTop_btn){
        scroll_btn.style.display = 'block';
    }
    else{
        scroll_btn.style.display = 'none';
    }
})
///////////////////////////////////////////
//////Them vao gio hang message
let timeAutoHide = 5;
let canClick = true;
function AutoHide(item){
    // console.log('auto hide');
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
        // console.log(timeAutoHide);
    }
}
const listbtn_addToCart = document.querySelectorAll('.fa-cart-plus');
const addToCart_message = document.getElementById('addToCart_message');
listbtn_addToCart.forEach((btn_addToCart) => {
    btn_addToCart.addEventListener('click', () => {
        // console.log(canClick);
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
//////////////////Count Product in Cart////////////////
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
})
//////////////////////////////////////////////////////////////////
//////////////////Count Product in Wishlist////////////////
document.addEventListener('DOMContentLoaded', () => {
    const isWishList = JSON.parse(localStorage.getItem('wishlist')) || [];
    if (isWishList === null || isWishList.length === 0) {
        // console.log(0);
        // cartIcon.classList.remove('active');
        let styleCartIcon = document.querySelector('style[data-wishlist-icon]');
        styleCartIcon.remove();
    }
    else {
        // console.log(isCart.length);
        // cartIcon.classList.add('active');
        let styleWishlistIcon = document.querySelector('style[data-wishlist-icon]');
        if (!styleWishlistIcon) {
            styleWishlistIcon = document.createElement('style');
            styleWishlistIcon.setAttribute('data-wishlist-icon', 'true');
            document.head.appendChild(styleWishlistIcon)
        }
        styleWishlistIcon.textContent = `
            .sp_uathich::before {
                content: '`+ isWishList.length + `';
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
})
//////////////////////////////////////////////////////////////////
/////////////////////////Dem nguoc flash sale/////////////////////////
function CountDown(C){
    const dayElement = document.querySelector('.days');
    const hourElement = document.querySelector('.hours');
    const minuteElement = document.querySelector('.minutes');
    const secondElement = document.querySelector('.seconds');
    function UpdateTime(){
        const now = new Date().getTime();
        const timeRun = C - now;
        if (timeRun < 0){
            clearInterval(interval);
            return;
        }
        const days = Math.floor(timeRun / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRun % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRun % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRun % (1000 * 60)) / (1000));

        dayElement.textContent = days;
        hourElement.textContent = hours < 10 ? `0${hours}` :hours;
        minuteElement.textContent = minutes < 10 ? `0${minutes}` : minutes;
        secondElement.textContent = seconds < 10 ? `0${seconds}` : seconds;

        // console.log(`${days}\t${hours}\t${minutes}\t${seconds}`)
    }
    const interval = setInterval(UpdateTime, 1000);
    UpdateTime();
}
const Count = new Date("2025-01-31T00:00:00").getTime();
CountDown(Count);
//////////////////////////////////
///////////////////slider flash sale///////////////////
const sliderTrack = document.querySelector('.flash_sale_list_track');
const products = document.querySelectorAll('.flash_sale_item');
const next_btn_flash_sale = document.querySelector('.next-btn');
const pre_btn_flash_sale = document.querySelector('.pre-btn');
let index_flash_sale = 0;

////Tinh so luong san pham co the thay
function getItemsPerView(){
    const sliderWidth = document.querySelector('.flash_sale_list').offsetWidth;
    const productWidth = products[0].offsetWidth + 30;
    return Math.floor(sliderWidth / productWidth);
}
function updateSliderPosition(){
    const itemsPerView = getItemsPerView();
    const totalSliders = Math.ceil(products.length / itemsPerView);
    if (index_flash_sale >= totalSliders) {
        index_flash_sale = totalSliders - 1;
    }
    const slideWidth = itemsPerView * (products[0].offsetWidth + 30);
    sliderTrack.style.transform = `translateX(-${index_flash_sale * slideWidth}px)`;
}
next_btn_flash_sale.addEventListener('click', () => {
    const itemsPerView = getItemsPerView();
    const totalSliders = Math.ceil(products.length / itemsPerView);
    index_flash_sale = Math.min(index_flash_sale + 1, totalSliders - 1);
    updateSliderPosition();
});
pre_btn_flash_sale.addEventListener('click', () => {
    index_flash_sale = Math.max(index_flash_sale - 1, 0);
    updateSliderPosition();
});
window.addEventListener('resize', updateSliderPosition);
updateSliderPosition();

///////////////////////////////////