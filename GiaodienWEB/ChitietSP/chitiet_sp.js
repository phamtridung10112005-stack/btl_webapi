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
/////////////////////////////////
/////////rising amount
const up_amount = document.querySelector('.up_amount');
const down_amount = document.querySelector('.down_amount');
const amountSP = document.querySelector('.amount_sp');
up_amount.addEventListener('click', () => {
    if (amountSP.value < 100){
        let input_value1 = amountSP.value;
        input_value1++;
        amountSP.value = input_value1;
        // console.log(amountSP.value);
    }
    else{
        return;
    }
});
down_amount.addEventListener('click', () => {
    if (amountSP.value > 1){
        let input_value2 = amountSP.value;
        input_value2--;
        amountSP.value = input_value2;
        // console.log(amountSP.value);
    }
    else{
        return;
    }
});
amountSP.addEventListener('input', () => {
    let currentValue = parseInt(amountSP.value) || 0;
    const min = 1;
    max = 99;
    if (currentValue > max){
        amountSP.value = max;
    }
    else if (currentValue < min){
        amountSP.value = min;
    }
    // console.log(amountSP.value);
});
//////////////////////////////////////////////////////
//////btn up/down
let index_down = 1
function BtnDown() {
    const image = document.querySelectorAll('.image_thumbnail_item');
    const image_list = document.querySelector('.image_thumbnail_list');
    if (index_down < image.length) {
        let y = index_down * 68;
        image_list.style.transform = `translateY(${-y}px)`;
        index_down++;
        index_up--;
        // console.log(`${y}\n${index_down}\n${index_up}`);
    }
}
let index_up = 1
function BtnUp(){
    const image_list = document.querySelector('.image_thumbnail_list');
    if (index_up < 1){
        let y = index_up * 68;
        image_list.style.transform = `translateY(${y}px)`;
        index_up++;
        index_down--;
        // console.log(`${y}\n${index_down}\n${index_up}`);
    }
}
/////////////////////////////////
///////////Zoom
let images = document.querySelectorAll('.image');
let imageZoom = document.getElementById('ZoomImage');
images.forEach((item) => {
    item.addEventListener('mousemove', (ev) => {
        const ImageUrl = item.getAttribute('src');
        // console.log(ImageUrl);
        imageZoom.style.backgroundImage = `url('${ImageUrl}')`;
        imageZoom.style.setProperty('--display', 'block');
        let pointer = {
            x: (ev.offsetX * 100) / item.offsetWidth,
            y: (ev.offsetY * 100) / item.offsetHeight
        }
        // console.log(`${pointer.x}\t${pointer.y}`);
        imageZoom.style.setProperty('--zoom-x', pointer.x + '%');
        imageZoom.style.setProperty('--zoom-y', pointer.y + '%');
    });
    item.addEventListener('mouseout', () => {
        imageZoom.style.setProperty('--display', 'none');
    });
});
////////////////////////////////////
///////////chon sp
let image_thumbnail_items = document.querySelectorAll('.image_thumbnail_item');
const imageItems = document.querySelectorAll('.image_item');
const imageList = document.querySelector('.image_list')
image_thumbnail_items.forEach((item) => {
    item.addEventListener('click', () => {
        let index = item.dataset.volume;
        // console.log(index);
        imageList.style.transform = `translateX(${-index * 380}px)`;
    });
});
//////Share link san pham
const btn_share = document.querySelector('.btn_share');
const message = document.getElementById('message');
let timeAutoHide = 5;
let canClick = true;
function AutoHide(item){
    // console.log('auto hide');
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
btn_share.addEventListener('click', () => {
    // console.log(canClick);
    if (!canClick){
        return;
    }
    canClick = false;
    const urlPage = window.location.href;
    navigator.clipboard.writeText(urlPage)
        .then(() => {
            // console.log(urlPage);
            timeAutoHide = 5;
            message.style.transform = `translateY(${+100 + window.scrollY}px)`;
            AutoHide(message);
        })
        .catch(err => {
            console.error('Fail: ', err);
        });
});
/////////////////////////////////
//////Them vao gio hang message
const btn_addToCart = document.querySelector('.addToCart');
const addToCart_message = document.getElementById('addToCart_message');
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
/////////////////////////////////
///////////chuyen doi description
const btn_description = document.querySelector('.btn_description');
const btn_comment = document.querySelector('.btn_comment');
const description_content = document.querySelector('.description');
const comment_content = document.querySelector('.comment');

btn_description.addEventListener('click', () => {
    description_content.style.display = 'block';
    btn_description.style.background = '#22a7ff';
    comment_content.style.display = 'none';
    btn_comment.style.background = '#65c2ff';
});
btn_comment.addEventListener('click', () => {
    description_content.style.display = 'none';
    btn_description.style.background = '#65c2ff';
    comment_content.style.display = 'block';
    btn_comment.style.background = '#22a7ff';
});
//////////////////////////////////////
/////////chuyen doi form danh gia/form cau hoi
const btn_write = document.querySelector('.btn_write');
const btn_question = document.querySelector('.btn_question');
const form_review = document.querySelector('.form_review_container');
const form_question = document.querySelector('.form_question_container');
btn_write.addEventListener('click', () => {
    form_review.style.display = 'block';
    form_question.style.display = 'none';
});
btn_question.addEventListener('click', () => {
    form_review.style.display = 'none';
    form_question.style.display = 'block';
});
//////////////////////////////////////////////
///////them/xoa class active
const content_review_body_name = document.querySelectorAll('.content_review_body_name');
content_review_body_name.forEach((item) => {
    item.addEventListener('click', () => {
        content_review_body_name.forEach((i) => i.classList.remove('content_review--active'));
        item.classList.add('content_review--active');
    })
})
////////////////////////////