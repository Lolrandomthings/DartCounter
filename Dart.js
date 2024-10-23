document.getElementById("clickButton").addEventListener("click", function() {
    // Samle data fra tabellen
    let tableData = [];
    let rows = document.querySelectorAll("tbody tr");

    rows.forEach(row => {
        let rowData = [];
        let cells = row.querySelectorAll("th, td");  // Velger både th og td
        cells.forEach(cell => {
            rowData.push(cell.textContent.trim());  // Få innholdet i hver celle
        });
        tableData.push(rowData);
    });

    // Lagrer data fra tabellen inn i localstorage
    localStorage.setItem("dartTableData", JSON.stringify(tableData));// lagrer data som en JSON string
    alert("Dataene er lagret");
});

// Laster de lagrede dataene
window.onload = function() {
    if (localStorage.getItem("dartTableData")) {
        let tableData = JSON.parse(localStorage.getItem("dartTableData")); 
        let rows = document.querySelectorAll("tbody tr");

        tableData.forEach((rowData, index) => {
            let cells = rows[index].querySelectorAll("th, td");
            rowData.forEach((cellData, cellIndex) => {
                cells[cellIndex].textContent = cellData;
            });
        });
    }
};




