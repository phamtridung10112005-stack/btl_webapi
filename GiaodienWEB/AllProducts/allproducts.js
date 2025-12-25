// //////Them vao gio hang message
// let timeAutoHide = 5;
// let canClick = true;
// function AutoHide(item){
//     // console.log('auto hide');
//     console.log(window.scrollY);
//     if (timeAutoHide === 0){
//         canClick = true;
//         timeAutoHide = 5;
//         item.style.transform = `translateY(${-100 - window.scrollY}px)`;
//         return;
//     }
//     else{
//         timeAutoHide--;
//         item.style.opacity = timeAutoHide * 0.2;
//         setTimeout(() => AutoHide(item), 1000);
//         // console.log(timeAutoHide);
//     }
// }
// const listbtn_addToCart = document.querySelectorAll('.fa-cart-plus');
// const addToCart_message = document.getElementById('addToCart_message');
// listbtn_addToCart.forEach((btn_addToCart) => {
//     btn_addToCart.addEventListener('click', () => {
//         // console.log(canClick);
//         if (!canClick){
//             return;
//         }
//         canClick = false;
//         timeAutoHide = 5;
//         addToCart_message.style.transform = `translateY(${+100 + window.scrollY}px)`;
//         AutoHide(addToCart_message);
//     });
// });
// /////////////////////////////////
// /////////taget search///////////////////////////
// const searchInput = document.querySelector('.search input');
// const historySearch = document.querySelector('.lichsu_timkiem');
// searchInput.addEventListener('focus', () => {
//     historySearch.style.display = 'block';
// })
// document.addEventListener('click', (e) => {
//     if (!historySearch.contains(e.target) && e.target !== searchInput) {
//         historySearch.style.display = 'none';
//     }
// })
// ////////////////////////////////////////////////