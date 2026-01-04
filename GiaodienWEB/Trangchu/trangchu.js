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
//////////////////////////////////
////////countdown flash sale/////////////////
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
const Count = new Date("2026-01-31T00:00:00").getTime();
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