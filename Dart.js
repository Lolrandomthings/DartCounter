window.onload = function () {
    document.getElementById('kast1').value = localStorage.getItem('kast1') || 0;
    document.getElementById('kast2').value = localStorage.getItem('kast2') || 0;
};


document.getElementById('clickButton').addEventListener('click', function() {
console.log("endringer ble lagret")

// får poenger
const kast1 = document.getElementById('kast1').value;
const kast2 = document.getElementById('kast2').value; // Hente informasjon fra conteneditable RADEAAAAAAAAAAAAH

//lagrer den i LocalStorage 
localStorage.setItem('kast1', kast1);
localStorage.setItem('kast2', kast2);

});



