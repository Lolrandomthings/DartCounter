// får poenger
const kast1 = document.getElementById('kast1').value;
const kast2 = document.getElementById('kast2').value;

//lagrer den i LocalStorage 
localStorage.setItem('kast1', kast1);
localStorage.setItem('kast2', kast2);

window.onload = function () {
    document.getElementById('kast1').value = localStorage.getItem('kast1') || '';
    document.getElementById('kast2').value = localStorage.getItem('kast2') || '';
};