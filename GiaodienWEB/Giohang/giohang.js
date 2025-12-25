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
/////////taget search///////////////////////////
const searchInput = document.querySelector('.search>input');
const historySearch = document.querySelector('.lichsu_timkiem');
// console.log('search');
searchInput.addEventListener('focus', () => {
    historySearch.style.display = 'block';
})
document.addEventListener('click', (e) => {
    if (!historySearch.contains(e.target) && e.target !== searchInput) {
        historySearch.style.display = 'none';
    }
})
////////////////////////////////////////////////
////////////////convert to VND/////////////////////////
function formatCurrency(number){
    return number.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}
///////////////////////////////////////////////////////
////////////////add to Cart/////////////////////////
let list = JSON.parse(localStorage.getItem('cart')) || [];
console.log('cart');
console.log(list);
function addToCart(item){
    item.quantity = 1;
    const amountSP = document.querySelector('.amount_sp');
    if (amountSP) {
        // console.log(1);
        // console.log(amountSP.value);
        item.quantity = Number(amountSP.value);
    }
    else {
        // console.log(0);
    }
    // console.log(item.quantity);
    if (list == null){
        list = [item];
    }
    else{
        let exist = false;
        for (let temp of list) {
            if (temp.id === item.id){
                temp.quantity += Number(item.quantity);
                exist = true;
                break;
            }
        }
        if (!exist){
            list.push(item);
        }
    }
    localStorage.setItem('cart', JSON.stringify(list));
    console.log('+1 SP');
    console.log(list);
}
/////////////////load Cart//////////////////////////
function loadCart(){
    var str ='';
    var totalPrice = 0;
    for (item of list) {
        totalPrice += item.priceSale * item.quantity;
        str += `
            <tr>
                <td class="product_Cart">
                    <div class="imgCart">
                        <a href="`+ item.url + `">
                            <img src="`+ item.image + `" alt="">
                        </a>
                    </div>
                    <div class="titleCart"><h3><a href="`+ item.url + `">`+ item.name + `</a></h3></div>
                </td>
                <td>
                    <div class="pricesCart Clearfix" >
                        <div class="priceCart_original"><s>`+ formatCurrency(item.priceOriginal) + `</s></div>
                        <div class="priceCart_sale">`+ formatCurrency(item.priceSale) + `</div>
                    </div>
                </td>
                <td>
                    <div class="amount_container" style="height: 30px;">
                        <div class="btn_amount">
                            <button onclick="minusCart(`+ item.id + `)" class="down_amount"><i class="fa-solid fa-minus"></i></button>
                            <input id="quantity_`+ Number(item.id) + `" onchange="updateQuantity(` + item.id + `)" class="amount_sp" type="number" pattern="[0-9]*" oninput="updateQuantityInput(`+ Number(item.id) + `)" value="`+ item.quantity + `">
                            <button onclick="plusCart(`+ item.id + `)" class="up_amount"><i class="fa-solid fa-plus"></i></button>
                        </div>
                    </div>
                </td>
                <td><div class="total_priceCart">`+ formatCurrency(item.priceSale * item.quantity) + `</div></td>
                <td><div class="btn_remove"><i onclick="removeCart(`+ item.id + `)" class="fa-regular fa-circle-xmark"></i></div></td>
            </tr>
        `;
    }
    document.querySelector('.listCart').innerHTML = str;
    document.querySelector('.price_temp').textContent = formatCurrency(totalPrice);
    document.querySelector('.price_result').textContent = formatCurrency(totalPrice);
}
////////////////////////////////////////////////////
////////////////////////////////////////////////////
////////////////clear Cart//////////////////////////
function clearCart(){
    localStorage.setItem('cart', null);
    loadCart();
    location.reload();
    console.log(list);
    console.log('clear');
}
////////////////////////////////////////////////////
////////////////remove Cart//////////////////////////
function removeCart(id){
    var index = list.findIndex(item => item.id == id);
    if (index >= 0){
        list.splice(index, 1);
        console.log('remove');
        console.log(list);
    }
    loadCart();
    updateCart();
}
/////////////////////////////////////////////////////
////////////////update Cart//////////////////////////
function updateCart(){
    localStorage.setItem('cart', JSON.stringify(list));
    location.reload();
    // alert(list);
    // alert('update');
}
function plusCart(id){
    var index = list.findIndex(item => item.id == id);
    if (index >= 0) {
        if (list[index].quantity < 99) {
            list[index].quantity += 1;
        }
    }
    loadCart();
    updateCart();
}
function minusCart(id){
    var index = list.findIndex(item => item.id == id);
    if (index >= 0) {
        if (list[index].quantity > 1) {
            list[index].quantity -= 1;
        }
    }
    loadCart();
    updateCart();
}
function updateQuantity(id){
    var quantity = Number(document.getElementById('quantity_' + id).value);
    // console.log('update quantity');
    console.log(quantity);
    var index = list.findIndex(item => item.id == id);
    if (index >= 0 && list[index].quantity >= 1) {
        list[index].quantity = quantity;
    }
    loadCart();
    updateCart();
}
function updateQuantityInput(id) {
    // console.log("oninput");
    let quantityInput = document.getElementById('quantity_' + id);
    const min = 1;
    const max = 99;
    const index = list.findIndex(item => item.id == id);

    if (index >= 0) {
        quantityInput.addEventListener('input', () => {
            let quantity = Number(quantityInput.value);
            // console.log("next");
            // Giới hạn giá trị trong khoảng min và max
            if (quantity < min) {
                quantity = min;
            }
            else if (quantity > max) {
                quantity = max;
            }
            // Cập nhật giá trị input và danh sách
            quantityInput.value = quantity;
            list[index].quantity = quantity;
            // Load lại giỏ hàng
            loadCart();
            updateCart();
        });
    }
}
/////////////////////////////////////////////////////
loadCart();