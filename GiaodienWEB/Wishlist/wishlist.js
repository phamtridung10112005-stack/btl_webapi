function formatCurrency(number){
    return number.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}
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
//////////////////////////////////////////////////////////////////////////
/////////////////////add to wish list//////////////////////////////////
let listWishList = JSON.parse(localStorage.getItem('wishlist')) || [];
console.log('wishlist');
console.log(listWishList);
function addToWishList(item){
    const listWL = document.querySelectorAll('.wishlist');
    console.log()
    if (listWishList == null){
        listWishList = [item];
    }
    else{
        let exist = false;
        for (temp of listWishList){
            if (temp.id === item.id){
                listWL.forEach((itemWL) => {
                    if (itemWL.dataset.id === item.id) {
                        itemWL.classList.remove('active');
                    }
                })
                const indexWLremove = listWishList.findIndex((itemWLremove) => itemWLremove.id === item.id);
                listWishList.splice(indexWLremove, 1);
                console.log(0);
                exist = true;
                break;
            }
        }
        if (!exist){
            listWishList.push(item);
            console.log('+1 tym');
        }
    }
    localStorage.setItem('wishlist', JSON.stringify(listWishList));
    location.reload();
    console.log(listWishList);
}
///////////////////////////////////////////////////////
/////////////////////load wish list//////////////////////////////////
function loadWishList(){
    var str = '';
    for (item of listWishList){
        str += `
            <div class="wishlist_item">
                <div class="wishlist_item_img">
                    <a href="`+ item.url + `">
                        <img src="`+ item.image + `" alt="">
                    </a>
                    <div class="discount">-`+ item.discount + `%</div>
                </div>
                <div class="wishlist_item_title"><a href="`+ item.url + `">`+ item.name + `</a></div>
                <div class="wishlist_item_prices">
                    <div class="wishlist_item_priceSale">`+ formatCurrency(item.priceSale) + `</div>
                    <div class="wishlist_item_priceOriginal"><s>`+ formatCurrency(item.priceOriginal) + `</s></div>
                </div>
                <div class="wishlist_item_footer">
                    <div class="wishlist_item_sold">
                        <img src="../Image/fire.png" alt="">  Đã bán `+ item.sold + `k+
                    </div>
                    <div class="wishlist_item_cart">
                        <i onclick="addToCart({id: '`+ item.id + `', url:'`+ item.url + `', image:'`+ item.image + `', name: '`+ item.name + `', priceOriginal: `+ item.priceOriginal + `, priceSale: `+ item.priceSale + `})" class="fa-solid fa-cart-plus"></i>
                    </div>
                </div>
            </div>
        `;
    }
    document.querySelector('.wishlist_container').innerHTML = str;
}
/////////////////////////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', () => {
    const listWL = document.querySelectorAll('.wishlist');
    // console.log(listWL.length);
    listWL.forEach((itemWL) => {
        for (let itemlistWishList of listWishList) {
            if (itemWL.dataset.id === itemlistWishList.id) {
                itemWL.classList.add('active');
            }
        }
    });
});

loadWishList();