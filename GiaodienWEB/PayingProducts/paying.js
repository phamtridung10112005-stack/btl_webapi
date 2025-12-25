function formatCurrency(number){
    return number.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}
/////////taget search///////////////////////////
const searchInput = document.querySelector('.search input');
const historySearch = document.querySelector('.lichsu_timkiem');
searchInput.addEventListener('focus', () => {
    historySearch.style.display = 'block';
})
document.addEventListener('click', (e) => {
    if (!historySearch.contains(e.target) && e.target !== searchInput) {
        historySearch.style.display = 'none';
    }
})
////////////////////////////////////////////////
const userInfor = JSON.parse(localStorage.getItem('loggedInUser'));
var list = JSON.parse(localStorage.getItem('cart'));
console.log(userInfor);
// function loadPay(listProPay) {
//     window.location.href = '../PayingProducts/paying.html';
//     // const amountSP = document.querySelector('.amount_sp');
//     document.querySelector('.inforuser_name').textContent = userInfor.nameaccount;
//     document.querySelector('.inforuser_mail').textContent = userInfor.email;
//     var totalPriceProPay = 0;
//     // let quantityPay;
//     // if (amountSP) {
//     //     // console.log(1);
//     //     // console.log(amountSP.value);
//     //     quantityPay = Number(amountSP.value);
//     // }
//     // else {
//     //     console.log(0);
//     //     quantityPay = 1;
//     // }
//     for (let itemProPay of listProPay) {
//         if (itemProPay.quantity) {
//             quantityPay = itemProPay.quantity;
//             totalPriceProPay += itemProPay.pricen * itemProPay.quantity;
//         }
//         else {
//             totalPriceProPay += itemProPay.price * quantityPay;
//         }
//         strPay += `
//             <div class="item_ProductPay">
//                 <div class="item_ProductPay_img">
//                     <img src="`+ itemProPay.image + `" alt="">
//                     <div class="soluongProPay">`+ quantityPay + `</div>
//                 </div>
//                 <div class="item_ProductPay_text">
//                     `+ itemProPay.name + `
//                 </div>
//                 <div class="item_ProductPay_price">`+ formatCurrency(itemProPay.price) + `</div>
//             </div>
//         `;
//         document.querySelector('.listProductsPay').innerHTML = strPay;
//         document.querySelector('.totalPricePay_money').textContent = formatCurrency(totalPriceProPay);
//     }
// }
function Paying(){
    const name = document.getElementById('text_name').value;
    const sdt = document.getElementById('sdt').value;
    const gmail = document.getElementById('gmail').value;
    const diachi = document.getElementById('diachi').value;
    const typePay = document.getElementById('typePay').value;
    if (name === '') {
        document.querySelector('.erro_inputPay_name').style.display = 'block';
    }
    else{
        document.querySelector('.erro_inputPay_name').style.display = 'none';
    }
    if (sdt === '') {
        document.querySelector('.erro_inputPay_sdt').style.display = 'block';
    }
    else{
        document.querySelector('.erro_inputPay_sdt').style.display = 'none';
    }
    if (gmail === '') {
        document.querySelector('.erro_inputPay_gmail').style.display = 'block';
    }
    else{
        document.querySelector('.erro_inputPay_gmail').style.display = 'none';
    }
    if (diachi === '') {
        document.querySelector('.erro_inputPay_diachi').style.display = 'block';
    }
    else{
        document.querySelector('.erro_inputPay_diachi').style.display = 'none';
    }
    if (typePay === '') {
        document.querySelector('.erro_inputPay_typePay').style.display = 'block';
    }
    else{
        document.querySelector('.erro_inputPay_typePay').style.display = 'none';
    }
}
function loadData(){
    const isLogIn = localStorage.getItem('isLogIn');
    if (isLogIn)
    {
        console.log('isLogIn');
        console.log(list);
        document.querySelector('.inforuser_name').textContent = userInfor.nameaccount;
        document.querySelector('.inforuser_mail').textContent = userInfor.email;
        var strloadPay = '';
        var totalPay = 0;
        for (item of list){
            totalPay += item.priceSale * item.quantity;
            strloadPay += `
                <div class="item_ProductPay">
                    <div class="item_ProductPay_img">
                        <img src="`+ item.image + `" alt="">
                        <div class="soluongProPay">`+ item.quantity + `</div>
                    </div>
                    <div class="item_ProductPay_text">
                        `+ item.name + `
                    </div>
                    <div class="item_ProductPay_price">`+ formatCurrency(item.priceSale) + `</div>
                </div>
            `;
        }
        document.querySelector('.listProductsPay').innerHTML = strloadPay;
        document.querySelector('.totalPricePay_money').textContent = formatCurrency(totalPay);
    }
    else {
        console.log(0);
        console.log(isLogIn);
        window.location.href = '../Login/dangnhap.html';
    }
    
}
loadData();